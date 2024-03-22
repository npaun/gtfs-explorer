import BaseTable from 'react-base-table';
import AutoSizer from 'react-virtualized-auto-sizer'
import 'react-base-table/styles.css'
import './Table.css';

const columns = ['a', 'bbbbbb', 'c', 'd', 'e', 'fasdfdsfadsjfl;', 'g', 'h', 'i', 'j'].map((col,i) => ({key: col, dataKey: col, title: col, width: 0, flexGrow: 1}));

const data2 = new Array(1000).fill(0).map((row, rowIndex) => {
  return {
    id: `row${rowIndex}`,
    ...Object.fromEntries(columns.map((col) => [col.dataKey, `Row ${rowIndex} - Col ${col.dataKey}`]))
  }
});

console.log(data2[0])

const Table = ({ sqlResult }: {sqlResult:{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]} |null}) => {
  if (sqlResult && 'data' in sqlResult && sqlResult.data.length > 0 && sqlResult.data[0].values.length > 0) {
    const { columns, data } = parseQueryResult(sqlResult.data[0]);
    return (
      <AutoSizer>
        {({ height, width }: { height: number, width: number }) => (
          <BaseTable height={height} width={width} fixed={false} columns={columns} data={data}/>   
        )}
      </AutoSizer>
    )
  }
  return <div className="empty">No data</div>
}

export default Table;

function parseQueryResult({ columns, values }: {columns: string[]; values: unknown[][]}) {
  const colWidths = Array(columns.length).fill(0);
  const convertedRows: ({[k: string]: string} & {id: string})[] = [];
  let rowIndex = 0;
  for (const row of values) {
    let i = 0;
    const rowConverted: ({[k: string]: string} & {id: string}) = {
      id: `row-${rowIndex}`,
    };
    for (const item of row) {
      const itemStr = String(item);
      rowConverted[columns[i]] = itemStr;
      if (itemStr.length > colWidths[i]) colWidths[i] = itemStr.length;
      i += 1;
    }
    convertedRows.push(rowConverted);
    rowIndex += 1;
  }

  const sumWidths = colWidths.reduce((sum, w) => sum + w, 0);

  return {
    columns: columns.map((col, i) => ({ key: col, dataKey: col, title: col, width: 0, flexGrow: colWidths[i] / sumWidths * 100 })), 
    data: convertedRows
  };
}
