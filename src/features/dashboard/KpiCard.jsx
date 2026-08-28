import { AlertTriangle } from "lucide-react";
export default function KpiCard({ label, value, attention=false }) {
 return <article className="kpi"><div className={attention?"kpi__label danger":"kpi__label"}>{label}{attention&&<AlertTriangle/>}</div><strong>{value}</strong><small className={attention?"danger":""}>{attention?"Requires attention":"+12% from last week"}</small></article>;
}
