import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:'web',base:'./',plugins:[react()],resolve:{alias:{'@':fileURLToPath(new URL('./web/src',import.meta.url))}},server:{host:'0.0.0.0',port:4173,allowedHosts:['terminal.local']},build:{outDir:'../android/app/src/main/assets/site',emptyOutDir:true,target:'es2020'}});
