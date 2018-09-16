function solveSudoku(sudokuArray) {
  function countBlanks(sudokuArray) {
    return sudokuArray.reduce((blanks,sudokuRow) => {
      return blanks + sudokuRow.reduce((count,value) => {
        return (value === '' ? count + 1 : count);
      },0);
    },0);
  }

  function countBlankies(sudokuArray) {
    var count = 0;

    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (sudokuArray[i][j] === '') {
          count++;
        }
      }
    }

    return count;
  }

  var blanksLeft = countBlanks(sudokuArray);
  var blankiesLeft = countBlankies(sudokuArray);

  //rowTester returns an array of possible values based on the remaining values in the row
  function rowTester(rowNum) {
    var missingValues = [];

    for(var i=1; i < 10; i++) {
      if(sudokuArray[rowNum].indexOf(i) < 0) {
        missingValues.push(i);
      }
    }

    return missingValues;
  }

  function columnTester(colNum) {
    var missingValues = [1,2,3,4,5,6,7,8,9];

    for(var i=0; i < 9; i++) {
        var index = missingValues.indexOf(sudokuArray[i][colNum]);

        if (index > -1) {
          missingValues.splice(index,1);
        }
    }

    return missingValues;
  }

  //for a cell's corresponding grid, returns the missing numbers in that grid.
  function gridTester(rowNum, colNum) {
    var missingValues = [1,2,3,4,5,6,7,8,9];
    var rowLowBound = rowNum - (rowNum % 3);
    var colLowBound = colNum - (colNum % 3);

    for(var i = rowLowBound; i < (rowLowBound + 3); i++) {
      for(var j = colLowBound; j < (colLowBound + 3); j++) {
        var index = missingValues.indexOf(sudokuArray[i][j]);

        if (index > -1) {
          missingValues.splice(index,1);
        }
      }
    }

    return missingValues;
  }

  //takes in an array of arrays of missing values and returns
  function compareMissVals(x,y) {
    return x.filter((value) => {
      return (y.indexOf(value) > -1 ? true : false);
    })
  }

  //for a given cell, receives as arguments the possible values it can be based
  //on that cell's corresponding row and column. If there is a single match (no more, no less)
  //we know that cell's value must that value.
  //an optional 3rd argument gridMissVals is accepted to further narrow it down.
  //returns a list of possible values for that cell
  function rowColTester(i, j) {
      return (sudokuArray[i][j] === '' ? compareMissVals(compareMissVals(rowTester(i), columnTester(j)), gridTester(i,j)) : []);
  }

  function findUniqueVal(missValsByCell, missValsArray) {
    var solvedValues = [];

    var uniqueVals =[1,2,3,4,5,6,7,8,9].filter((number) => {
      return (missValsArray.filter((value) => {
        return (value === number ? true : false)
      }).length === 1 ? true : false);
    })

    uniqueVals.forEach((value) => {
        missValsByCell.forEach((missVals, index) => {
          if (missVals.indexOf(value) > -1) {
            solvedValues.push({index: index, value: value})
          }
        })
    })

    return solvedValues;
  }

  //if you compare rowMissVals and colMissVals and gridMissVals and there is only one common value DONE
  //if a certain number eliminates the possibility that other missing cells in that grid can be that value
  //if a certain number eliminates the possibility that other missing cells in that row can be that values
  function rowSolver(rowNum) {
    var missValsByCell = [];
    var missValsArray = [];

    for (var j=0; j < 9; j++) {
      missValsByCell.push(rowColTester(rowNum,j));
      missValsArray = missValsArray.concat(rowColTester(rowNum,j));
    }

    return findUniqueVal(missValsByCell, missValsArray);
  }

  function columnSolver(colNum) {
    var missValsByCell = [];
    var missValsArray = [];

    for (var i = 0; i < 9; i++) {
      missValsByCell.push(rowColTester(i, colNum));
      missValsArray = missValsArray.concat(rowColTester(i, colNum));
    }

    return findUniqueVal(missValsByCell, missValsArray);
  }

  function gridSolver(rowLowBound,colLowBound) {
    var missValsByCell = [];
    var missValsArray = [];

    for (var i= rowLowBound; i< rowLowBound + 3; i++) {
      for (var j= colLowBound; j< colLowBound + 3; j++) {
        missValsByCell.push(rowColTester(i,j));
        missValsArray = missValsArray.concat(rowColTester(i,j));
      }
    }

    // console.log("grid missValsByCell", missValsByCell);

    return findUniqueVal(missValsByCell, missValsArray);
  }


  //if a certain number eliminates the possibility that other missing cells in that column can be that value

  while(blanksLeft > 0) {
    var counter = blanksLeft;

    //TEST CELL
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (sudokuArray[i][j] === '') {
          var missVals = rowColTester(i,j);
          console.log("row", i, "column", j, "missVals", missVals);
          if (missVals.length === 1) {
            sudokuArray[i][j] = missVals[0];
            blanksLeft--;
          }
        }
      }
    }

    //TEST ROW
    for (var i = 0; i < 9; i++) {
      rowSolver(i).forEach((solvedValue) => {
        console.log("row solvedVal", i, solvedValue.index, "val", solvedValue.value);
        sudokuArray[i][solvedValue.index] = solvedValue.value;
        blanksLeft--;
      })
    }

    //TEST COLUMN
    for (var i = 0; i < 9; i++) {
      columnSolver(i).forEach((solvedValue) => {
        console.log("col solvedVal", i, solvedValue.index, "val", solvedValue.value);
        sudokuArray[solvedValue.index][i] = solvedValue.value;
        blanksLeft--;
      })
    }

    var gridAdjust = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]];

    //TEST GRID
    for (var i = 0; i < 9; i = i + 3) {
      for (var j = 0; j< 9; j = j +3) {
        gridSolver(i,j).forEach((solvedValue) => {
          console.log("grid solvedVal",i + gridAdjust[solvedValue.index][0] ,j + gridAdjust[solvedValue.index][1] ,"val", solvedValue.value);
          sudokuArray[i + gridAdjust[solvedValue.index][0]][j + gridAdjust[solvedValue.index][1]] = solvedValue.value;
          blanksLeft--;
        })
      }
    }

    //instaed of using rowcoltester multiple times for each cell and doing rowsolver, columnsolver, and gridsolver,
    //as separate steps, do rowcoltester once, collect the values, and do each comparison test.
    console.log("blanksLeft", blanksLeft);
    console.log(sudokuArray);

    if (counter === blanksLeft) {
      break;
    }
  }

  return sudokuArray;
}
