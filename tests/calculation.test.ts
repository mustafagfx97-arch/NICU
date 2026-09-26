import assert from 'node:assert/strict';
import {calculate,newOrder,summarize,number,ceilVials,DRUGS,type Ward} from '../web/src/lib/model.ts';
let n=0;function test(name:string,run:()=>void){run();n++;console.log('PASS',name);}
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function order(p:Record<string,unknown>={}){return {...newOrder(),dose:'50',...p};}
for(const [daily,draw,fluid,final,factor]of [[1,.75,29.25,30,1.5],[2,1.25,48.75,50,2.5],[3,1.75,68.25,70,3.5]])test(`photo standard ${daily}`,()=>{const r=calculate(order({daily,perContainer:daily}));assert.equal(r.ok,true);close(r.batches[0].draw,draw);close(r.batches[0].diluent,fluid);close(r.batches[0].finalMl,final);close(r.batches[0].factor,factor);close(r.totalPrepared-r.deadAmount,50*daily);});
for(const [daily,draw,final,factor]of [[1,1,20,2],[2,1.5,30,3],[3,2,40,4]])test(`photo restricted ${daily}`,()=>{const r=calculate(order({daily,perContainer:daily,doseMl:'10'}));assert.equal(r.ok,true);close(r.batches[0].draw,draw);close(r.batches[0].finalMl,final);close(r.batches[0].factor,factor);close(r.batches[0].diluent+draw,final);});
test('split 2+1 counts residual loss twice',()=>{const r=calculate(order({perContainer:2}));close(r.totalDraw,2);assert.equal(r.adminSets,2);assert.equal(r.vials,2);close(r.totalPrepared,200);});
test('split 1+1+1',()=>{const r=calculate(order({perContainer:1}));assert.equal(r.vials,3);close(r.totalDraw,2.25);});
test('vials exceed one',()=>{const r=calculate(order({dose:'700'}));assert.equal(r.vials,3);close(r.totalPrepared,2450);});
test('ward aggregates separately from theoretical pooling',()=>{const w:Ward={schema:1,title:'test',date:'2026-09-26',rooms:[{id:'r1',name:'r1',patients:[{id:'p1',name:'a',bed:'1',orders:[order()]}]},{id:'r2',name:'r2',patients:[{id:'p2',name:'b',bed:'2',orders:[order()]}]}]};const s=summarize(w);assert.equal(s.vials,2);assert.equal(s.groups[0].minimum,1);close(s.groups[0].draw,3.5);assert.equal(s.sets,2);});
test('stock variants not merged',()=>{const w:Ward={schema:1,title:'x',date:'2026-09-26',rooms:[{id:'r',name:'r',patients:[{id:'p',name:'p',bed:'',orders:[order(),{...newOrder('cefotaxime-500'),dose:'50'}]}]}]};assert.equal(summarize(w).groups.length,2);});
test('caffeine citrate/base equivalence and no wash branch',()=>{const a=calculate({...newOrder('caffeine-citrate'),dose:'10',daily:1,perContainer:1}),b=calculate({...newOrder('caffeine-base'),dose:'5',daily:1,perContainer:1});close(a.totalDraw,.75);close(a.totalDraw,b.totalDraw);close(a.batches[0].finalMl,30);});
test('stock vs administration vancomycin',()=>{const r=calculate({...newOrder('vancomycin-1000'),dose:'50'});close(r.concentration,50);close(r.finalConcentration,2.5);close(r.totalDraw,3.5);assert.equal(r.ok,true);});
test('special source extra sets + tigecycline separate doses',()=>{const r=calculate({...newOrder('tigecycline-50'),dose:'5'});assert.equal(r.adminSets,3);assert.equal(r.sourceSets,3);assert.equal(r.vials,3);assert.equal(calculate({...newOrder('tigecycline-50'),dose:'5',perContainer:3}).ok,false);});
test('source amount is not final concentration',()=>{close(calculate({...newOrder('colistin-33'),dose:'5'}).concentration,16.65);close(calculate({...newOrder('colistin-150'),dose:'5'}).concentration,75);});
test('unsafe or missing fields rejected',()=>{for(const p of [{dose:'0'},{dose:'-2'},{dose:'NaN'},{dose:'1,000'},{sourceMl:'0'},{amount:''},{deadMl:'-1'},{daily:4},{doseMl:'0'},{dose:'5000'},{doseMl:'100'}])assert.equal(calculate(order(p)).ok,false,JSON.stringify(p));});
test('concentration limits',()=>assert.equal(calculate({...newOrder('vancomycin-1000'),dose:'150'}).ok,false));
test('ambisome excludes saline',()=>assert.equal(calculate({...newOrder('ambisome-50'),dose:'5',diluent:'N/S 0.9%'}).ok,false));
test('ceftriaxone and phenytoin blocked for this workflow',()=>{for(const id of ['ceftriaxone-1000','phenytoin-250'])assert.equal(calculate({...newOrder(id),dose:'50'}).ok,false);});
test('unknown ampoules not guessed',()=>{for(const id of ['calcium','aminophylline','bicarbonate'])assert.equal(calculate({...newOrder(id),dose:'5'}).ok,false);});
test('Arabic decimals supported; ambiguous separators rejected',()=>{close(number('١٫٧٥'),1.75);close(number('۱۲.۵'),12.5);assert.ok(Number.isNaN(number('1,5')));});
test('vial ceiling boundary',()=>{assert.equal(ceilVials(1.000000000000001),1);assert.equal(ceilVials(1.00001),2);});
test('all active catalog definitions satisfy dimensional invariants',()=>{for(const d of DRUGS.filter(d=>d.amount&&!d.blocked)){const o={...newOrder(d.id),dose:d.unit==='IU'?'10000':'5'};const r=calculate(o);assert.equal(r.ok,true,d.id);for(const b of r.batches){close(b.draw*r.concentration,b.prepared);close(b.draw+b.diluent,b.finalMl);close(b.finalMl*r.finalConcentration,b.prepared);}close(r.totalPrepared-r.deadAmount,r.doseTotal);}});
console.log(`${n} calculation checks passed`);
