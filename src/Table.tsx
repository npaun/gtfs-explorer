import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import './Table.css';





const Table = ({results}: {results: any}) => {
  const Cell = ({columnIndex, rowIndex, style }: {columnIndex: number, rowIndex: number, style: any }) => (
    <div style={style} className={rowIndex === 0 ? "header-cell" : "value-cell"}>
      {results[rowIndex][columnIndex]}
    </div>
  );

  const widthOf =  (columnIndex: number) => {
    // FIXME: This construction makes no sense but our old CSV explorer used it
    let maxWidth = 0;
    for (let i = 0; i < results.length; i++) {
      maxWidth = Math.max(maxWidth, results[i][columnIndex].length);
    }


    return 20*maxWidth + 10;
  };


  let totalWidth = 0;
  for (let i = 0; i < results[0].length; i++) {
    totalWidth += widthOf(i);
  }

  return (

    <div className="table">
      <AutoSizer disableWidth>
        {({ height }: { height: number }) => (
          <Grid
            columnCount={results[0].length}
            columnWidth={index => widthOf(index)}
            height={height}
            rowCount={results.length}
            rowHeight={index => 35}
            width={totalWidth}
            style={{"margin": "auto"}}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}

export default Table;
