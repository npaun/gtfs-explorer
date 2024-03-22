import BaseTable from 'react-base-table';
import AutoSizer from 'react-virtualized-auto-sizer'
import 'react-base-table/styles.css'
import './Table.css';

const columns = ['a', 'bbbbbb', 'c', 'd', 'e', 'fasdfdsfadsjfl;', 'g', 'h', 'i', 'j'].map((col,i) => ({key: col, dataKey: col, title: col, width: 0, flexGrow: 1}));

const data2 = new Array(1000).fill(0).map((row, rowIndex) => {
  return {
    id: `row${rowIndex}`,
    parentId: null,
    ...Object.fromEntries(columns.map((col) => [col.dataKey, `Row ${rowIndex} - Col ${col.dataKey}`]))
  }
});

console.log(data2[0])

const Table = (results: any) => {
  return (
    <div className="table">
      <AutoSizer>
        {({ height, width }: { height: number, width: number }) => (
          <BaseTable height={height} width={width} fixed={false} columns={columns} data={data2}/>   
        )}
      </AutoSizer>
    </div>
  );
}

export default Table;

