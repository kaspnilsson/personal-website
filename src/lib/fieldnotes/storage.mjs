import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const queues = new Map();
export function reviewStorageKey(inventory) { return `fieldnotes:v1:review:${createHash('sha256').update(inventory).digest('hex')}`; }
const CAS = "local value=redis.call('GET',KEYS[1]); if (not value and ARGV[1]=='__ABSENT__') or value==ARGV[1] then redis.call('SET',KEYS[1],ARGV[2]); return 1 end; return 0";
const EXPIRING_CAS = "local value=redis.call('GET',KEYS[1]); if (not value and ARGV[1]=='__ABSENT__') or value==ARGV[1] then redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3]); return 1 end; return 0";

export class RedisStore {
  constructor(url, token, transport = fetch) { this.url = url; this.token = token; this.transport = transport; }
  async command(command) {
    const response = await this.transport(this.url, { method: 'POST', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store' });
    if (!response.ok) throw new Error('Private collection storage is unavailable.');
    const data = await response.json();
    if (data.error) throw new Error('Private collection storage is unavailable.');
    return data.result;
  }
  async get(key) { return this.command(['GET', key]); }
  async getMany(keys) { return keys.length ? this.command(['MGET', ...keys]) : []; }
  async compareAndSwap(key, previous, next, ttlSeconds = null) {
    if (ttlSeconds !== null && (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1)) throw new Error('Invalid storage expiry.');
    const command = ['EVAL', ttlSeconds === null ? CAS : EXPIRING_CAS, '1', key, previous ?? '__ABSENT__', next];
    if (ttlSeconds !== null) command.push(String(ttlSeconds));
    return await this.command(command) === 1;
  }
}

// Development only. Production always requires the durable Redis binding.
export class LocalStore {
  constructor(directory) { this.directory = resolve(directory); }
  path(key) { return resolve(this.directory, `${createHash('sha256').update(key).digest('hex')}.json`); }
  async get(key) { try { return await readFile(this.path(key), 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
  async getMany(keys) { return Promise.all(keys.map(key => this.get(key))); }
  async compareAndSwap(key, previous, next) {
    const priorJob = queues.get(key) ?? Promise.resolve();
    const job = priorJob.then(async () => {
      if (await this.get(key) !== previous) return false;
      await mkdir(this.directory, { recursive: true });
      const target = this.path(key), temporary = `${target}.${crypto.randomUUID()}.tmp`;
      await writeFile(temporary, next); await rename(temporary, target); return true;
    });
    queues.set(key, job.catch(() => {}));
    return job;
  }
}
export function configuredStore(env = process.env) {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && new URL(url).protocol === 'https:') return new RedisStore(url, token);
  if (env.NODE_ENV !== 'production' && env.FIELDNOTES_LOCAL_STORE) return new LocalStore(env.FIELDNOTES_LOCAL_STORE);
  throw new Error('Private collection storage is not configured.');
}
