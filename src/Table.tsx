import { TableVirtuoso } from 'react-virtuoso'
import './Table.css';

const keyOf = (i: number, j: number) => `{$i}-${j}`;

const Table = ({ sqlResult }: {sqlResult:{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]} |null}) => {
  if (sqlResult && 'data' in sqlResult && sqlResult.data.length > 0 && sqlResult.data[0].values.length > 0) {
    const columns = sqlResult.data[0].columns;
    const values = sqlResult.data[0].values;

    return (
      <div className="table">
        <TableVirtuoso
        style={{height: "80vh"}}
        data={values}
        totalCount={values.length}
        fixedHeaderContent={() => (
          <tr>
            {columns.map((col) => (<th>{col}</th>))}
          </tr>
        )}
        itemContent={(i, row) => (
          row.map((value, j) => (
            <td key={i*columns.length + j}>{value}</td>
          ))
        )}
        />
      </div>
    );
  }
  return <div className="empty">No data</div>
}

export default Table;

