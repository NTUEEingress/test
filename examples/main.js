if (!Detector.webgl) Detector.addGetWebGLMessage();
//environment setting
var container, stats;

var camera, controls, scene, renderer;
//mouse setting
var raycaster;

var mouse_click = new THREE.Vector2(),
INTERSECTED_M,
INTERSECTED_C;
var mouse_move = new THREE.Vector2();
//portal setting
var num = 10;
var nodeList = [];
var x = [],
y = [],
z = 0;
var portalColor = [];
var radius = 40,
sections = 180;
var ball_basic_color = 0xffffff;
//uid setting { 0 , 1 }
var uid;
//helicopter setting
var helicopter = [],
velocity = [],
destination = [],
move_or_not = [false, false];
var initialposition = [];
var closeToPortal = [false, false],
portalId = [];
var helicopter_radius = 35;
var hori_sections = 20;
var vert_sections = 20;
var helicopter_color = [0xff0000, 0x00ff00];
var time_init = [];
var Time;
//scores setting
var tower = [0, 0];
var score = [0, 0];
var timeOrigin = [];
var controlled = [];
var controlSpeedUp = [];
var ableToControl = [];

var gameStartTime;
//buff variables
var PortalEffect = []; //-1: random, 0: speed buff, 1: score buff, 2: 100 points, 3: speed up control
var buffStartTime = [];
var buffDuration = [];
var buffResetTime = [];
var buffExist = [];
var buffActivated = [];
var isRandom = [];
var BuffBlocks = []
var Buffmaterial = [];
// BL building
var bl = new THREE.Object3D();

var CountStart = 0,
NUM = "6",
NUMP = "6",
PID = 5,
Source = 0;
var MAP = new Map();
MAP.set("6", 1);
//for score
var SCORES = 0;
var tower = [0, 0];
var score = [0, 0];
var scoreStartTime;
var scoreRatio = [1, 1];
// outline
var circleSegment = new Array(5);
var pieces = 60;

start();
init();
animate();

//when player uid=0 enter the website
function start() {
	uid = parseInt(prompt('enter your uid'));
	if (uid == 1) {
		var BEGIN = new CustomEvent('BEGIN', {
			'detail': -1
		});
		console.log(BEGIN);
		window.dispatchEvent(BEGIN);
	}
}

