import Sidebar from "./Sidebar";
export default function AppShell({page,onNavigate,children}) {
  return <div className="app-shell"><Sidebar activePage={page} onNavigate={onNavigate}/>{children}</div>;
}
