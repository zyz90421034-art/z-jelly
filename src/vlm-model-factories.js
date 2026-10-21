// SmolVLM-500M uses these exact components; no architecture auto-registry is needed.
export {GPT2Tokenizer as AutoTokenizer} from '../node_modules/@huggingface/transformers/src/models/gpt2/tokenization_gpt2.js';
export {Idefics3ImageProcessor as AutoImageProcessor} from '../node_modules/@huggingface/transformers/src/models/idefics3/image_processing_idefics3.js';