function init() {
	// camera
	camera = new THREE.PerspectiveCamera(60, (window.innerWidth * 0.6) / (window.innerHeight * 0.9), 1, 20000);
	camera.position.set(0, - 800, 1000);
	camera.rotation.set(1500, 0, 0);
	console.log(camera);

	//score
	scoreStartTime = Date.now();
	gameStartTime = Date.now();

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xcccccc, 0);

	//Circles
	var geometry_circle = new THREE.CircleGeometry(radius, sections);

	colorCountTime = Date.now();

	//put circles into the screen
	for (var i = 0; i < num; i++) {
		var mesh_circle = new THREE.Mesh(geometry_circle, new THREE.MeshBasicMaterial({
			color: ball_basic_color,
			side: THREE.DoubleSide
		}));
		x[i] = Math.cos(2 * Math.PI * i / num) * 200;
		y[i] = Math.sin(2 * Math.PI * i / num) * 200;
		mesh_circle.position.x = x[i];
		mesh_circle.position.y = y[i];
		mesh_circle.position.z = z;
		console.log(mesh_circle.position);
		controlled[i] = 100;
		portalColor[i] = 0;
		scene.add(mesh_circle);
		nodeList.push(mesh_circle);
	}

	SetPortalEffect();
	raycaster = new THREE.Raycaster();

	// helicopter
	for (var i = 0; i < 2; i++) {
		/*var geometry_helicopter = new THREE.SphereGeometry( helicopter_radius , hori_sections , vert_sections ) ;
		  var material_helicopter ;
		  if ( i == 1 ) material_helicopter = new THREE.MeshLambertMaterial( { color: helicopter_color[1] } ) ;
		  else material_helicopter = new THREE.MeshLambertMaterial( { color: helicopter_color[0] } ) ;
		  var sss = new THREE.Mesh( geometry_helicopter , material_helicopter ) ;*/
		velocity[i] = 50;

		helicopter[i] = new THREE.Object3D();
		//helicopter[i].add(sss);
		helicopter[i].position.x = x[0];
		helicopter[i].position.y = y[0];
		helicopter[i].position.z = 50 * (i * 2 - 1);

		scene.add(helicopter[i]);
	}
	// load helicopter model
	var loader = new THREE.ColladaLoader();
	loader.load('/ar-drone-2.dae', function(result) {
		result.scene.scale.divideScalar(2);
		console.log("=DDD");
		helicopter.forEach(function(h) {
			var s = result.scene.clone();
			h.add(s);
			console.log("=))))");
		});
		render();
	});

	destination[0] = new THREE.Vector2(x[0], y[0]);
	destination[1] = new THREE.Vector2(x[0], y[0]);
	initialposition[0] = new THREE.Vector2(x[0], y[0]);
	initialposition[1] = new THREE.Vector2(x[0], y[0]);
	for (var i = 0; i < 2; i++) {
		destination[i].x = x[0];
		destination[i].y = y[0];
		initialposition[i].x = x[0];
		initialposition[i].y = y[0];
	}
	//Timer(outline) init
	for (var i = 0; i < num; i++) {
		circleSegment[i] = new Array(pieces);
		for (var j = 0; j < pieces; j++) {
			var outline_geometry = new THREE.RingGeometry(40, 50, 3, 3, j * 2 * Math.PI / pieces, 2 * Math.PI / pieces);
			var outline_material = new THREE.MeshBasicMaterial({
				color: 0xffff00,
				side: THREE.DoubleSide
			});
			circleSegment[i][j] = new THREE.Mesh(outline_geometry, outline_material);
			circleSegment[i][j].position.x = x[i];
			circleSegment[i][j].position.y = y[i];
			circleSegment[i][j].position.z = z;
			circleSegment[i][j].material.visible = false;

			scene.add(circleSegment[i][j]);
		}
	}

	SetPortalEffect();

	// lights
	light = new THREE.AmbientLight(0xaaaaaa);
	scene.add(light);
	//Grid Plane
	var size = 400,
	step = 50;
	var geometry_plane = new THREE.Geometry();
	var material_plane = new THREE.LineBasicMaterial({
		color: 'white'
	});

	for (var i = - size; i <= size; i += step) {
		geometry_plane.vertices.push(new THREE.Vector3( - size, i, - 1));
		geometry_plane.vertices.push(new THREE.Vector3(size, i, - 1));

		geometry_plane.vertices.push(new THREE.Vector3(i, - size, - 1));
		geometry_plane.vertices.push(new THREE.Vector3(i, size, - 1));
	}
	var line = new THREE.Line(geometry_plane, material_plane, THREE.LinePieces);
	scene.add(line);

	//BL building

