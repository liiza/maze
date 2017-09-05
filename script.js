var gl; // A global variable for the WebGL context


function initWebGL(canvas) {
  gl = null;
  
  // Try to grab the standard context. If it fails, fallback to experimental.
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
  }
  
  return gl;
}

function start() {
  var canvas = document.getElementById('glCanvas');

  // Initialize the GL context
  gl = initWebGL(canvas);
  
  // Only continue if WebGL is available and working
  if (!gl) {
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);
  // Clear the color as well as the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  initShaders();

  initBuffers();

  setInterval(drawScene, 15);
}


function initShaders() {
  var fragmentShader = getShader(gl, 'shader-fs');
  var vertexShader = getShader(gl, 'shader-vs');
  
  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);

  vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttribute);
}


function getShader(gl, id, type) {
  var shaderScript, theSource, currentChild, shader;
  
  shaderScript = document.getElementById(id);
  
  if (!shaderScript) {
    return null;
  }
  
  theSource = shaderScript.text;

  if (!type) {
    if (shaderScript.type == 'x-shader/x-fragment') {
      type = gl.FRAGMENT_SHADER;
    } else if (shaderScript.type == 'x-shader/x-vertex') {
      type = gl.VERTEX_SHADER;
    } else {
      // Unknown shader type
      return null;
    }
  }
  shader = gl.createShader(type);

  gl.shaderSource(shader, theSource);
    
  // Compile the shader program
  gl.compileShader(shader);  
    
  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
      console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
      gl.deleteShader(shader);
      return null;  
  }
    
  return shader;
}

var horizAspect = 480.0/640.0;


function calculateVertices(p1, p2) {
    // Calculates vertices for square that is standing on these two points
    return [
        p1[0], 0.0, p1[1],
        p2[0], 0.0, p2[1],
        p2[0], 2.0, p2[1],
        p1[0], 2.0, p1[1]
    ];    
}


function crossProduct(v1, v2) {
   var x = v1[1] * v2[2] - v1[2] * v2[1];
   var y = v1[2] * v2[0] - v1[0] * v2[2];
   var z = v1[0] * v2[1] - v1[1] * v2[0]; 
   return [x, y, z];

}

function vector(from, to) {
   return [from[0] - to[0], from[1] - to[1], from[2] - to[2]]
}

function triangleNormal(vtx0, vtx1, vtx2) {
   var v1 = vector(vtx0, vtx1);
   var v2 = vector(vtx0, vtx2);
   return crossProduct(v1, v2);
}

function getNormals(vertices) {
    var normals = [];
    for (var i = 0; i < vertices.length; i += 4*3) {
         var v0 = vertices.slice(i, i+3);
         var v1 = vertices.slice(i+3, i+6);
         var v2 = vertices.slice(i+6, i+9);
         var n = triangleNormal(v0, v1, v2); 
         normals = normals.concat(n);
         normals = normals.concat(n);
         normals = normals.concat(n);
         normals = normals.concat(n);
    }
    return normals;
}

function getTriangles(verticesCount) {
    var i = 0;
    var vertices = [];
    while (i < ((verticesCount / 3) - 1)) {    
        vertices = vertices.concat([i, i+1, i+2]);
        vertices = vertices.concat([i, i+2, i+3]);
        i += 4;
    }
    return vertices;
}

function toCorners(cell) {
   var wallWidth = 3;
   var y = wallWidth * (Math.floor(cell / window.WIDTH));
   var x = wallWidth * (cell % window.WIDTH);
   return [[x, y], [x+wallWidth, y], [x, y+wallWidth], [x+wallWidth, y+wallWidth]]; 
}

function contains(set, item) {
   for (var i = 0; i < set.length; i++) {
       var pair1 = set[i].sort();
       var pair2 = item.sort();
       if (pair1[0] === pair2[0] && pair1[1] === pair2[1]) {
          return true;
       }
   }
   return false;
}

function intersection(set1, set2) {
   console.log(set1);
   console.log(set2);
   var intersection = [];
   for (var i = 0; i < set1.length; i++) {
       if (contains(set2, set1[i])) {
           intersection.push(set1[i]);                         
       }
   }
   return intersection;
}

function wallTo2DProjection(cell1, cell2) {
    return intersection(toCorners(cell1), toCorners(cell2)).sort(
	function(p1, p2) { 
            if (p1[0] === p2[0]) {
                if (p1[1] === p2[1]) {
                    return 0;
                }
                return p1[1] > p2[1] ? 1 : -1;
            }
            return p1[0] > p2[0] ? 1 : -1; 
        })
}

function wallsToVertices(walls) {
    var vertices = [];
    for (var i = 0; i < walls.length; i++) {
        var wall = walls[i];
        var projection = wallTo2DProjection(wall[0], wall[1]);
        vertices = vertices.concat(calculateVertices(projection[0], projection[1]));
   }
    return vertices;
}

function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var walls = window.maze; 

  var vertices = wallsToVertices(walls);  
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  cubeVerticesNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
  var vertexNormals = getNormals(vertices);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

  var cubeVertexIndices = getTriangles(vertices.length);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

  window.verticesCount = cubeVertexIndices.length;
}

var cameraX = 0.0;
var cameraY = -1.0;
var cameraZ = -6.0;
var R = null;
var rotation = 0;

document.onkeydown = function(e) {
    var y = Vector.create([0, 1, 0]);
    e = e || window.event;

    var cameraDirection = Vector.create([0, 0, -1]);
    if (rotation !== 0) {
       var line = Line.create([0, 0, 0], y);
       cameraDirection = cameraDirection.rotate(-rotation, line);
    }
    
    var v0 = [cameraX, cameraY, cameraZ];
    var v1 = [cameraX, cameraY + 1.0, cameraZ];
    var v2 = [
        cameraX + cameraDirection.elements[0],
        cameraY + cameraDirection.elements[1],
        cameraZ + cameraDirection.elements[2]
    ];
    var cameraNormal = triangleNormal(v0, v1, v2);
    
    switch(e.key) {
        case "ArrowRight":
            cameraX += cameraNormal[0];
            cameraY += cameraNormal[1];
            cameraZ += cameraNormal[2]; 
            break;
        case "ArrowLeft":
            cameraX -= cameraNormal[0];
            cameraY -= cameraNormal[1];
            cameraZ -= cameraNormal[2];
            break;
        case "ArrowUp":
            cameraX -= cameraDirection.elements[0];
            cameraY -= cameraDirection.elements[1];
            cameraZ -= cameraDirection.elements[2];
            break;
        case "ArrowDown":
            cameraX += cameraDirection.elements[0];
            cameraY += cameraDirection.elements[1];
            cameraZ += cameraDirection.elements[2];
            break;
        case "a":
            rotation -= 0.1;
	    R = Matrix.Rotation(rotation, y);
            break
        case "s":
            rotation += 0.1;
	    R = Matrix.Rotation(rotation, y);
            break;
        default:
            console.log(event.key);
            return;
    }
};


function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  
  loadIdentity(); 
  if (R) {
      mvRotate(R);
  }
  mvTranslate([cameraX, cameraY, cameraZ]);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, window.verticesCount, gl.UNSIGNED_SHORT, 0);
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvRotate(m) {
  multMatrix(m.ensure4x4());
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));

  var normalMatrix = mvMatrix.inverse();
  normalMatrix = normalMatrix.transpose();
  var nUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
  gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
}
