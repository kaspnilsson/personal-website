import assets from '@/lib/fieldnotes/assets.json';
import { privateHeaders } from '@/lib/fieldnotes/http.mjs';

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const content = (assets as Record<string, string>)[file];
  if (!Object.hasOwn(assets, file) || typeof content !== 'string' || file === 'index.html') return new Response('Not found', { status: 404 });
  return new Response(content, { headers: { ...privateHeaders, 'Content-Type': `${file.endsWith('.css') ? 'text/css' : 'text/javascript'}; charset=utf-8` } });
}
