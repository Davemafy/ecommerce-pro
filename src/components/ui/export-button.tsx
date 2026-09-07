import { Download } from 'lucide-react';
import { useToast } from './feedback';

export function ExportButton({ label='Export', data=[], filename='commercepro-export.csv' }: { label?:string; data?:Record<string,unknown>[]; filename?:string }) {
 const toast=useToast();
 const exportCsv=()=>{if(!data.length){toast('Nothing to export','error');return;} const keys=Object.keys(data[0]); const esc=(v:unknown)=>`"${String(v??'').replaceAll('"','""')}"`; const csv=[keys.join(','),...data.map(row=>keys.map(k=>esc(row[k])).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);toast('Report exported');};
 return <button onClick={exportCsv}><Download/>{label}</button>;
}
