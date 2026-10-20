# z-jelly

A transparent fruit-jelly interaction study with a continuous cyan/lilac backdrop, no decorative background objects, and a minimal two-theme interface.

## Run

```sh
npm ci
npm run dev
```

Drag the cup, release to return, press S to shake; drag outside the cup to orbit and scroll to zoom. Published site: https://z-jelly-zyz90421034.zyz90421034.chatgpt.site

## Implementation

The active entry is `src/main-v2.js`. `src/interaction.js` uses meter-scale bounded spring following and rocking; `src/physics-v2.js` is an independent coarse volumetric displacement lattice. `src/art-v2.js` composites opaque content, liquid, and painted glass in separate WebGL passes.

Build with `npm run build`. GitHub Pages-ready output is retained in `docs/`. The public site is hosted on Sites and must be republished when source changes.

## Attribution and limits

The current comparison build uses publicly delivered cup/fruit GLBs, painted normal maps and placement data from [Jelly Painting by mesq](https://mesq.me/jelly-painting/). See [ASSET-CREDITS.md](ASSET-CREDITS.md); no license to these assets is granted by this project. The prior independent simplified artwork modules are retained as legacy references but are not the active entry.

Input and physics parameters are calibrated from the prior analysis. The original WebGPU/TSL pipeline has not been reproduced byte-for-byte, and exact rendering or numerical equivalence is not claimed.