/*	
   loader = new THREE.ColladaLoader();
   loader.load('/blmodel.dae',
   function(result){
   		result.scene.scale.divideScalar(0.01);
   		bl = result.scene;
   		scene.add(bl);
   		bl.position.set(-1500,0,0);
   		render();
   });
*/
   // Buff Hints

    Buffmaterial[0] = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('speedup.gif')
    });
	Buffmaterial[1] = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('scorebuff.png')
	});
	Buffmaterial[2] = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('100point.png')
	});
	Buffmaterial[3] = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('speedupcontrol.png')
	});
	Buffmaterial[4] = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('random.jpg')
	});
	Buffmaterial[100] = new THREE.MeshLambertMaterial({
		color: 'white'
	})
	Buffmaterial[100].visible = false;
	for(var i = 0;i < num; i ++){
    	BuffBlocks[i] = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), Buffmaterial[i]);
    	BuffBlocks[i].overdraw = true;
    	scene.add(BuffBlocks[i]);
		BuffBlocks[i].material.visible = true;
		BuffBlocks[i].position.x = x[i];
		BuffBlocks[i].position.y = y[i];
		BuffBlocks[i].position.z = z;
	}

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(scene.fog.color);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.9);

	renderer.domElement.setAttribute("id", "main-canvas");
	container = document.getElementById('canvas-wrapper');
	container.appendChild(renderer.domElement);

	var renderDOM = document.getElementById('main-canvas');
	renderDOM.addEventListener('mousedown', onDocumentMouseDown, false);

	controls = new THREE.TrackballControls(camera, renderDOM);

	controls.rotateSpeed = 1.2;
	controls.zoomSpeed = 1.0;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [65, 83, 68];

	controls.addEventListener('change', render);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);

	window.addEventListener('resize', onWindowResize, false);

	render();

	console.log("initialized");

}
function reinit() {
	BuffDetector(Date.now() + 200000);
	BuffResetDetector(Date.now() + 200000);
	SetPortalEffect();
	scoreStartTime = Date.now();
	gameStartTime = Date.now();
	camera.position.set(0, - 400, 800);
	for (var i = 0; i < 2; i++) {
		helicopter[i].position.x = x[0];
		helicopter[i].position.y = y[0];
		destination[i].x = x[0];
		destination[i].y = y[0];
		velocity[i] = 50;

	}
	score = [0, 0];
	colorCountTime = Date.now();
	for (var i = 0; i < num; i++) {
		portalColor[i] = 0;
		controlled[i] = 100;
	}
}

function onWindowResize() {
	camera.aspect = (window.innerWidth * 0.6) / (window.innerHeight * 0.9);
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.9);

	controls.handleResize();

	render();
}
//Origin
function onDocumentMouseDown(event) {
	event.preventDefault();

	var button = event.button;
	console.log("Click.");
	mouse_click.x = ((event.clientX - window.innerWidth * 0.3 - 20) / (window.innerWidth * 0.6) * 2 - 1);
	mouse_click.y = ( - 1 * (event.clientY - 28) / (window.innerHeight * 0.9) * 2 + 1);
	//move helicopter
	raycaster.setFromCamera(mouse_click, camera);
	var intersect_click = raycaster.intersectObjects(nodeList);

	if (intersect_click.length > 0) {
		var timeInit = Math.floor( Date.now() ) ;
		for (var i = 0; i < num; i++) {
			if (x[i] == intersect_click[0].object.position.x && y[i] == intersect_click[0].object.position.y) {
				var mouseclick = new CustomEvent('mouseclick', {
					'detail': timeInit * 100 + uid * 10 + i
				});
				window.dispatchEvent(mouseclick);
				break;
			}
		}
	}	
	console.log(destination[uid].x, destination[uid].y);
}

function receiveMouseEvent(uid, portalid, timeInit) {
	//helicopter move or not
	console.log(portalid);
	initialposition[uid].x = helicopter[uid].position.x;
	initialposition[uid].y = helicopter[uid].position.y;
	destination[uid].x = scene.children[portalid].position.x;
	destination[uid].y = scene.children[portalid].position.y;
	time_init[ uid ] = timeInit ;
	move_or_not[uid] = true;
}

