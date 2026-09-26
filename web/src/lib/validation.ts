import {z} from 'zod';
import {DRUGS} from './model';
const short=z.string().max(120),numeric=z.string().max(35);
export const orderSchema=z.object({id:short,drugId:short.refine(id=>DRUGS.some(d=>d.id===id),'Unknown drug'),name:short,dose:numeric,unit:z.string().max(40),daily:z.number().int().min(1).max(3),perContainer:z.number().int().min(1).max(3),doseMl:numeric,deadMl:numeric,amount:numeric,sourceMl:numeric,diluent:short,sourceContainer:z.boolean(),verified:z.boolean(),note:z.string().max(600)}).strict();
export const wardSchema=z.object({schema:z.literal(1),title:short,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),rooms:z.array(z.object({id:short,name:short,patients:z.array(z.object({id:short,name:short,bed:short,orders:z.array(orderSchema).max(30)}).strict()).max(100)}).strict()).max(40)}).strict();
export const saveSchema=z.object({revision:z.number().int().min(0),document:wardSchema}).strict();
