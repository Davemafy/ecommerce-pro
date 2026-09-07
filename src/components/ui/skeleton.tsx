function Line({ width = '100%', height = 14 }) { return <span className="sk sk-line" style={{ width, height }} />; }
function Card({ children, className = '' }) { return <div className={`sk-card ${className}`}>{children}</div>; }
export function DashboardSkeleton({ variant = 'dashboard' }) {
  const detail = variant.includes('detail');
  return <main className="figma-page skeleton-page" aria-label="Loading page" aria-busy="true">
    <div className="sk-head"><div><Line width="210px" height={28}/><Line width="330px" height={12}/></div><Line width="118px" height={38}/></div>
    {detail ? <>
      <div className="sk-bento"><Card className="sk-product"><span className="sk sk-image"/><div className="sk-copy"><Line width="120px" height={22}/><Line/><Line width="88%"/><Line width="72%"/><div className="sk-facts"><Line/><Line/><Line/><Line/></div></div></Card><div className="sk-side"><Card><Line width="55%" height={20}/><Line/><Line width="85%" height={8}/><Line width="60%"/></Card><Card><Line width="42%"/><Line width="70%" height={36}/><Line width="55%"/></Card></div></div>
      <Card className="sk-chart"><Line width="190px" height={20}/><div className="sk-bars">{[42,68,35,84,64,92,76,58,72,50].map((h,i)=><i className="sk" key={i} style={{height:`${h}%`}} />)}</div></Card>
    </> : <>
      <Card className="sk-toolbar"><Line width="38%" height={38}/><Line width="28%" height={38}/></Card>
      <div className="sk-metrics">{[1,2,3,4].map(i=><Card key={i}><Line width="42%"/><Line width="65%" height={28}/><Line width="50%"/></Card>)}</div>
      <Card className="sk-table"><div className="sk-table-head"><Line/><Line/><Line/><Line/><Line/></div>{[1,2,3,4,5,6].map(i=><div className="sk-table-row" key={i}><span className="sk sk-avatar"/><Line/><Line/><Line/><Line/></div>)}</Card>
    </>}
  </main>;
}
