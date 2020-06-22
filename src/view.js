
//----------------------------------------------
//добавляем матрицы
//----------------------------------------------


const VSHADER_SOURCE = //источник кода для вершинного шейдера
    'attribute vec3 a_Position;\n' +
    'varying vec3 v_Color;\n' +
    'uniform mat4 u_mMatrix;\n' +  //new
    'uniform mat4 u_vMatrix;\n' + //new
    'uniform mat4 u_pMatrix;\n' + //new
    'void main() {\n' +
    '   v_Color=vec3(a_Position);\n' +
    // '   gl_Position=vec4(a_Position, 1.0);\n' + //координаты точки
    '   gl_Position=u_pMatrix*u_vMatrix*u_mMatrix*vec4(a_Position,1.0);\n' + //new
    '}\n';

const FSHADER_SOURCE = //источник кода для фрагментного шейдера
    'precision mediump float;\n' +
    'varying vec3 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor=vec4(1,1,1, 1.0);\n' + //цвет точки
    '}\n';

let gl;
let shaderProgram;
let vertexArray = []; //элементы чередуются: первый - x, второй - y

//матрицы

let pMatrix=mat4.create(); //new
let mMatrix=mat4.create(); //new
let vMatrix=mat4.create(); //new


const viewButtons = document.querySelectorAll(".editor .editor__buttons button");


function initShaders() {
    const VS = getShader(gl.VERTEX_SHADER, VSHADER_SOURCE); //получаем вершинный шейдер
    const FS = getShader(gl.FRAGMENT_SHADER, FSHADER_SOURCE); //получаем фрагментный шейдер

    shaderProgram = gl.createProgram(); //создаем программу
    gl.attachShader(shaderProgram, VS); //добавляем в нее вершинный шейдер
    gl.attachShader(shaderProgram, FS); //добавляем в нее фрагментный шейдер
    gl.linkProgram(shaderProgram); //связываем добавленные шейдеры
    gl.useProgram(shaderProgram); //начинаем использование программы

    //определение переменных
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'a_Position');
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.MMatrix = gl.getUniformLocation(shaderProgram, 'u_mMatrix'); //new
    shaderProgram.VMatrix = gl.getUniformLocation(shaderProgram, 'u_vMatrix'); //new
    shaderProgram.PMatrix = gl.getUniformLocation(shaderProgram, 'u_pMatrix'); //new
}


function getShader(type, source) {
    let shader;
    shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}



function draw() {

    //example
    vertexArray = [
            // // лицевая часть
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
             0.5, 0.5, 0.5,
             0.5, -0.5, 0.5,
            // задняя часть 
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
             0.5, 0.5, -0.5,
             0.5, -0.5, -0.5
    ];

    
    let vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

    
    let indexArray = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 4, 5, 5, 6, 6,7, 7,4, 1, 5, 2, 6, 3, 7];
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    
    gl.vertexAttribPointer(shaderProgram.vertexPosition, 3, gl.FLOAT, gl.FALSE, 0, 0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //--------ДЛЯ ПРИМЕРА-------------

    gl.drawElements(gl.LINES, indexArray.length, gl.UNSIGNED_SHORT,0);
    //-----------------------------

}

window.onload = function () {
    const canvas = document.querySelector('#canvas');
    if (!canvas) {
        console.log('failed');
        return;
    }
    canvas.width = 500;
    canvas.height = 500;

    try {
        gl = canvas.getContext("webgl", {
            antialias: false
        });
    } catch (e) {
        alert("You are not webgl compatible :(");
    }

    if (gl) {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        initShaders();

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0,0,0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        setupWebGL();
        set2D(); //new 
        setMatrixUniforms(); //new 
        draw();
    }
}

 //new function
 function setupWebGL() {
    mat4.identity(pMatrix);
    mat4.identity(vMatrix);
    mat4.identity(mMatrix);
}

function set2D() {
    mat4.identity(pMatrix);
    mat4.identity(vMatrix);
    mat4.identity(mMatrix);
    setMatrixUniforms();
    draw();
    disableViewButtons();
}

function set3D() {
    mat4.set(
        [0.9914448857307434, 0, -0.13052618503570557, 0,
         0.017037086188793182, 0.9914448857307434, 0.129409521818161, 0, 
         0.129409521818161, -0.13052618503570557, 0.982962965965271, 0,
         0, 0, 0, 1], vMatrix);
    setMatrixUniforms();
    draw();
    enableViewButtons();
}
function zoomIn() {
    mat4.scale(vMatrix, [2, 2, 2], vMatrix);
    setMatrixUniforms();
    draw();
}
function zoomOut() {
    mat4.scale(vMatrix, [0.5, 0.5, 0.5], vMatrix);
    setMatrixUniforms();
    draw();
}
function turnRight() {
    mat4.rotate(vMatrix, Math.PI/24, [0,1,0], vMatrix);
    setMatrixUniforms();
    draw();
}
function turnLeft() {
    mat4.rotate(vMatrix, -Math.PI/24, [0,1,0], vMatrix);
    setMatrixUniforms();
    draw();
}
function moveForward () {
    mat4.translate(vMatrix, [0,0, 0.3], vMatrix);
    setMatrixUniforms();
    draw();
}
function moveBackward () {
    mat4.translate(vMatrix, [0,0, -0.3], vMatrix);
    setMatrixUniforms();
    draw();
}
//new function
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.PMatrix,false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.VMatrix, false, vMatrix);  
    gl.uniformMatrix4fv(shaderProgram.MMatrix, false, mMatrix);  
}

function disableViewButtons() {
    viewButtons.forEach(btn => {
        if (!(btn.innerHTML=='2D' || btn.innerHTML=='3D')) {
            btn.setAttribute("disabled", true);
        }
    })
}
function enableViewButtons() {
    viewButtons.forEach(btn => {
        if (!(btn.innerHTML=='2D' || btn.innerHTML=='3D')) {
            btn.removeAttribute("disabled");
        }
    })
    console.log(viewButtons);
}

function makeBig() {
    const canvas = document.querySelector('#canvas');
    canvas.style.position="fixed";
    canvas.style.top="0";
    canvas.style.left="10%";
    canvas.width=1000;
    canvas.height=1000;
}

function makeSmall() {
    const canvas = document.querySelector('#canvas');
    canvas.style.position="initial";
    canvas.width=500;
    canvas.height=500;
}