import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import './Table.css';

const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: any }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
);

const Table = (results: any) => {
  return (

    <div className="table">
      <AutoSizer>
        {({ height, width }: { height: number, width:number  }) => (
          <Grid
            columnCount={1000}
            columnWidth={100}
            height={height}
            rowCount={1000}
            rowHeight={35}
            width={width}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}

export default Table;
