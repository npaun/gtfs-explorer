import BaseTable from 'react-base-table';
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
      <BaseTable height={700} width={700} fixed={false} columns={columns} data={data2}/>   
    </div>
  );
}

export default Table;

