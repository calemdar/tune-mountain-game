const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;
const GameObject = require("./GameObject");

/**
 * Places the snowball coins onto the mountain slope
 * @param analysis - analysis received from Spotify
 * @param allPoints - all the points of the curve
 * @param viewport - camera viewport
 * @param player - player object
 * @param game - pixi.js application
 * @param world - physics world
 * @param deletedBodies - any physical bodies to be deleted
 * @param score - game score
 * @returns {[]} - list of coin sprites
 */
function Coins(analysis, allPoints, viewport, player, game, world, deletedBodies, score) {
	const obj = new GameObject();
	let currentSection;
	let allPointCounter = 0;			// counts all points from the physics
	let coinSprites = [];				// stores all coin sprite objects
	let coinObjects = [];				// stores all coin game objects
	let maxCoinSeries = 10;				// max count of coins to spread in series
	let beatLength;						// num beats / curve resolution
	let curvedCoins = [];				// array to store bezier curve points
	let mountainOffset = 5;
	let rampOffset = 0;

	// setup texture
	const texture = PIXI.Texture.from("../img/snowball1.png");
	//let coinAudio = new Audio("../audio/snowball-trimmed.mp3");


	// Start laying coins
	for(let i = 0; i < analysis.sections.length; i+=1){

		currentSection = analysis.sections[i];
		//sectionBeats = getBeatsInSection(currentSection);

		allPointCounter += (60 - maxCoinSeries);

		for(let k = 0; k < maxCoinSeries; k+=1) {

			if(allPointCounter >= allPoints.length){
				break;
			}

			let coinPos = {x: allPoints[allPointCounter].x, y: allPoints[allPointCounter].y - mountainOffset - rampOffset};
			createPlaceCoin(coinPos.x, coinPos.y);

			allPointCounter++;
		}

		// create curve with coins
		let curveStart = coinSprites[coinSprites.length - 1].position;
		//console.log(curveStart);

		let curveC0 = Planck.Vec2(curveStart.x + 10, curveStart.y - 5);
		let curveC1 = Planck.Vec2(curveStart.x + 30, curveStart.y - 10);
		let curveEnd = Planck.Vec2(curveStart.x + 60, curveStart.y - 2);
		curvedCoins = bezierCurvePoints(curveStart, curveC0, curveC1, curveEnd);

		//console.log(curvedCoins);
		for(let j = 0; j < curvedCoins.length; j++){
			createPlaceCoin(curvedCoins[j].x, curvedCoins[j].y);
		}
		curvedCoins = [];
	}

	// collision with coin
	world.on("begin-contact", contact => {
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();

		let bodyA = fixtureA.getBody();
		let bodyB = fixtureB.getBody();

		let playerA = bodyA === player.physics;
		let playerB = bodyB === player.physics;

		if (playerA || playerB) {
			if(fixtureA.getShape().m_type === fixtureB.getShape().m_type){
				//console.log("two circles collided");

				// delete coin if player is body A
				if(bodyA === player.physics){

					//bodyB.getWorld().destroyBody(bodyB);
					deletedBodies.push(bodyB);
					collectCoin(bodyB);
				}

				// else delete the other body
				else{

					//bodyA.getWorld().destroyBody(bodyA);
					deletedBodies.push(bodyA);
					collectCoin(bodyA);
				}
			}
		}
	});

	function createPlaceCoin(posX, posY){
		let coin = new PIXI.Sprite(texture);

		coin.scale.x = 0.2;
		coin.scale.y = 0.2;
		//coin.anchor.x = 0.5;
		//coin.anchor.y = 1.0;

		coin.position.x = posX;
		coin.position.y = posY;

		let coinPhysics = world.createBody().setStatic();
		let coinFixture = coinPhysics.createFixture(Planck.Circle(3.0));
		coinPhysics.setPosition(Planck.Vec2(coin.position.x, coin.position.y));
		coinFixture.setSensor(true);

		// increase ramp offset
		//rampOffset += 3;

		let coinObj = obj.create({name: "coin"+ coinSprites.length, position: coin.position, physics: coinPhysics});
		coinObjects.push(coinObj);
		coinSprites.push(coin);
		viewport.addChild(coin);
	}

	// Check collision between sprites
	function collectCoin(coinBody) {
		let playerPos = player.position;
		let closestCoin;

		for(let i = 0; i < coinObjects.length; i++){
			let currCoin = coinObjects[i];
			if(coinBody === currCoin.physics && currCoin.sprite != null){
				viewport.removeChild(coinSprites[i]);
				playCoinSoundAsync();
				currCoin.sprite = null;
				//console.log("Collected coin in index: " + i);
				score.updateScore(10);
				break;
			}
		}

	}

	// psuedo delete the sprite by moving it out of screen
	function deleteCoin(coin){
		world.destroyBody(coin.physics);
		coin.sprite.position.x = -1000;
		coin.sprite.position.y = -1000;
	}

	function cubicBezierPoint(t, p0, p1, c0, c1) {

		//return (1-t)^3 * p0 + 3*(1-t)^2 * t * c0 + 3*(1-t) * t^2 * c1 + t^3 * p1
		//       {   first   }  {      second     }  {      third      }  { fourth }
		let point;
		let addVectors;
		let first = scaleVec(p0, ((1-t)*(1-t)*(1-t)));
		let second = scaleVec(c0, (3 * ((1-t)*(1-t)) * t));
		let third = scaleVec(c1, (3 * (1-t) * (t*t)));
		let fourth = scaleVec(p1, (t*t*t));


		addVectors = addVec(first, second);
		addVectors = addVec(addVectors, third);
		addVectors = addVec(addVectors, fourth);

		point = addVectors;

		return point;

	}

	// Creates the Bezier curve with the resolution of "numPoints"
	// p0 = start point of curve
	// p1 = end point of curve
	// c0 = first control point
	// c1 = second control point
	function bezierCurvePoints(p0, c0, c1, p1) {

		let t;
		let points = [];
		// Curve resolution
		let numPoints = 5;
		let point = Vec2();

		for(let i = 0; i < numPoints; i++){
			t = i / numPoints;
			point = cubicBezierPoint(t, p0, p1, c0, c1);

			points.push(point);
		}

		return points;
	}
	// Utility to scale Vec2 with a number
	function scaleVec(vector, number){
		let result = Vec2();

		result.x = vector.x * number;
		result.y = vector.y * number;

		return result;
	}

	// Utility to add two Vec2 together
	function addVec(vector1, vector2){
		let result = Vec2();

		result.x = vector1.x + vector2.x;
		result.y = vector1.y + vector2.y;

		return result;
	}

	function playCoinSoundAsync(){
		new Audio("../audio/snowball-trimmed.mp3").play();
	}


	return coinSprites;
}

module.exports = Coins;
