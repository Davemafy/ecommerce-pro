import { AlertTriangle, Banknote, ShoppingBag, UserRoundPlus, TrendingUp } from "lucide-react";
const icons={revenue:Banknote,orders:ShoppingBag,customers:UserRoundPlus};
export default function KpiCard({ label, value, change, attention=false, icon }) {
 const Icon=attention?AlertTriangle:(icons[icon]||Banknote);
 return <article className="kpi">
   <div className={attention?"kpi__label danger":"kpi__label"}><span>{label}</span><Icon/></div>
   <strong>{value}</strong>
   <small className={attention?"danger":"kpi__change"}>{attention?"Requires attention":<><TrendingUp/> {change}</>}</small>
 </article>;
}
