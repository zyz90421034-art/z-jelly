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

The plus card runs entirely in the visitor's browser. A self-hosted **SmolVLM-500M-Instruct** visual-language model first names the subject, then describes its parts, colors and pose. The app writes a modeling prompt from that analysis and the sampled image palette. A constrained prompt compiler selects supported part grammars and computes the geometry. Components are separate rounded low-poly volumes; there is no traced photo silhouette or dense image reconstruction. Uploaded images are not sent to a server.

Transformers.js 4.3.1 runs visual inference in a WASM worker on the visitor's CPU, while Three.js renders the jelly scene on the visitor's GPU. This avoids the quantized WebGPU inference corruption observed during development and does not require shader-f16, your computer, an API key or an inference backend. The model is fetched only after the visitor starts generation. Its selected weights total 343 MB; configuration, tokenizer and WASM runtime bring the initial transfer to roughly 360 MB. Weights are split into 8 MiB shards, SHA-256 checked and cached where browser storage permits. `public/local-models/` is included in the GitHub Pages build. Cancellation terminates the worker.

Supported grammars cover people, common animals, birds, fish, burgers, desserts, fruit, bottles/cups, plants, cars, chairs, shoes, bags, cameras and houses. The generated description can affect details such as onion/pickles, hats/glasses and cup handles. Horses use a distinct four-legged assembly, and drinking cups are hollow lathed geometry. **The numeric layout comes from project rules, not unrestricted model-written 3D code.** Unsupported subjects are rejected. Visual descriptions can be wrong, and arbitrary objects or poses are not guaranteed. The attempted tiny text/code planners did not produce reliable general 3D layouts and are not part of the deployed workflow. Physical-phone testing remains necessary; low-memory devices may fail or run slowly.

The viewer applies the shared translucent jelly material, physics, Q thumbnail and matching pastel backdrop. Generated studies live only in the current page's memory. Refreshing or reopening starts with the two original models. Public model weights can remain cached; generated studies are not restored.

`src/local-object-analysis.js` starts the worker, `src/local-vlm.worker.js` performs local image understanding, `src/prompt-modeler.js` creates/compiles the prompt, and `src/semantic-recipes.js` builds the part geometry. Model provenance is in [public/local-models/NOTICE.md](public/local-models/NOTICE.md). Optional reproducible source download: `python scripts/fetch-local-models.py <cache-dir>` followed by `node scripts/package-local-models.mjs <cache-dir>`. The normal repository already contains the packaged model shards. The old [server/README.md](server/README.md) and GPU service are legacy tools; the current frontend never calls them.

`src/vlm-runtime.js` registers only the Idefics3 architecture through a model-specific SDK adapter, and the Vite configuration excludes optional Node/GPU inference dependencies. Internal SDK imports are version-pinned and must be revalidated when upgrading Transformers.js.

The original artwork before this feature is retained on branch [`snapshot/pastel-jelly-2026-10-20`](https://github.com/zyz90421034-art/z-jelly/tree/snapshot/pastel-jelly-2026-10-20).
