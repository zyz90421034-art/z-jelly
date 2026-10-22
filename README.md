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

## Food scene blueprints (2026-10-22)

Coffee/cappuccino/tea cups, whole cakes, cake slices and cup desserts now use a separate evidence-to-blueprint path. A food-specific visual follow-up asks about component colors, layers, vessel shape, handles, plates, foam and toppings. `src/food-blueprint.js` converts the captions into a serializable part inventory with dimensions, material roles, construction order, spatial relations, observations and uncertainty notes. Named colors come from the recognized component descriptions; background selection compares the component colors against independent preset washes instead of copying the photograph colors. Unsupported legacy categories still use the earlier part grammars.

The compiler supports hollow lathed profiles, curved tubes/handles, extruded cake wedges, layered volumes and piped swirls. Liquid profiles taper to stay within the vessel. Glass and ceramic walls render after the contents and sample their completed image, while liquid, sponge/cream and fruit have separate material densities. These are stylized translucent materials, not physical fluid simulation. The shared thumbnail illustrator projects the real component silhouettes into painted color blocks for both original and uploaded studies; it no longer mixes hand-authored SVG cards with toon screenshots.

Validation checks numeric bounds, duplicate parts, finite geometry, part budgets and coffee containment. This is not an automatic visual similarity judge. Captions are still produced by the same 500M local VLM, and the blueprint compiler is constrained: it can miss a detail, miscount layers or fruit, and cannot reconstruct arbitrary topology or exact photographic proportions. Absent/unmentioned decorations are omitted; unspecified layer/fruit counts use noted design estimates. No cloud inference or larger model download was added. Food recognition adds a targeted inference pass and can take longer on slow devices.

Run `node --test tests/*test.mjs`, `npm run build`, then `node --experimental-vm-modules tests/browser-worker-smoke.mjs`. During local development, `/tests/blueprint-review.html` provides four visual fixtures plus the actual photo analysis path; this diagnostic page is not part of the deployed build.

## Measured cake reconstruction

For cakes, `src/cake-image-analysis.js` examines a 512-pixel image on the visitor's device. It separates warm sponge bands from pink fillings, samples thickness along multiple columns, and searches above the cut face for individual red fruit and dark round fruit regions. Reliable measurements override caption defaults. Separate cut-face and topping regions are used for local analysis; the small VLM receives short shape/topping/cream questions rather than a long general caption. If the measurements are unreliable, the compiler falls back to caption estimates and records that uncertainty.

`src/cake-blueprint.js` keeps each sponge/filling band, each whole or halved strawberry, and each blueberry as a separate part. It uses measured proportions and image placement, supports a curved side coating and piped border, and fits a contact graph for adjacent fruit regions. Rotated fruit bottoms are aligned to the icing with slight embedding, with soft contact shadows. Fruit proportions are rounded and squat. Generated cake leaves/calyxes/mint were removed at the user's request. Both the main model and the Q card use the same component geometry.

This is constrained image measurement plus local VLM interpretation, not a general segmentation network or unrestricted 3D reconstruction. It works best for clearly separated pale sponge/pink cream and simple backgrounds. Chocolate sponge, complex lighting, touching fruit of the same color, and hidden parts can remain ambiguous. Bounding-box adjacency is a 2D cue and does not recover true depth. The audit checks component coverage and geometric contact; it does not claim photorealistic or pixel-level similarity. The repository includes deidentified measurement fixtures, not the uploaded acceptance photograph.

The worker keeps initialized public model weights for 90 seconds after a successful generation, then releases them. Cancellation/error/page close terminates the worker immediately. Shorter bounded answers reduce decoding; subsequent uploads within the warm window avoid initialization. No photos or generated studies are saved across reloads. Timing diagnostics distinguish load time and total inference time. CPU/WASM inference can still take substantial time on phones; no universal speedup or mobile performance guarantee is claimed.

Validation: `node --test tests/cake-measurements.test.mjs tests/food-blueprint.test.mjs tests/prompt-modeler.test.mjs tests/semantic-recipes.test.mjs` (17 cases), production build and worker initialization smoke. Tests cover 2/3/4 measured layers, mixed berries, half-fruit geometry, adjacent-fruit fitting, contact with icing, leaf removal, and legacy category behavior.


Fruit drinks use a separate vessel / clear tinted liquid / interior fruit blueprint. Local pixel measurements supplement the small VLM's fruit names with colored region positions; they are not a general object segmentation model. Whole strawberries and blueberries have solid rounded volumes; half berries have a cut face and curved back; citrus and kiwi pieces have thickness, colored sides and group rotations. The render pipeline captures interior objects before the liquid and the glass, avoiding self-sampling render targets. Single-view depth, hidden surfaces and ambiguous fruit identities remain estimates. Plain coffee retains its existing recipe. Photos remain on the visitor's device and are not uploaded to GitHub.

Fruit drink layouts now settle rounded fruit solids against the inner cup floor and the previously settled fruit. A temporary geometric height field accounts for tilted cut faces and curved bodies; nearby depth offsets form a pile instead of copying isolated image heights. Every fruit records its support, and decoration moves rigidly with its parent fruit. This is an initial contact layout, not a continuous rigid-body/fluid simulation. The existing jelly deformation remains active during dragging.

Fruit detail now uses bounded procedural meshes: tapered strawberry bodies with seeds, cut-face veins, citrus rind/pith and separate flesh sectors, and kiwi cores with radial seeds. Layout evaluates several rigid orientations and nearby positions using the fruit center of mass and a support-contact polygon, allowing lower-energy poses and wall-supported leaning. It remains a deterministic contact-layout approximation, not a full rigid-body/fluid simulation. Detailed parts are shared by the renderer and settlement geometry, and the thumbnail treats clear glass/liquid as translucent.

Clear colored drinks apply a separate optical dye absorption to the transmitted scene. This deepens the center tint while retaining the existing surface density and refraction, instead of hiding interior fruit with an opaque pastel surface. Clear glass and the two original artwork shaders retain their previous settings. The view-facing term approximates optical path length; it is not volumetric ray tracing.

Generated backgrounds are chosen from independent art-directed sky, mint, lilac, rose, cream and sage washes, plus a deeper blue option for very pale objects. Model colors only rank foreground/background contrast and hue separation; they do not constrain the background to analogous sampled hues. The score considers transmitted liquid tint and prominent solid parts. Scene and thumbnail share the selected palette; the two original artwork themes keep their previous palette path.
