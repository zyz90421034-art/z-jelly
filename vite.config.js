import {defineConfig} from 'vite';
export default defineConfig({base:'./',server:{proxy:{'/api':'http://127.0.0.1:7861','/generated':'http://127.0.0.1:7861'}}});
