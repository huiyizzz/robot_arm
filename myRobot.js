var canvas;
var gl;
var program;
var vBuffer;
var iBuffer;
var cBuffer;
var numVertices = 36;
var modelViewMatrix = mat4();
var modelViewMatrixLoc;
var vertices = [
	vec3(-0.1, 0.0, 0.1),
	vec3(-0.1, 0.2, 0.1),
	vec3(0.1, 0.2, 0.1),
	vec3(0.1, 0.0, 0.1),
	vec3(-0.1, 0.0, -0.1),
	vec3(-0.1, 0.2, -0.1),
	vec3(0.1, 0.2, -0.1),
	vec3(0.1, 0.0, -0.1)
];
var indices = [
	1, 0, 3,
	3, 2, 1,
	2, 3, 7,
	7, 6, 2,
	3, 0, 4,
	4, 7, 3,
	6, 5, 1,
	1, 2, 6,
	4, 5, 6,
	6, 7, 4,
	5, 4, 0,
	0, 1, 5
];
var theta = [0.0,0.0,0.0];
var numNodes = 3;
var figure = [];
for (var i = 0; i < numNodes; ++i) {
	figure[i] = createNode(null, null, null, null);
}
var baseId = 0;
var lowerArmId = 1;
var upperArmId = 2;
var color = [];
for (var i = 0; i < numVertices; i++) {
    color.push(vec4(0.3, 0.5, 0.8, 1.0));
}
var ball = [];
var red = [];
var r = 0.02;
for (var i = 0; i < 40; i++) {
    var t = i * 2 * Math.PI / 40;
    var x = r * Math.sin(t);
    var y = r * Math.cos(t);
    ball.push(vec3(x, y, 0.0));
    red.push(vec4(1.0, 0.0, 0.0, 1.0));
}
var instanceMatrix;
var BASE_HEIGHT = 0.1;
var LOWER_ARM_HEIGHT = 0.5;
var UPPER_ARM_HEIGHT = 0.3;
var mvStack = [];
var tX = 0.0;
var tY = 0.0;
var draw = false;
var xe;
var ye;
var ikt=[0.0, 0.0, 0.0];
var add1, add2;
var inverseK = false;

function createNode(transform, render, sibling, child){
	var node = {
	transform: transform,
	render: render,
	sibling: sibling,
	child: child
	};
	return node;
}

function initNodes(Id) {
	var m = mat4();
	switch(Id) {
	case baseId:
		m = rotate(theta[baseId], 0, 1, 0 );
		figure[baseId] = createNode( m, drawBase, null, lowerArmId);
		break;

	case lowerArmId:
		m = translate(0.0, BASE_HEIGHT, 0.0);
		m = mult(m, rotate(-90.0, 0, 0, 1 ));
		m = mult(m, rotate(theta[lowerArmId], 0, 0, 1));
		figure[lowerArmId] = createNode(m, drawLowerArm, null, upperArmId);
		break;

	case upperArmId:
		m = translate(0.0, LOWER_ARM_HEIGHT, 0.0);
		m = mult(m, rotate(0.0, 0, 0, 1 ));
		m = mult(m, rotate(theta[upperArmId], 0, 0, 1));
		figure[upperArmId] = createNode( m, drawUpperArm, null, null);
		break;
	}
}

window.addEventListener("keydown", getKey, false);
function getKey(key) {
	if (key.key == "r")
		reset();
}

function reset(){
	theta = [0.0,0.0,0.0];
	inverseK = false;
	draw=false;
}

function seti(){
	theta = [0.0,0.0,0.0];
	inverseK = true;
}

function traverse(id){
	if (id == null) return;
	if(inverseK == true &&draw == true){
		IK();
		setAngle();
	}
	initNodes(id);
	mvStack.push(modelViewMatrix);
	modelViewMatrix = mult(modelViewMatrix, figure[id].transform);
	figure[id].render();

	if (figure[id].child != null)
		traverse(figure[id].child);

	modelViewMatrix = mvStack.pop();

	if (figure[id].sibling != null) 
		traverse(figure[id].sibling);
}

function drawBase(){
	instanceMatrix = mult(modelViewMatrix, scalem(1.0, 0.5, 1.0));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

function drawLowerArm(){
	instanceMatrix = mult(modelViewMatrix, scalem(0.3, 2.5, 0.3));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

function drawUpperArm(){
	instanceMatrix = mult(modelViewMatrix, scalem(0.25, 1.5, 0.25));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

function drawBall(){
	instanceMatrix = translate(tX, tY, 0.0);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(ball), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(red), gl.STATIC_DRAW );
    gl.drawArrays(gl.TRIANGLE_FAN, 0, ball.length);
}

function setAngle(){
	if(ikt[1]!=theta[1])
		theta[1]+=add1;
	if(ikt[2]!=theta[2])
		theta[2]+=add2;
}

function IK(){
    var a = Math.pow(xe, 2) + Math.pow(ye, 2);
    var b = Math.sqrt(a);
    var cr = xe / b;
    var thetar = Math.acos(cr);
    var c = Math.pow(LOWER_ARM_HEIGHT, 2) + a - Math.pow(UPPER_ARM_HEIGHT, 2);
    var d = 2 * LOWER_ARM_HEIGHT * b;
    var c1 = c / d;
    var theta1 = thetar - Math.acos(c1);
    var e = Math.pow(LOWER_ARM_HEIGHT, 2) + Math.pow(UPPER_ARM_HEIGHT, 2) - a;
    var f = 2 * LOWER_ARM_HEIGHT * UPPER_ARM_HEIGHT;
    var c2 = e / f;
    var theta2 = Math.PI - Math.acos(c2);
    if(ye>0){
    	ikt[1] = theta1 / Math.PI * 180;
    	ikt[2] = theta2 / Math.PI * 180;
    }
    else{
    	ikt[1] = -theta1 / Math.PI * 180;
    	ikt[2] = -theta2 / Math.PI * 180;
    }
    add1=ikt[1]-theta[1];
	add1=add1/80;
	add2=ikt[2]-theta[2];
	add2=add2/80;
}

window.onload = function init(){
	canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas ); 
	if ( !gl ) { alert( "WebGL isn't available" ); }

	canvas.addEventListener("click", function() {
		if(inverseK== false)
			seti();
		tX = -1 + 2*event.clientX/canvas.width-0.025;
		tY = -1 + 2*(canvas.height-event.clientY)/canvas.height + 0.4;
		xe=tX;
    	ye=tY-BASE_HEIGHT;
    	var a = Math.pow(xe, 2) + Math.pow(ye, 2);
    	var b = Math.sqrt(a);
    	if(b<=0.8&&b>=0.2)
			draw = true;
		else
			draw = false;
	});

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
	gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");

	vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);

	var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    document.getElementById("slider0").onchange = function() {
		theta[baseId] = event.srcElement.value;
		inverseK = false;
	};
	document.getElementById("slider1").onchange = function() {
		theta[lowerArmId] = event.srcElement.value;
		inverseK = false;
	};
	document.getElementById("slider2").onchange = function() {
		theta[upperArmId] = event.srcElement.value;
		inverseK = false;
	};

    render();
};

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(inverseK == true&&draw == true){
		theta[0] = 0.0;
		drawBall();
	}
	traverse(baseId);
	
	window.requestAnimFrame( render );

}
