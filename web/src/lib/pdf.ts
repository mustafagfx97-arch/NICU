import {calculate,fmt,summarize,type Ward} from './model';

type ReportLine={text:string;size?:number;color?:string;bold?:boolean};
export async function makeReport(ward:Ward):Promise<Blob>{
 const W=1240,H=1754,M=75,bottom=1630;
 const pages:HTMLCanvasElement[]=[];let ctx:CanvasRenderingContext2D,y=0;
 const summary=summarize(ward),draft=summary.invalid+summary.unverified>0;
 function text(value:string,x:number,yy:number,size=23,color='#163c52',bold=false,align:CanvasTextAlign='left'){
  ctx.font=`${bold?'bold ':''}${size}px Arial`;ctx.fillStyle=color;ctx.textAlign=align;ctx.direction='ltr';ctx.fillText(value,x,yy);
 }
 function newPage(){
  const page=document.createElement('canvas');page.width=W;page.height=H;ctx=page.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,W,H);pages.push(page);
  ctx.fillStyle='#103e57';ctx.fillRect(0,0,W,175);ctx.font='bold 35px Arial';
  const titleSize=Math.min(35,35*(W-2*M-240)/Math.max(1,ctx.measureText(ward.title).width));
  text(ward.title,M,66,titleSize,'white',true);text(ward.date,W-M,66,23,'white',false,'right');
  text('NICU WORK  |  DAILY PREPARATION REPORT',M,112,22,'#bcebe7');
  text(draft?'DRAFT - settings require review':'Preparation settings reviewed by the user',M,150,19,'white');y=220;
 }
 function rows(value:string,size:number,bold:boolean){
  ctx.font=`${bold?'bold ':''}${size}px Arial`;const result:string[]=[];let current='';
  for(const word of value.split(/\s+/)){const next=current?`${current} ${word}`:word;if(ctx.measureText(next).width>W-2*M&&current){result.push(current);current=word;}else current=next;}
  if(current)result.push(current);return result;
 }
 function line(item:ReportLine){const size=item.size??23;for(const value of rows(item.text,size,!!item.bold)){if(y+size*1.55>bottom)newPage();text(value,M,y,size,item.color??'#163c52',item.bold);y+=size*1.55;}}
 function title(value:string){if(y+75>bottom)newPage();ctx.fillStyle='#eaf3f6';ctx.fillRect(M,y-27,W-2*M,51);text(value,M+14,y+7,27,'#103e57',true);y+=66;}
 function block(items:ReportLine[]){const height=24+items.reduce((sum,item)=>sum+rows(item.text,item.size??23,!!item.bold).length*(item.size??23)*1.55,0);if(y+height>bottom&&height<bottom-220)newPage();ctx.strokeStyle='#dce7ed';ctx.beginPath();ctx.moveTo(M,y-8);ctx.lineTo(W-M,y-8);ctx.stroke();y+=24;items.forEach(line);y+=18;}
 newPage();title('Ward supply summary');
 line({text:`${ward.rooms.length} rooms  |  ${summary.patients} patients  |  ${summary.orders} medication orders`,size:27,bold:true});
 line({text:`${summary.sets} microdrips = ${summary.admin} administration + ${summary.source} stock preparation`,size:26,bold:true});
 line({text:`New vials / ampoules for separate preparations: ${summary.vials}`,size:26,bold:true});
 line({text:'Each administration preparation uses new vials. No vial sharing or carry-over is assumed. Stock sets count as one extra container per new vial when that option is enabled.',size:21});
 if(summary.invalid)line({text:`${summary.invalid} invalid order(s) are EXCLUDED from totals. See the room details.`,size:22,bold:true,color:'#a53036'});
 if(summary.unverified)line({text:`${summary.unverified} order(s) require review. Supply totals remain provisional.`,size:22,color:'#956011'});
 for(const g of summary.groups)block([
  {text:`${g.name} | ${fmt(g.amount)} ${g.unit} / ${fmt(g.sourceMl)} mL`,size:25,bold:true},
  {text:`Total withdrawal: ${fmt(g.draw)} mL | Prepared amount: ${fmt(g.prepared)} ${g.unit}`},
  {text:`Vials to prepare: ${g.vials} | Quantity equivalent only: ${g.minimum}`,size:23}
 ]);
 title('Diluent added to administration sets');
 for(const [name,ml] of Object.entries(summary.fluid))line({text:`${name}: ${fmt(ml)} mL`,bold:true});
 line({text:'Excludes reconstitution water and intermediate stock fluids.',size:20});
 for(const room of ward.rooms){
  newPage();title(room.name);
  if(!room.patients.length)line({text:'No patients recorded.'});
  for(const patient of room.patients){
   const patientLabel=`${patient.name}${patient.bed?' | Bed '+patient.bed:''}`;
   if(!patient.orders.length)block([{text:patientLabel,size:26,bold:true},{text:'No medication orders recorded.'}]);
   for(const order of patient.orders){
    const result=calculate(order),items:ReportLine[]=[
     {text:`${room.name} - ${patientLabel}`,size:26,bold:true},
     {text:`${order.name} | ${order.dose} ${order.unit} per dose | ${order.daily} dose(s) per day`,size:24,bold:true},
     {text:`Stock: ${order.amount} ${order.unit} / ${order.sourceMl} mL | Diluent: ${order.diluent}`,size:21}
    ];
    if(!result.ok){result.errors.forEach(error=>items.push({text:'NOT CALCULATED: '+error,color:'#a53036'}));block(items);continue;}
    items.push({text:order.verified?'Settings reviewed by the user':'Settings have NOT been reviewed',size:20,color:order.verified?'#156357':'#956011'},
     {text:`Per dose: ${order.doseMl} mL | Device dead space: ${order.deadMl} mL`,size:21},
     {text:`Administration concentration: ${fmt(result.finalConcentration)} ${order.unit}/mL`,size:21});
    result.batches.forEach((batch,index)=>items.push(
     {text:`Microdrip ${index+1}: ${batch.doses} dose(s), factor ${fmt(batch.factor)}`,size:23,bold:true},
     {text:`Withdraw ${fmt(batch.draw)} mL + add ${fmt(batch.diluent)} mL ${order.diluent}`,size:25,color:'#12675e',bold:true},
     {text:`Final volume: ${fmt(batch.finalMl)} mL. Give ${order.doseMl} mL per prescribed dose.`,size:22}
    ));
    items.push({text:`Supplies: ${result.adminSets} administration + ${result.sourceSets} stock sets | ${result.vials} new vial(s)`,size:21},
     {text:`Prescribed amount: ${fmt(result.doseTotal)} ${order.unit}. Dead-space allowance: ${fmt(result.deadAmount)} ${order.unit}.`,size:20});
    if(order.note)items.push({text:'Note: '+order.note,size:21});
    result.warnings.forEach(warning=>items.push({text:warning,size:20,color:'#956011'}));block(items);
   }
  }
 }
 newPage();title('Calculation method and assumptions');
 [
  'Enter the prescribed SINGLE dose, not the daily dose or a mg/kg value.',
  'Stock concentration = drug amount per vial / final stock volume.',
  'Preparation factor = doses per microdrip + device dead space / administration volume per dose.',
  'Withdrawal volume = prescribed single dose x preparation factor / stock concentration.',
  'Final volume = doses per microdrip x volume per dose + device dead space.',
  'Diluent to add = final volume - withdrawal volume.',
  'Standard image method: 20 mL per dose and 10 mL dead space. For 1 / 2 / 3 doses: factors 1.5 / 2.5 / 3.5; final volumes 30 / 50 / 70 mL.',
  'Fluid-restricted image method: 10 mL per dose and 10 mL dead space. Factors 2 / 3 / 4; final volumes 20 / 30 / 40 mL. Restriction must be clinically prescribed.',
  'Caffeine uses the same dead-space formula, with no wash step. Caffeine citrate and base equivalents are separate selections.',
  'One medication and one patient per microdrip. This tool does not prescribe a dose, infusion rate, compatibility or beyond-use date.',
  'Confirm the actual product, stock volume, dose unit, diluent, device volume and stability with the approved ward protocol. Image stability periods are not automatically accepted.',
  'Internal arithmetic uses full precision. Displayed decimals do not imply that the volume can be accurately measured with the available syringe.',
  'Quantity-equivalent vial counts are inventory estimates only. They do not authorize sharing single-dose vials or retaining unused contents.'
 ].forEach(value=>{line({text:value,size:23});y+=10;});
 line({text:'Prepared by: __________________    Checked by: __________________',size:22});
 line({text:'Calculation source: supplied images, pages 2-5 and 8-11. Reference review: DailyMed and CDC, 26 September 2026.',size:19});
 pages.forEach((page,index)=>{ctx=page.getContext('2d')!;text(`Page ${index+1} of ${pages.length}`,M,H-58,18,'#526a7a');text('NICU Work | '+ward.date,W-M,H-58,18,'#526a7a',false,'right');});
 return imagePagesToPdf(pages.map(page=>page.toDataURL('image/jpeg',0.94)),W,H);
}
export function imagePagesToPdf(urls:string[],width:number,height:number){const enc=new TextEncoder();const chunks:Uint8Array[]=[],offsets:number[]=[0];let size=0;const add=(s:string|Uint8Array)=>{const a=typeof s==='string'?enc.encode(s):s;chunks.push(a);size+=a.length;};const obj=(id:number,s:string)=>{offsets[id]=size;add(`${id} 0 obj\n${s}\nendobj\n`);};add('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Count ${urls.length} /Kids [${urls.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
 urls.forEach((url,i)=>{const id=3+i*3,bin=atob(url.split(',')[1]),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));obj(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /I${i} ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);offsets[id+1]=size;add(`${id+1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);add(bytes);add('\nendstream\nendobj\n');const stream=`q\n595.28 0 0 841.89 0 0 cm\n/I${i} Do\nQ\n`;obj(id+2,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);});const start=size,count=3+urls.length*3;add(`xref\n0 ${count}\n0000000000 65535 f \n`);for(let i=1;i<count;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);return new Blob(chunks as BlobPart[],{type:'application/pdf'});}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
