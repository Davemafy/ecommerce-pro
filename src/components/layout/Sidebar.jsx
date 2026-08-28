import { LayoutDashboard, ShoppingCart, Package, Users, Warehouse, BarChart3, Settings, LifeBuoy } from "lucide-react";

const items = [["Dashboard",LayoutDashboard],["Orders",ShoppingCart],["Products",Package],["Customers",Users],["Inventory",Warehouse],["Reports",BarChart3],["Settings",Settings]];
const adminAvatar="https://www.figma.com/api/mcp/asset/ec7f13e1-0e01-4539-8105-b5797156ce83.png";

export default function Sidebar({ activePage, onNavigate }) {
 return <aside className="sidebar">
   <div className="brand">
     <img className="brand__avatar" src={adminAvatar} alt="Admin user"/>
     <div><strong>CommercePro</strong><small>Enterprise Admin</small></div>
   </div>
   <nav className="nav" aria-label="Primary navigation">
    {items.map(([label,Icon])=><button key={label} className={activePage===label?"nav__item nav__item--active":"nav__item"} onClick={()=>onNavigate(label)}><Icon aria-hidden="true"/><span>{label}</span></button>)}
   </nav>
   <div className="sidebar__footer"><button className="support"><LifeBuoy/>Support</button></div>
 </aside>;
}
