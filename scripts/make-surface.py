# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = ["numpy==2.2.6", "scipy==1.15.3", "pillow==11.3.0"]
# ///
"""The site's one surface, taken from the Renders master bus (drafts/design/hillclimb-2026-11-03/shared/master.py).

The master bus puts one grain, a few pinholes and specks, and one uneven exposure over a whole
poster, solids and paper included, so type and picture sit in one space. A web page cannot be
re-rendered through it, so this bakes the same noise into two tiles that sit over the whole page:

  grain.png   tileable toner grain, pinholes and specks: the bus's "noise" and solids steps
  room.png    one low-frequency exposure field, tiled at page width: the bus's "room"

Both are ink on transparent ground and tile seamlessly. Like print, they move with the page.
The output is deterministic.

  uv run scripts/make-surface.py [grain strength, default 0.055] [grain file name]
"""
import pathlib
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "assets" / "kasp" / "surface"
INK = (18, 17, 16)


def clumped(rng, shape, r):
    n = gaussian_filter(rng.standard_normal(shape), r, mode="wrap")
    return n / (n.std() + 1e-9)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(3)

    # Grain: the bus mixes fine and clumped toner, 0.6 and 0.4, at radii 0.65 and 1.5.
    size = 384
    grain = 0.6 * clumped(rng, (size, size), 0.65) + 0.4 * clumped(rng, (size, size), 1.5)
    strength = float(sys.argv[1]) if len(sys.argv) > 1 else 0.055
    alpha = np.clip(grain * strength, 0, 1)
    # Specks on the paper where the noise runs deep, as in the bus's solids step.
    holes = clumped(rng, (size, size), 0.8)
    alpha = np.where(holes < -3.0, 0.55, alpha)
    alpha = gaussian_filter(alpha, 0.35, mode="wrap")
    rgba = np.zeros((size, size, 4), np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = np.round(np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(rgba).save(OUT / (sys.argv[2] if len(sys.argv) > 2 else "grain.png"), optimize=True)

    # Room: one uneven exposure. The bus blurs noise at radius 150 on a 1080 px poster; this
    # 96 px field is tiled at the page's width, so radius 10 keeps that scale. It wraps, so it tiles.
    small = 96
    field = clumped(rng, (small, small), 10)
    room = np.clip(0.05 + 0.03 * field, 0, 1)
    rgba = np.zeros((small, small, 4), np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = np.round(room * 255).astype(np.uint8)
    Image.fromarray(rgba).save(OUT / "room.png", optimize=True)


if __name__ == "__main__":
    main()
