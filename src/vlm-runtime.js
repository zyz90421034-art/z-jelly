// A model-specific adapter avoids shipping the SDK's registry of unrelated architectures.
// Internal imports are intentionally pinned to Transformers.js 4.3.1 in package-lock.json.
import {Idefics3ForConditionalGeneration} from '../node_modules/@huggingface/transformers/src/models/idefics3/modeling_idefics3.js';
import {Idefics3Processor} from '../node_modules/@huggingface/transformers/src/models/idefics3/processing_idefics3.js';
import {MODEL_TYPES,MODEL_TYPE_MAPPING,MODEL_NAME_TO_CLASS_MAPPING,MODEL_CLASS_TO_NAME_MAPPING,registerTaskMappings} from '../node_modules/@huggingface/transformers/src/models/modeling_utils.js';
const name='Idefics3ForConditionalGeneration';
MODEL_TYPE_MAPPING.set(name,MODEL_TYPES.ImageTextToText);
MODEL_TYPE_MAPPING.set('idefics3',MODEL_TYPES.ImageTextToText);
MODEL_NAME_TO_CLASS_MAPPING.set(name,Idefics3ForConditionalGeneration);
MODEL_CLASS_TO_NAME_MAPPING.set(Idefics3ForConditionalGeneration,name);
registerTaskMappings({MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES:new Map([['idefics3',name]])});
export {Idefics3Processor,Idefics3ForConditionalGeneration};
export {RawImage} from '../node_modules/@huggingface/transformers/src/utils/image.js';
export {TextStreamer} from '../node_modules/@huggingface/transformers/src/generation/streamers.js';
export {env} from '../node_modules/@huggingface/transformers/src/env.js';
