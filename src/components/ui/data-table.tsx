export function DataTable({ columns, rows, onRowClick }) {
  return (
    <div className="card table-card">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row[0] ?? rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={onRowClick ? 'clickable-row' : undefined}
            >
              {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
