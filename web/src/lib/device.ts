import type {Ward} from './model';
type NativeBridge={loadWard:()=>string;saveWard:(json:string)=>boolean;exportFile:(name:string,mime:string,data:string)=>boolean;setDarkMode?:(dark:boolean)=>void;isSystemDark?:()=>boolean};
declare global{interface Window{NicuDevice?:NativeBridge}}
const KEY='nicu-work-en-v1';
export function loadWard():string|null{const raw=window.NicuDevice?window.NicuDevice.loadWard():localStorage.getItem(KEY);if(raw==='!READ_ERROR')throw Error('Could not read device record');return raw||null;}
export function saveWard(ward:Ward){const json=JSON.stringify(ward);if(json.length>1500000)throw Error('Record is too large');if(window.NicuDevice){if(!window.NicuDevice.saveWard(json))throw Error('Device save failed');}else localStorage.setItem(KEY,json);}
export async function exportNativeFile(blob:Blob,name:string):Promise<boolean>{if(!window.NicuDevice)return false;if(blob.size>48*1024*1024)throw Error('Export is too large');const bytes=new Uint8Array(await blob.arrayBuffer());let bin='';for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));if(!window.NicuDevice.exportFile(name,blob.type,btoa(bin)))throw Error('An export is already open');return true;}