function animate() {

	changeColor();
	updatescore();
	BuffDetector(Date.now());
	BuffResetDetector(Date.now());
	AutoGetBuff();
	controls.update();
	move_helicopter();
	BuffAnimate();
	requestAnimationFrame(animate);
}
function changeColor() {
	var TimeNow = Date.now();
	var delta = (TimeNow - colorCountTime) * 3 / 50;
	colorCountTime = TimeNow;
	for (var i = 0; i < num; i++) {
		var nearPortal = [false, false];
		var originPositive, nowPositive;
		if (portalColor[i] > 0) originPositive = true;
		else if (portalColor[i] < 0) originPositive = false;
		for (var j = 0; j < 2; j++) {
			if (Math.hypot(helicopter[j].position.x - x[i], helicopter[j].position.y - y[i]) < radius && ableToControl[j] >= 1) nearPortal[j] = true;
		}
		if (nearPortal[0] == true){
			if (controlSpeedUp[0])	portalColor[i] += 2 * delta;
			else	portalColor[i] += delta;
		}
		if (nearPortal[1] == true){
			if (controlSpeedUp[1])	portalColor[i] -= 2 * delta;
			else	portalColor[i] -= delta;
		}
		if (nearPortal[0] == false && nearPortal[1] == false) {
			if (controlled[i] == 0) portalColor[i] += delta;
			else if (controlled[i] == 1) portalColor[i] -= delta;
			else if (controlled[i] == 100) {
				if (Math.abs(portalColor[i]) < delta)	portalColor[i] = 0;
				else{
					if (portalColor[i] > 0) portalColor[i] -= delta;
					else if (portalColor[i] < 0) portalColor[i] += delta;
				}
			}
		}
		if (portalColor[i] > 0) nowPositive = true;
		else if (portalColor[i] < 0) nowPositive = false;
		var tmpColor = Math.round(portalColor[i]);
		if (portalColor[i] == 0 || (originPositive && !nowPositive) || (!originPositive && nowPositive)) controlled[i] = 100;
		else if (portalColor[i] >= 300){
			tmpColor = 300, portalColor[i] = 300, controlled[i] = 0;
			getBuff(i, 0);
		}
		else if (portalColor[i] <= - 300){
			tmpColor = - 300, portalColor[i] = - 300, controlled[i] = 1;
			getBuff(i, 1);
		}
		if (tmpColor == 0) {
			scene.children[i].material.color.setHex(0xffffff);
		} else if (tmpColor > 0) {
			scene.children[i].material.color.setHex(0xffffff - 0x000101 * Math.floor(tmpColor / 300 * 255));
		} else if (tmpColor < 0) {
			scene.children[i].material.color.setHex(0xffffff - 0x010001 * Math.floor( - tmpColor / 300 * 255));
		}
		setCircle(i, Math.round(portalColor[i] / 300 * pieces));
	}
}
function setCircle(i, numOfSegment) {
	if (numOfSegment > pieces) numOfSegment = pieces;
	else if (numOfSegment < - pieces) numOfSegment = - pieces;
	for (var j = 0; j < Math.abs(numOfSegment); j++) {
		if (numOfSegment > 0) {
			circleSegment[i][j].material.visible = true;
			circleSegment[i][j].material.color.setHex(0xff00ff);
		} else if (numOfSegment < 0) {
			circleSegment[i][pieces - j - 1].material.visible = true;
			circleSegment[i][pieces - j - 1].material.color.setHex(0xffff00);
		}
	}
	for (var j = Math.abs(numOfSegment); j < pieces; j++) {
		if (numOfSegment > 0) {
			circleSegment[i][j].material.visible = false;
		} else if (numOfSegment <= 0) {
			circleSegment[i][pieces - j - 1].material.visible = false;
		}
	}
}
//portalEffect manager
function SetRandomPortal(i) {
	PortalEffect[i] = Math.floor(8 * Math.random());
	buffResetTime[i] = 120000;
	if (PortalEffect[i] == 0) {
		buffDuration[i] = 60000;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	}
	else if (PortalEffect[i] == 1) {
		buffDuration[i] = 30000;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	}
	else if (PortalEffect[i] == 2) {
		buffDuration[i] = 0;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	}
	else if (PortalEffect[i] == 3) {
		buffDuration[i] = 60000;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	} 
	else if (PortalEffect[i] == 4) {
		buffDuration[i] = 0;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	}
	else if (PortalEffect[i] == 5) {
		buffDuration[i] = 0;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	} 
	else if (PortalEffect[i] == 6) {
		buffDuration[i] = 30000;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	} 
	else if (PortalEffect[i] == 7) {
		buffDuration[i] = 30000;
		buffExist[i] = true;
		buffActivated[i] = - 1;
	}
}
function SetPortalEffect() {
	//Speed Buff
	PortalEffect[0] = - 1;
	PortalEffect[1] = 0;
	PortalEffect[2] = 1;
	PortalEffect[3] = 2; //-1: random, 0: speed buff, 1: score buff, 2: 100 points, 3: speed up control
	PortalEffect[4] = 3; //effect 0~3, reset all portals, remove all buffs, cannot control, enemy cannot control
	/*
	   PortalEffect[1] = 0;
	   PortalEffect[2] = 1;
	   PortalEffect[3] = 2;
	   PortalEffect[4] = 3;
	   */
	controlSpeedUp = [false, false];
	ableToControl = [1, 1]; // if small than 1, it can't control portals
	for (var i = 0; i < num; i++) {
		isRandom[i] = false;
		if (PortalEffect[i] == - 1) {
			isRandom[i] = true;
			SetRandomPortal(i);
		}
		else if (PortalEffect[i] == 0) {
			buffDuration[i] = 60000;
			buffResetTime[i] = 120000;
			buffExist[i] = true;
			buffActivated[i] = - 1;
		}
		else if (PortalEffect[i] == 1) {
			buffDuration[i] = 30000;
			buffResetTime[i] = 120000;
			buffExist[i] = true;
			buffActivated[i] = - 1;
		}
		else if (PortalEffect[i] == 2) {
			buffDuration[i] = 0;
			buffResetTime[i] = 120000;
			buffExist[i] = true;
			buffActivated[i] = - 1;
		}
		else if (PortalEffect[i] == 3) {
			buffDuration[i] = 60000;
			buffResetTime[i] = 120000;
			buffExist[i] = true;
			buffActivated[i] = - 1;
		}

	}

	//
}
function getBuff(i, j) {
	if (buffExist[i]) {
		if (PortalEffect[i] == 0) {
			velocity[j] *= 2;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
			buffActivated[i] = j;
		}
		else if (PortalEffect[i] == 1) {
			scoreRatio[j] *= 2;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
			buffActivated[i] = j;
		}
		else if (PortalEffect[i] == 2) {
			score[j] += 100;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
		}
		else if (PortalEffect[i] == 3) {
			controlSpeedUp[j] = true;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
			buffActivated[i] = j;
		}
		else if (PortalEffect[i] == 4) {
			for (var k = 0; k < num; k++) {
				portalColor[k] = 0;
				controlled[k] = 100;
			}
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
		}
		else if (PortalEffect[i] == 5) {
			BuffDetector(Date.now() + 200000);
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
		}
		else if (PortalEffect[i] == 6) {
			ableToControl[j] --;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
			buffActivated[i] = j;
		}
		else if (PortalEffect[i] == 7) {
			if (j == 0) ableToControl[1] --;
			else ableToControl[0] --;
			buffStartTime[i] = Date.now();
			buffExist[i] = false;
			buffActivated[i] = j;
		}
	}
}
//Buffs halt
function BuffDetector(dateNow) {
	for (var i = 0; i < num; i++) {
		if (buffActivated[i] != - 1) {
			if (PortalEffect[i] == 0 && (dateNow - buffStartTime[i] > buffDuration[i])) {
				velocity[buffActivated[i]] /= 2;
				buffActivated[i] = - 1;
			}
			if (PortalEffect[i] == 1 && (dateNow - buffStartTime[i] > buffDuration[i])) {
				scoreRatio[buffActivated[i]] /= 2;
				buffActivated[i] = - 1;
			}
			if (PortalEffect[i] == 3 && (dateNow - buffStartTime[i] > buffDuration[i])) {
				controlSpeedUp[buffActivated[i]] = false;
				buffActivated[i] = - 1;
			}
			if (PortalEffect[i] == 6 && (dateNow - buffStartTime[i] > buffDuration[i])) {
				ableToControl[buffActivated[i]] ++;
				buffActivated[i] = - 1;
			}
			if (PortalEffect[i] == 7 && (dateNow - buffStartTime[i] > buffDuration[i])) {
				if(buffActivated[i] == 0)	ableToControl[1] ++;
				else if(buffActivated[i] == 1)	ableToControl[0] ++;
				buffActivated[i] = - 1;
			}
		}

	}
}
function BuffResetDetector(dateNow) {
	for (var i = 0; i < num; i++) {
		if (!buffExist[i] && (dateNow - buffStartTime[i] > buffResetTime[i])) {
			buffExist[i] = true;
			if (isRandom[i]) SetRandomPortal(i);
		}

	}
}
function AutoGetBuff() {
	for (var i = 0; i < num; i++) {
		if (buffExist[i]) {
			if (controlled[i] == 1) getBuff(i, 1);
			else if (controlled[i] == 0) getBuff(i, 0);
		}
	}
}
function BuffAnimate(){
	for(var i = 0;i < num; i++){
		BuffBlocks[i].rotation.z += Math.PI/180;
		if(buffExist[i]){
			for(var j = 0;j < 4;j ++){
				if(PortalEffect[i] == j){
					BuffBlocks[i].material = Buffmaterial[j];
				}
			}
			if(PortalEffect[i] == -1){
				BuffBlocks[i].material = Buffmaterial[4];
			}
		}else{
			BuffBlocks[i].material = Buffmaterial[100];
		}
		
	}
	
}

