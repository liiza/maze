
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

function wallsEqual(w1, w2) {
    return w1[0] === w2[0] && w1[1] === w2[1];
} 

function contains(walls, wall) {
    return walls.filter(function(w) { return wallsEqual(w, wall); }).length > 0;
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
   for (var i = 0; i < grid.length; i++) {
       if (wallsEqual(grid[i], wall)) {
           grid.splice(i, 1);
           return;       
       } 
   }
}

function generateMaze() {
   var grid = initGrid();
   var cells = initCells();
   var cell = Math.round(Math.random() * (cells.length - 1));
   var walls = getNeighbouringWalls(cell);
   cells[cell] = true;     
   while (walls.length > 0) {
       var rand = Math.round(Math.random() * (walls.length - 1));
       var wall = walls.splice(rand, 1)[0];
       var closedCells = wall.filter(function(cell) { return !cells[cell]; }) 
       if (closedCells.length === 1) {
          var closed = closedCells[0];
          cells[closed] = true;
          removeWall(grid, wall);
          var neighbouringWalls = grid.filter(function(wall) { return wall.indexOf(closed) > -1;});
          for (var i = 0; i < neighbouringWalls.length; i++) {
              var neighbouringWall = neighbouringWalls[i];
              if (!contains(walls, neighbouringWall)) {
                  walls.push(neighbouringWall);
              }
          } 
       }
   }
   return grid;
}

console.log(generateMaze().sort());
