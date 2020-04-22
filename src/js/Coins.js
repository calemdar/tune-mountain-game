const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;
const GameObject = require("./GameObject");


function Coins(analysis, allPoints, viewport, player, game, world, deletedBodies, score) {
	const obj = new GameObject();
	let currentSection;
	let allPointCounter = 0;			// counts all points from the physics
	let coinSprites = [];				// stores all coin sprite objects
	let coinObjects = [];				// stores all coin game objects
	let coinPlacer = 0;					// counter for coin placement
	let maxCoinSeries = 10;				// max count of coins to spread in series
	let beatLength;						// num beats / curve resolution
	let mountainOffset = 5;

	// setup texture
	const texture = PIXI.Texture.from("../img/snowball1.png");


	// Start laying coins
	for(let i = 0; i < analysis.sections.length; i+=1){
		let rampOffset = 0;

		coinPlacer = 0;
		currentSection = analysis.sections[i];
		//sectionBeats = getBeatsInSection(currentSection);

		allPointCounter += (60 - maxCoinSeries);

		for(let k = 0; k < maxCoinSeries; k+=1) {
			let coin = new PIXI.Sprite(texture);


			if(allPointCounter >= allPoints.length){
				break;
			}

			coin.scale.x = 0.4;
			coin.scale.y = 0.4;
			//coin.anchor.x = 0.5;
			//coin.anchor.y = 1.0;

			coin.position.x = allPoints[allPointCounter].x;
			coin.position.y = allPoints[allPointCounter].y - mountainOffset - rampOffset;

			let coinPhysics = world.createBody().setStatic();
			let coinFixture = coinPhysics.createFixture(Planck.Circle(2.0));
			coinPhysics.setPosition(Planck.Vec2(coin.position.x, coin.position.y));
			coinFixture.setSensor(true);
			console.log("is coin sensor? " + coinFixture.isSensor());

			// increase ramp offset
			//rampOffset += 3;

			let coinObj = obj.create({name: "coin"+i, position: coin.position, physics: coinPhysics});
			coinObjects.push(coinObj);
			coinSprites.push(coin);
			viewport.addChild(coin);


			coinPlacer++;
			allPointCounter++;
		}

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

	}

	// Check collision between sprites
	function collectCoin(coinBody) {
		let playerPos = player.position;
		let closestCoin;

		for(let i = 0; i < coinObjects.length; i++){
			let currCoin = coinObjects[i];
			if(coinBody === currCoin.physics && currCoin.sprite != null){
				viewport.removeChild(coinSprites[i]);
				currCoin.sprite = null;
				console.log("Collected coin in index: " + i);
				score.updateScore(10);
				break;
			}
		}

	}
	// TODO add rotation into account
	function playerHitTest(player, s2){
		if ((player.x - player.width / 2) + (player.width / 2) > (s2.x - s2.width / 2)) {
			if ((player.x - player.width / 2) < (s2.x - s2.width / 2) + (s2.width / 2)) {
				if ((player.y - player.height) + (player.height) > (s2.y - s2.height / 2)) {
					if ((player.y - player.height) < (s2.y - s2.height / 2) + (s2.height / 2)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	// psuedo delete the sprite by moving it out of screen
	function deleteCoin(coin){
		world.destroyBody(coin.physics);
		coin.sprite.position.x = -1000;
		coin.sprite.position.y = -1000;
	}

	/*
	function getBeatsInSection(section) {
		let beats = [];
		let currBeat;
		let currBeatEnd;
		let sectionEnd = section.start + section.duration;

		for(let k = 0; k < analysis.beats.length; k += 1) {
			currBeat = analysis.beats[k];
			currBeatEnd = currBeat.start + currBeat.duration;

			if(currBeat.start >= section.start && currBeatEnd <= sectionEnd) {
				beats.push(currBeat);
			}
		}
		return beats;
	}

	function beatsToPoints(numBeats){
		let numPoints = allPoints.length / analysis.sections.length;
		//console.log("Num points per curve: " + numPoints);
		let length;
		if(numBeats > 0) {
			length = Math.ceil(numPoints / numBeats);
		}
		else {length = 1;}

		return length;
	}

	 */

	//game.ticker.add(collectCoin);
	return coinSprites;
}

module.exports = Coins;