function move_helicopter() {
	//move helicopter
	Time = Date.now();
	var distance_init_dest = [];
	var distance_init_heli = [];
	for (var i = 0; i < 2; i++) {
		distance_init_dest[i] = Math.hypot(destination[i].x - initialposition[i].x, destination[i].y - initialposition[i].y);
		distance_init_heli[i] = Math.hypot(helicopter[i].position.x - initialposition[i].x, helicopter[i].position.y - initialposition[i].y);
		if (distance_init_dest[i] <= distance_init_heli[i]) {
			helicopter[i].position.x = destination[i].x;
			helicopter[i].position.y = destination[i].y;
			move_or_not[i] = false;
		} else if (move_or_not[i] == true) {
			helicopter[i].position.x = initialposition[i].x + velocity[i] * (destination[i].x - initialposition[i].x) / distance_init_dest[i] * (Time - time_init[i]) / 1000;
			helicopter[i].position.y = initialposition[i].y + velocity[i] * (destination[i].y - initialposition[i].y) / distance_init_dest[i] * (Time - time_init[i]) / 1000;
		}
	}
	renderer.render(scene, camera);
	//console.log(destination[uid].x,destination[uid].y);
	//console.log(helicopter[uid].position.x,helicopter[uid].position.y);
}
function render() {
	renderer.render(scene, camera);
	//stats.update();
}

function updatetower() {

}
//update gametime
function updatescore() {
	var timeNow = Date.now();
	for (var i = 0; i < num; i++) {
		if (controlled[i] == 0) score[0] += scoreRatio[0] * (timeNow - scoreStartTime) / 1000;
		else if (controlled[i] == 1) score[1] += scoreRatio[1] * (timeNow - scoreStartTime) / 1000;
	}
	scoreStartTime = timeNow;
	document.getElementById("score").innerHTML = Math.floor(score[0]) + ":" + Math.floor(score[1]);
	var gameTimeMin = ((Date.now() - gameStartTime) / 1000) / 60;
	var gameTimeSec = ((Date.now() - gameStartTime) / 1000) % 60;
	document.getElementById("gametime").innerHTML = Math.floor(gameTimeMin) + " min " + Math.floor(gameTimeSec) + " sec";
}

