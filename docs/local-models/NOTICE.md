# Device-side visual language model

Model: HuggingFaceTB/SmolVLM-500M-Instruct, Apache License 2.0.
Source: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
Pinned revision: a7da5b986cb59b408707209984f360a5f4ad7e47.

Only the q8 embedding, q4 vision encoder and q4 decoder ONNX variants are distributed here. The original ONNX bytes are split into 8 MiB files for GitHub distribution. `manifest.json` records the source revision, complete-file SHA-256 hashes and per-shard SHA-256 hashes. No model weights have been retrained or altered.

Inference: Transformers.js 4.3.1 (Apache-2.0) and its ONNX Runtime Web build (MIT), bundled for device-side WASM execution. Runtime sources: https://github.com/huggingface/transformers.js and https://github.com/microsoft/onnxruntime.

The photos are processed in the visitor's browser. HTTP requests retrieve static model/configuration/runtime files from the same website; there is no hosted inference API. Model-file caches contain public weights only. Generated studies live in page memory and are not restored after refresh.

Geometry is built by this project's constrained part grammar after visual description and prompt construction. This is not an unrestricted text-to-3D generator.
