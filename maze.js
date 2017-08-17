
WIDTH = 10;
HEIGHT = 10;

function getTop(cell) {
    if (cell < WIDTH) {
       return -1;
    }
    return cell - WIDTH;
}

function getRight(cell) {
    if (cell % WIDTH === WIDTH - 1) {
       return -1;
    }
    return cell + 1;
}

function getBottom(cell) {
    if (cell > ((WIDTH * (HEIGHT - 1))) - 1) {
       return -1;
    }
    return cell + WIDTH;
}

function getLeft(cell) {
    if (cell % WIDTH === 0) {
       return -1;
    }
    return cell - 1;
}

function getNeighbours(cell) {
    return [getTop(cell), getRight(cell), getBottom(cell), getLeft(cell)].filter(function(x) {return x > -1;});
}

function getNeighbouringWalls(cell) {
    var walls = [];
    var neighbours = getNeighbours(cell);
    for (var i = 0; i < neighbours.length; i++) {
        walls.push([cell, neighbours[i]].sort());
    }
    return walls;
}

function contains(walls, wall) {
    return walls.filter(function(w) { return w[0] === wall[0] && w[1] === wall[1]; }).length > 0;
}

function initGrid() {
    var walls = [];
    for (var cell = 0; cell < WIDTH * HEIGHT; cell++) {
        var nWalls = getNeighbouringWalls(cell);
        for (var i = 0; i < nWalls.length; i++) {
            wall = nWalls[i];
            if (!contains(walls, wall)) {
         	walls.push(wall);  
            }
        }
    }
    return walls;
}

function initCells() {
    var cells = [];
    for (var i = 0; i < WIDTH * HEIGHT; i++) {
        cells.push(false);
    }
    return cells;
}

function removeWall(grid, wall) {
   // TODO removing the wall from the maze doesn't work

}

function generateMaze() {
   var grid = initGrid();
   var cells = initCells();
   var cell = Math.round(Math.random() * (cells.length - 1));
   var walls = getNeighbouringWalls(cell);
   cells[cell] = true;     
   console.log(cell);
   while (walls.length > 0) {
       var rand = Math.random() * (walls.length - 1);
       var wall = walls.splice(rand, 1)[0];
       grid.splice(grid.indexOf(wall), 1);
       var closedCells = wall.filter(function(cell) { return !cells[cell]; }) 
       if (closedCells.length === 1) {
          cells[closedCells[0]] = true;
          var neighbouringWalls = grid.filter(function(cell) { return wall.indexOf(cell) > -1;});
          for (var i = 0; i < neighbouringWalls.length; i++) {
              var neighbouringWall = neighbouringWalls[i];
              if (contains(walls, neighbouringWall)) {
                  walls.push(neighbouringWall);
              }
          } 
       }
   }
   return grid;
}

console.log(generateMaze().sort());
