# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["numpy==2.2.6", "scipy==1.15.3", "pillow==11.3.0"]
# ///
"""The site's one surface, taken from the Renders master bus (drafts/design/hillclimb-2026-11-03/shared/master.py).

The master bus puts one grain, a few specks, and one uneven exposure over a whole poster,
solids and paper included, so type and picture sit in one space. A web page cannot be
re-rendered through it, so this bakes the same noise into tiles that sit in the page's paper:

  grain-a.png, grain-b.png   toner grain and specks: the bus's "noise" and solids steps. Two
                             tiles of unrelated sizes (384 and 263 px) are layered so the grain
                             never visibly repeats, at a fraction of the weight of one big tile.
  room.png                   one low-frequency exposure field, tiled at page width: the "room"

All are ink on transparent ground, tile seamlessly and move with the page like print.
The output is deterministic.

  uv run scripts/make-surface.py
"""
import pathlib

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "assets" / "kasp" / "surface"
INK = (18, 17, 16)


def clumped(rng, shape, r):
    n = gaussian_filter(rng.standard_normal(shape), r, mode="wrap")
    return n / (n.std() + 1e-9)


def save(alpha, name, levels=64):
    # Only the alpha varies: store grey plus alpha, with the alpha rounded to a few levels,
    # which looks the same and compresses several times smaller than full precision.
    h, w = alpha.shape
    la = np.zeros((h, w, 2), np.uint8)
    la[..., 0] = INK[0]
    step = 255 / (levels - 1)
    la[..., 1] = (np.round(np.clip(alpha, 0, 1) * 255 / step) * step).astype(np.uint8)
    Image.fromarray(la, "LA").save(OUT / name, optimize=True)


def grain(rng, size, strength, speck):
    # The bus mixes fine and clumped toner, 0.6 and 0.4, at radii 0.65 and 1.5.
    g = 0.6 * clumped(rng, (size, size), 0.65) + 0.4 * clumped(rng, (size, size), 1.5)
    alpha = np.clip(g * strength, 0, 1)
    # Sparse specks where the noise runs deep, as in the bus's solids step.
    holes = clumped(rng, (size, size), 0.8)
    alpha = np.where(holes < speck, 0.45, alpha)
    return gaussian_filter(alpha, 0.35, mode="wrap")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(3)

    save(grain(rng, 384, 0.024, -3.75), "grain-a.png")
    save(grain(rng, 263, 0.018, -3.95), "grain-b.png")

    # Room: one uneven exposure. The bus blurs noise at radius 150 on a 1080 px poster; this
    # 96 px field is tiled at the page's width, so radius 10 keeps that scale. It wraps, so it tiles.
    small = 96
    field = clumped(rng, (small, small), 10)
    save(np.clip(0.03 + 0.018 * field, 0, 1), "room.png")


if __name__ == "__main__":
    main()
