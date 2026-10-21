import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
function browserVision(){return {name:'browser-only-vision-runtime',enforce:'pre',resolveId(source,importer){
 if(importer?.endsWith('/idefics3/processing_idefics3.js')&&(source.endsWith('/auto/tokenization_auto.js')||source.endsWith('/auto/image_processing_auto.js')))return fileURLToPath(new URL('./src/vlm-model-factories.js',import.meta.url));
 if(source==='sharp'||source.startsWith('node:')||source==='./onnx-node.js'&&importer?.includes('/backends/'))return fileURLToPath(new URL('./src/vlm-browser-shim.js',import.meta.url));
 if(source==='onnxruntime-web/webgpu'||source==='onnxruntime-common'&&importer?.includes('/@huggingface/transformers/src/'))return fileURLToPath(new URL('./node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs',import.meta.url));
}};}
export default defineConfig({base:'./',build:{minify:false},plugins:[browserVision()],worker:{format:'es',plugins:()=>[browserVision()]},server:{proxy:{'/api':'http://127.0.0.1:7861','/generated':'http://127.0.0.1:7861'}}});
