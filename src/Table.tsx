import { FixedSizeGrid as Grid } from 'react-window';
import './Table.css';

const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: any }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
);

const Table = (results: any) => {
  return (
    <div className="table">
      <Grid
        columnCount={1000}
        columnWidth={100}
        height={500}
        rowCount={1000}
        rowHeight={35}
        width={500}
      >
        {Cell}
      </Grid>
    </div>
  );
}

export default Table;
