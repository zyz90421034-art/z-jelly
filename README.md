# z-jelly

A transparent fruit-jelly interaction study with a continuous cyan/lilac backdrop, no decorative background objects, and a minimal illustrated study cards and image-to-3D creation.

## Run

```sh
npm ci
npm run dev
```

Drag the cup, release to return, press S to shake; drag outside the cup to orbit and scroll to zoom. GitHub Pages: https://zyz90421034-art.github.io/z-jelly/

## Implementation

The active entry is `src/main-v2.js`. `src/interaction.js` uses meter-scale bounded spring following and rocking; `src/physics-v2.js` is an independent coarse volumetric displacement lattice. `src/art-v2.js` composites opaque content, liquid, and painted glass in separate WebGL passes.

Build with `npm run build`. GitHub Pages-ready output is retained in `docs/`. Publish `docs/` from main in GitHub Pages. It contains the built frontend and model-service configuration.

## Attribution and limits

The current comparison build uses publicly delivered cup/fruit GLBs, painted normal maps and placement data from [Jelly Painting by mesq](https://mesq.me/jelly-painting/). See [ASSET-CREDITS.md](ASSET-CREDITS.md); no license to these assets is granted by this project. The prior independent simplified artwork modules are retained as legacy references but are not the active entry.

Input and physics parameters are calibrated from the prior analysis. The original WebGPU/TSL pipeline has not been reproduced byte-for-byte, and exact rendering or numerical equivalence is not claimed.

## Image-to-3D

The plus card accepts an image. The backend uses [rembg](https://github.com/danielgatis/rembg) to isolate the salient foreground, then [TripoSR](https://github.com/VAST-AI-Research/TripoSR) to reconstruct colored geometry. The viewer softens the shape, groups surface colors into a cartoon palette, adds jelly-like transmission and highlights, generates a Q-style thumbnail, and saves the result in the visitor's IndexedDB.

See [server/README.md](server/README.md) for GPU setup, CPU fallback, the API and deployment. `public/model-service.json` supplies the public HTTPS backend (or override with `VITE_MODEL_API_URL`). GitHub Pages cannot run inference itself. The current Quick Tunnel URL is temporary and requires the local backend and tunnel to stay online. No API keys belong in the frontend.

The original artwork before this feature is retained on branch [`snapshot/pastel-jelly-2026-10-20`](https://github.com/zyz90421034-art/z-jelly/tree/snapshot/pastel-jelly-2026-10-20).
