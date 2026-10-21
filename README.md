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

The plus card now runs entirely in the visitor's browser. A small locally hosted MobileNet classifier recognizes common object categories; a BlazeFace detector provides face-box evidence for the person recipe. Color sampling extracts the subject palette. Named object-part grammars then create separate rounded low-poly primitives: for example, a burger is buns, patty, cheese and lettuce; an animal is body, head, ears, limbs and tail. This is semantic classification followed by procedural assembly, not dense photo reconstruction or an inflated silhouette. Uploaded images are not sent to a server.

TensorFlow.js uses the visitor's WebGL GPU where available and can use its CPU otherwise. Recognition weights are about 9 MB, hosted under `public/local-vision/`; first use downloads these static assets, with no GPU backend or tunnel required. The viewer adds the shared jelly material, physics, Q thumbnail and matching pastel backdrop. Generated studies live only in the current page's memory. Refreshing or reopening starts with the two original models; old browser records are neither loaded nor updated.

Supported recipes currently cover people with a clearly detected face, common animals, birds, fish, burgers, desserts, fruit, bottles/cups, plants, cars, chairs, shoes, bags, cameras and houses. This lightweight classifier is not a general visual-language reasoning model: classification and appearance can be wrong, and a single family shares a stylized construction grammar. Low-confidence or unsupported results are rejected. Complex backgrounds, unusual objects and small faces reduce accuracy. Physical-phone testing remains necessary; no universal device compatibility or exact photo resemblance is claimed.

`src/local-object-analysis.js` handles local vision and `src/semantic-recipes.js` contains the object grammar and primitive builder. The old [server/README.md](server/README.md) and GPU service are retained as optional legacy tools; the current frontend never calls them. Asset provenance and licenses are in [public/local-vision/NOTICE.md](public/local-vision/NOTICE.md).

The original artwork before this feature is retained on branch [`snapshot/pastel-jelly-2026-10-20`](https://github.com/zyz90421034-art/z-jelly/tree/snapshot/pastel-jelly-2026-10-20).
