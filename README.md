# z-jelly

An interactive, painted jelly cup made with Three.js. Procedural fruit, translucent jelly, brush textures and a paper-like finish. No external models or runtime asset services.

## Run

```sh
npm ci
npm run dev
```

Drag the jelly and release to wobble. Drag the background to orbit, scroll to zoom, or press **S** to shake. The three small paintings change the flavor.

## Build and publish

```sh
npm run build
```

The site uses relative asset paths for GitHub Pages. The `docs/` folder contains the published build. After changing source, rebuild and replace `docs/` with `dist/` contents, preserving `docs/.nojekyll`, then push to `main`.

## Implementation

- `src/physics.js`: independent layered spring simulation.
- `src/main.js`: deformation, interaction and flavor controls.
- `src/art.js`: procedural models, brush maps, translucency and painting post-processing.
- `src/style.css`: minimal paper canvas layout.

Art direction is inspired by [Jelly Painting by mesq](https://mesq.me/jelly-painting/). The geometry, procedural textures and reduced spring implementation here are independently created; the original site's models, textures and source are not included.
