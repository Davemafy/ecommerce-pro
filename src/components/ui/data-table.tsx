export function DataTable({ columns, rows, onRowClick, emptyTitle='No results found', emptyMessage='Try adjusting your search or filters.' }) {
  return (
    <div className="card table-card">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column} className={column==='ACTIONS'?'action-column':undefined}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row[0] ?? rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={onRowClick ? 'clickable-row' : undefined}
            >
              {row.map((cell, cellIndex) => {
                const column=columns[cellIndex];
                const isStatus=column==='STATUS'&&typeof cell==='string';
                return <td key={`${rowIndex}-${cellIndex}`} className={column==='ACTIONS'?'action-column':undefined}>{isStatus?<span className={`status-chip ${cell.toLowerCase().replace(/ /g,'-')}`}>{cell}</span>:cell}</td>;
              })}
            </tr>
          ))}
          {!rows.length&&<tr><td colSpan={columns.length}><div className="table-empty-state"><strong>{emptyTitle}</strong><span>{emptyMessage}</span></div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
