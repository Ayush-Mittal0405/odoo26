import { getStatusColor } from '../utils/formatters';

export default function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-elevated rounded-2xl p-8 text-center">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="glass-elevated rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-5 py-3.5 text-text-muted font-medium text-xs uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id || i} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-text-primary">
                    {col.render ? col.render(row[col.key], row) : (
                      col.key === 'status' ? (
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{
                            color: getStatusColor(row[col.key]),
                            background: `${getStatusColor(row[col.key])}15`,
                          }}
                        >
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key] ?? '—'
                      )
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
