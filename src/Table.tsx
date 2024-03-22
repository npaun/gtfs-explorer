import { TableVirtuoso } from 'react-virtuoso'
import './Table.css';



const Table = ({ sqlResult }: {sqlResult:{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]} |null}) => {
  if (sqlResult && 'data' in sqlResult && sqlResult.data.length > 0 && sqlResult.data[0].values.length > 0) {
    const columns = sqlResult.data[0].columns;
    const values = sqlResult.data[0].values;

    const longestStrings = [...columns];
    for (const row of values) {
      for (let j = 0; j < columns.length; j++) {
        const val = String(row[j]);
        if (val.length > longestStrings[j].length) {
          longestStrings[j] = val;
        }
      }
    }

    const textLengths = longestStrings.map((ls) => ls.length);
    const totalLength = textLengths.reduce((acc, val) => acc + val, 0);
    const propLengths = textLengths.map((tl) => `${(tl/totalLength * 100) + 5}%`);

    return (
      <div className="table">
        <TableVirtuoso
        style={{height: "80vh"}}
        width="100%"
        data={values}
        totalCount={values.length}
        fixedHeaderContent={() => (
          <>
          <tr className="table-header">
            {columns.map((col, j) => (<th>{col}</th>))}
          </tr>
          </>
        )}
        fixedFooterContent={() => (
          <>
          <tr className="sizer">
          {longestStrings.map((ls) => (<td>{ls}</td>))}
        </tr>
        
        </>
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

