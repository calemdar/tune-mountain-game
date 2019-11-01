const PIXI = require("pixi.js");
const Planck = require("planck-js");
const GameObject = require("./GameObject");


function Physics(game, curvePoints) {

	const pl = Planck, Vec2 = pl.Vec2;
	const world = new pl.World(Vec2(0, 10));
	const obj = new GameObject();

	let COUNT = 10;
	let bodies = [];
	// Hard coded curves
	let allCurvePoints = [];

	let ground = world.createBody();
	ground.createFixture(pl.Edge(Vec2(0.0, 100.0), Vec2(100.0, 200.0)), 1.0);
	ground.setPosition(Vec2(0, 100));

	let circle = pl.Circle(1.0);

	for (let i = 0; i < COUNT; ++i) {
		bodies[i] = world.createDynamicBody(Vec2(0.0, 4.0 + 3.0 * i));
		bodies[i].createFixture(circle, 1.0);
		bodies[i].setLinearVelocity(Vec2(0.0, -50.0));
	}

	// physics object
	let box = world.createBody().setDynamic();
	box.createFixture(pl.Circle(0.5), 1.0);
	box.setPosition(Vec2(60.0, -10.0));
	box.setMassData({
		mass : 5,
		center : Vec2(),
		I : 1
	});

	const texture = PIXI.Texture.from("../img/ball.png");
	const husky = new PIXI.Sprite(texture);
	husky.interactive = true;
	husky.buttonMode = true;

	let gameCube = obj.create({name: "Cube", sprite: husky, physics: box, position: Vec2(10.0, 10.0), anchor: Vec2(0.5, 1), mass: box.getMass()});

	/*
	gameCube.sprite.on("tap", (event) => {
		//handle event
		console.log("clicked");
		gameCube.physics.applyAngularImpulse(-100.0, true);
	});
	*/

	// add game object to scene
	game.stage.addChild(gameCube.sprite);

	/*
	gameCube.sprite = husky;
	gameCube.position.Planck = box.getPosition();
	gameCube.scale = 1.0;
	gameCube.mass = box.getMass();s
	gameCube.physics.body = box;
	*/

	//console.log(gameCube);

	// Physics Bezier Curve
	const cubicBezierPoint = function (t, p0, p1, c0, c1) {

		//return (1-t)^3 * p0 + 3*(1-t)^2 * t * c0 + 3*(1-t) * t^2 * c1 + t^3 * p1
		//       {   first   }  {      second     }  {      third      }  { fourth }
		let point;
		let addVectors;
		let first = multiplyVec(p0, ((1-t)*(1-t)*(1-t)));
		let second = multiplyVec(c0, (3 * ((1-t)*(1-t)) * t));
		let third = multiplyVec(c1, (3 * (1-t) * (t*t)));
		let fourth = multiplyVec(p1, (t*t*t));


		addVectors = addVec(first, second);
		addVectors = addVec(addVectors, third);
		addVectors = addVec(addVectors, fourth);

		point = addVectors;

		return point;

	};

	const bezierCurvePoints = function(p0, c0, c1, p1) {

		let t;
		let numPoints = 20;
		let point = Vec2();
		let curvePoints = [];
		let currentPoint = 1;

		for(let i = 0; i < numPoints; i++){
			t = i / numPoints;
			point = cubicBezierPoint(t, p0, p1, c0, c1);

			allCurvePoints.push(point);
			currentPoint++;
		}

		//return curvePoints;
	};

	const physicalBezierCurve = function (points) {
		let line;

		let drawVertex1 = new PIXI.Graphics();
		drawVertex1.beginFill(0x00FF00, 1);
		for(let i = 0; i < points.length - 1; i+=1){

			let vertex1 = points[i];
			let vertex2 = points[i+1];

			// Pixi drawing
			drawVertex1.drawCircle(vertex1.x, vertex1.y, 2);
			drawVertex1.drawCircle(vertex2.x, vertex2.y, 2);

			line = world.createBody();

			drawVertex1.drawRect(vertex1.x, vertex1.y, 0.01, 0.01);
			drawVertex1.drawRect(vertex2.x, vertex2.y, 0.01, 0.01);

			line.createFixture(pl.Box(subtractVec(vertex2, vertex1).x, 0.01), 1.0);
			//line.createFixture(pl.Edge(points[i], points[i+1]), 0.0);
			line.setPosition(findMidpoint(vertex1, vertex2));

			// Find start of new curve
			if(i === 19){

				let vertex0 = points[i-1];
				line.setAngle(findAngle(vertex0, vertex2));
			}
			else{
				line.setAngle(findAngle(vertex1, vertex2));
			}

			console.log("Point " + i + " Angle " + findAngle(vertex1, vertex2));

		}

		drawVertex1.endFill();

		game.stage.addChild(drawVertex1);
	};

	const multiplyVec = function (vector, number){
		let result = Vec2();

		result.x = vector.x * number;
		result.y = vector.y * number;

		return result;
	};

	const addVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x + vector2.x;
		result.y = vector1.y + vector2.y;

		return result;
	};

	const subtractVec = function (vector1, vector2){
		let result = Vec2();

		result.x = vector1.x - vector2.x;
		result.y = vector1.y - vector2.y;

		return result;
	};

	const findMidpoint = function (point1, point2){
		let result = Vec2();

		result.x = (point1.x + point2.x) / 2.0;
		result.y = (point1.y + point2.y) / 2.0;

		return result;
	};

	const findAngle = function (point1, point2) {

		let angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
		return angle;
	};

	const getCurvePoints = function (){

		for(let i = 0; i < curvePoints.length; i+=1){
			//bezierCurvePoints(Vec2(25,25), Vec2(100,200), Vec2(200,200), Vec2(240,150));
			//bezierCurvePoints(Vec2(240,150), Vec2(350,150), Vec2(450,350), Vec2(700,200));

			bezierCurvePoints(curvePoints[i][0], curvePoints[i][1], curvePoints[i][2], curvePoints[i][3]);
		}


		physicalBezierCurve(allCurvePoints);
	};

	// Testing
	getCurvePoints();


	const renderStep = function() {
		world.step(1 / 60);
		// iterate over bodies and fixtures
		for (let body = world.getBodyList(); body; body = body.getNext()) {

			for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
				// draw or update fixture
			}

			//console.log(body.getPosition());
		}
		let physicsPos = obj.renderPosition(gameCube, game);

	};



	game.ticker.add(renderStep);
	return allCurvePoints;
}

module.exports = Physics;