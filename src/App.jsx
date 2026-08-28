import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./features/dashboard/DashboardPage";
import OrdersPage from "./features/orders/OrdersPage";

function Placeholder({page}) { return <main className="page"><h1>{page}</h1><section className="card placeholder">CommercePro {page} workspace</section></main>; }

export default function App() {
 const [page,setPage]=useState("Dashboard");
 const content=page==="Dashboard"?<DashboardPage onNavigate={setPage}/>:page==="Orders"?<OrdersPage/>:<Placeholder page={page}/>;
 return <AppShell page={page} onNavigate={setPage}>{content}</AppShell>;
}
