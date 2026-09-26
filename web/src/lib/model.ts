export type Drug={id:string;name:string;label:string;amount:number;volume:number;unit:string;diluent:string;note:string;page:string;sourceContainer?:boolean;separate?:boolean;maxConc?:number;blocked?:string;custom?:boolean};
const D=(id:string,name:string,amount:number,volume:number,note:string,page='2',extra:Partial<Drug>={}):Drug=>({id,name,amount,volume,note,page,unit:'mg',label:`${name} · ${amount} mg`,diluent:'N/S 0.9%',...extra});
export const DRUGS:Drug[]=[
 D('cefotaxime-1000','Cefotaxime',1000,10,'Claforan. The images assume 1000 mg in a final volume of 10 mL. Match the actual final concentration on your product; powder displacement may change the added diluent volume.','2, 8–10'),
 D('cefotaxime-500','Cefotaxime',500,5,'The image stock concentration is 100 mg/mL. Confirm the actual final volume after reconstitution.'),
 D('vancomycin-1000','Vancomycin',1000,20,'Stock: 50 mg/mL. The 5 mg/mL figure is an administration concentration. The cited product label uses water for injection for reconstitution, followed by dilution.','2',{maxConc:5}),
 D('vancomycin-500','Vancomycin',500,10,'Stock: 50 mg/mL. Do not use 5 mg/mL as the vial concentration. Follow the actual product reconstitution instructions.','2',{maxConc:5}),
 D('meropenem-500','Meropenem',500,10,'Image stock: 50 mg/mL. The image says discard promptly. Grouping doses requires product-specific stability at the actual concentration and temperature.'),
 D('meropenem-1000','Meropenem',1000,20,'Image stock: 50 mg/mL. Arithmetic alone does not establish all-day stability.'),
 D('ceftriaxone-1000','Ceftriaxone',1000,10,'Present in the images but disabled in this preterm-neonate calculator.','2',{blocked:'Ceftriaxone is contraindicated in premature neonates up to 41 weeks postmenstrual age, and in neonates requiring IV calcium. Clarify the prescription with the treating team.'}),
 D('ceftazidime-1000','Ceftazidime',1000,10,'Image stock: 100 mg/mL. Match final volume and powder displacement to the product label.'),
 D('omeprazole-40','Omeprazole',40,4,'Image stock: 40 mg / 4 mL. Some products require a supplied solvent and a different method. Verify the actual formulation.'),
 D('acyclovir-250','Acyclovir',250,10,'Stock: 25 mg/mL. The 7 mg/mL figure refers to the administration solution. Verify product-specific reconstitution.','3',{maxConc:7}),
 D('tazocin-4500','Piperacillin/tazobactam',4500,40,'The dose is the total of both ingredients. If prescribed as piperacillin alone, choose the piperacillin option. Final stock volume is taken from the image.','3',{unit:'mg total',label:'Tazocin · 4500 mg total'}),
 D('tazocin-pip4000','Piperacillin/tazobactam',4000,40,'The same 4.5 g vial contains 4000 mg piperacillin plus 500 mg tazobactam. Enter the piperacillin dose only.','3',{unit:'mg pip',label:'Tazocin · 4000 mg piperacillin'}),
 D('tazocin-2250','Piperacillin/tazobactam',2250,20,'The dose is the total of both ingredients. The image assumes a final volume of 20 mL.','3',{unit:'mg total',label:'Tazocin · 2250 mg total'}),
 D('colistin-33','Colistin (CBA)',33.3,2,'Stock: 16.65 mg CBA/mL, not 10. Do not enter mg CMS or IU here. The image 10 mg/mL value describes a later dilution.','3',{unit:'mg CBA',maxConc:10}),
 D('colistin-150','Colistin (CBA)',150,2,'Stock: 75 mg CBA/mL. No automatic conversion between CBA and CMS. Verify the product and dose basis.','3',{unit:'mg CBA',maxConc:10}),
 D('colistin-1miu','Colistin (IU)',1000000,2,'Enter the full international-unit count, not the number of millions. Match the vial unit.','3',{unit:'IU',label:'Colistin · 1,000,000 IU'}),
 D('colistin-45miu','Colistin (IU)',4500000,2,'Enter the full international-unit count, not the number of millions. Final volume is taken from the image.','3',{unit:'IU',label:'Colistin · 4,500,000 IU'}),
 D('keppra-500','Levetiracetam',500,5,'Stock: 100 mg/mL. A ready-made solution needs withdrawal and dilution, not reconstitution.','3',{label:'Keppra · 500 mg / 5 mL'}),
 D('caffeine-citrate','Caffeine citrate',60,3,'Stock: 20 mg/mL caffeine citrate. Uses the same dead-space formula, with no wash step. Confirm that GW means your approved D5W solution.','3, 5',{unit:'mg citrate',diluent:'D5W',label:'Caffeine citrate · 60 mg / 3 mL'}),
 D('caffeine-base','Caffeine base equivalent',30,3,'Base equivalent of the same 60 mg citrate / 3 mL ampoule: 10 mg base/mL. Enter a base dose only. No wash step.','3, 5',{unit:'mg base',diluent:'D5W',label:'Caffeine base · 30 mg / 3 mL'}),
 D('tigecycline-50','Tigecycline',50,50,'Withdraw from intermediate 1 mg/mL stock, not directly from powder. The image requires a separate microdrip for each dose. Initial reconstitution follows the product label.','4',{sourceContainer:true,separate:true,label:'Tigecycline · 50 mg / 50 mL intermediate'}),
 D('minocycline-100','Minocycline',100,100,'Intermediate 1 mg/mL stock in a source container. This does not mean adding 100 mL directly to the vial.','4',{sourceContainer:true,label:'Minocycline · 100 mg / 100 mL intermediate'}),
 D('luminal-200','Phenobarbital',200,20,'Image method: 200 mg / 1 mL ampoule plus 19 mL N/S to a final 20 mL. Intermediate stock: 10 mg/mL.','4',{sourceContainer:true,label:'Luminal · 200 mg / 20 mL intermediate'}),
 D('ambisome-50','Liposomal amphotericin B',50,50,'Withdraw from intermediate 1 mg/mL stock. AmBisome initial reconstitution: 12 mL water for injection to make 4 mg/mL, then a 5-micron filter and dilution with D5W. No saline. Not applicable to non-liposomal amphotericin.','4',{sourceContainer:true,diluent:'D5W',label:'AmBisome · 50 mg / 50 mL intermediate'}),
 D('phenytoin-250','Phenytoin',250,5,'The syringe method is incomplete in the supplied image.','5',{blocked:'The image uses a 5 mL syringe without a complete method. This microdrip formula is disabled for phenytoin; concentration, filter and rate require a separate approved protocol.'}),
 D('calcium','Calcium',0,0,'The calcium salt, ampoule strength and volume are missing. Clarify whether the dose is expressed as salt, elemental calcium or mEq. No 20 mg/mL limit is assumed without the salt identity.','3',{custom:true,diluent:'D5W',label:'Calcium · enter ampoule strength'}),
 D('aminophylline','Aminophylline',0,0,'Ampoule strength and volume are missing from the image. Enter the actual product values.','3',{custom:true,diluent:'D5W',label:'Aminophylline · enter strength'}),
 D('bicarbonate','Sodium bicarbonate',0,0,'The image states 1:1 without the ampoule strength. Enter the drug amount and final volume after the approved dilution. No automatic 1:1 dilution is applied.','3',{custom:true,diluent:'D5W',unit:'mEq',label:'NaHCO3 · enter strength'}),
 D('custom','Custom medication',0,0,'Enter the vial amount and final stock volume in the same unit as the prescribed dose.','user-defined',{custom:true,label:'Other drug / custom concentration'}),
];
export type Order={id:string;drugId:string;name:string;dose:string;unit:string;daily:number;perContainer:number;doseMl:string;deadMl:string;amount:string;sourceMl:string;diluent:string;sourceContainer:boolean;verified:boolean;note:string};
export type Patient={id:string;name:string;bed:string;orders:Order[]};
export type Room={id:string;name:string;patients:Patient[]};
export type Ward={schema:1;title:string;date:string;rooms:Room[]};
export function uid(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint32Array(4)),v=>v.toString(16).padStart(8,'0')).join('');}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Baghdad',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function emptyWard():Ward{return {schema:1,title:'NICU Ward',date:today(),rooms:[]};}
export function newOrder(id='cefotaxime-1000'):Order{const d=DRUGS.find(x=>x.id===id)!;return {id:uid(),drugId:id,name:d.name,dose:'',unit:d.unit,daily:3,perContainer:d.separate?1:3,doseMl:'20',deadMl:'10',amount:d.amount?String(d.amount):'',sourceMl:d.volume?String(d.volume):'',diluent:d.diluent,sourceContainer:!!d.sourceContainer,verified:false,note:''};}
export function number(value:unknown):number{if(typeof value!=='string')return NaN;const s=value.trim().replace(/[\u0660-\u0669]/g,x=>String(x.charCodeAt(0)-1632)).replace(/[\u06F0-\u06F9]/g,x=>String(x.charCodeAt(0)-1776)).replace(/\u066B/g,'.');return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;}
export function fmt(n:number):string{if(!Number.isFinite(n))return '—';if(n>0&&n<0.0001)return n.toExponential(4);return n.toLocaleString('en-US',{maximumFractionDigits:4,useGrouping:false});}
export type Batch={doses:number;factor:number;draw:number;diluent:number;finalMl:number;prepared:number;vials:number};
export type Calculation={ok:boolean;errors:string[];warnings:string[];batches:Batch[];concentration:number;finalConcentration:number;totalDraw:number;totalPrepared:number;doseTotal:number;deadAmount:number;adminSets:number;sourceSets:number;vials:number;patientMl:number};
export function ceilVials(n:number){const nearest=Math.round(n);return nearest>0&&Math.abs(n-nearest)<8*Number.EPSILON*Math.max(1,n)?nearest:Math.ceil(n);}
export function calculate(o:Order):Calculation{
 const errors:string[]=[],warnings:string[]=[];const d=DRUGS.find(d=>d.id===o.drugId);
 const dose=number(o.dose),amount=number(o.amount),source=number(o.sourceMl),doseMl=number(o.doseMl),dead=number(o.deadMl);
 if(!d)errors.push('Select a listed drug or a custom medication.');if(d?.blocked)errors.push(d.blocked);
 for(const [v,label] of [[dose,'Single dose'],[amount,'Drug amount per vial'],[source,'Final stock volume'],[doseMl,'Volume per dose']] as const)if(!Number.isFinite(v)||v<=0||v>1e9)errors.push(`${label}: enter a valid positive number.`);
 if(!Number.isFinite(dead)||dead<0||dead>150)errors.push('Device dead space must be between 0 and 150 mL.');
 if(![1,2,3].includes(o.daily)||![1,2,3].includes(o.perContainer))errors.push('Dose counts must be 1, 2 or 3.');
 if(d?.separate&&o.perContainer!==1)errors.push('This drug requires a separate microdrip for each dose in the image method.');
 if(!o.name.trim()||!o.unit.trim()||!o.diluent.trim())errors.push('Complete the drug name, unit and diluent.');
 if(d&&!d.custom&&o.unit!==d.unit)errors.push('The dose unit does not match the selected vial.');
 if(d?.id==='ambisome-50'&&o.diluent!=='D5W')errors.push('AmBisome requires D5W, not saline.');
 const concentration=amount/source,finalConcentration=dose/doseMl,batches:Batch[]=[];
 if(!errors.length){for(let left=o.daily;left>0;){const n=Math.min(left,o.perContainer),factor=n+dead/doseMl,prepared=dose*factor,draw=prepared/concentration,finalMl=n*doseMl+dead;
 if(finalMl>150)errors.push('The final volume exceeds 150 mL. Reduce the doses per microdrip.');
 if(draw>finalMl+1e-9)errors.push('Withdrawal volume exceeds final volume. Check the stock concentration and volume.');
 batches.push({doses:n,factor,prepared,draw,diluent:finalMl-draw,finalMl,vials:ceilVials(prepared/amount)});left-=n;}
 if(d?.maxConc&&finalConcentration>d.maxConc+1e-9)errors.push(`Administration concentration ${fmt(finalConcentration)} exceeds the image limit of ${d.maxConc} ${o.unit}/mL.`);
 if(batches.some(b=>b.draw<0.1))warnings.push('Withdrawal is below 0.1 mL. An approved intermediate dilution and suitable measuring precision are needed.');
 if(o.perContainer>1)warnings.push('Grouped doses require verified stability at the actual concentration and temperature.');
 if(!o.verified)warnings.push('Stock, device and stability settings have not yet been reviewed.');}
 const totalPrepared=batches.reduce((s,b)=>s+b.prepared,0),vials=batches.reduce((s,b)=>s+b.vials,0);
 return {ok:!errors.length,errors:[...new Set(errors)],warnings,batches,concentration,finalConcentration,totalDraw:batches.reduce((s,b)=>s+b.draw,0),totalPrepared,doseTotal:dose*o.daily,deadAmount:totalPrepared-dose*o.daily,adminSets:batches.length,sourceSets:o.sourceContainer?vials:0,vials,patientMl:doseMl*o.daily};
}
export function summarize(w:Ward){let admin=0,source=0,vials=0,invalid=0,unverified=0,orders=0;const groups=new Map<string,{name:string;unit:string;amount:number;sourceMl:number;draw:number;prepared:number;vials:number;minimum:number}>(),fluid:Record<string,number>={};
 for(const r of w.rooms)for(const p of r.patients)for(const o of p.orders){orders++;const c=calculate(o);if(!c.ok){invalid++;continue;}if(!o.verified)unverified++;admin+=c.adminSets;source+=c.sourceSets;vials+=c.vials;
 const key=JSON.stringify([o.drugId,o.name,number(o.amount),number(o.sourceMl),o.unit]);const g=groups.get(key)??{name:o.name,unit:o.unit,amount:number(o.amount),sourceMl:number(o.sourceMl),draw:0,prepared:0,vials:0,minimum:0};g.draw+=c.totalDraw;g.prepared+=c.totalPrepared;g.vials+=c.vials;g.minimum=ceilVials(g.prepared/g.amount);groups.set(key,g);fluid[o.diluent]=(fluid[o.diluent]??0)+c.batches.reduce((s,b)=>s+b.diluent,0);}
 return {admin,source,vials,sets:admin+source,invalid,unverified,orders,patients:w.rooms.reduce((s,r)=>s+r.patients.length,0),groups:[...groups.values()],fluid};}
