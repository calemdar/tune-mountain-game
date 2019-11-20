const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;
const GameObject = require("./GameObject");

function Coins(analysis, allPoints, viewport, player) {
	const obj = new GameObject();
	let currentSection;
	let allPointCounter = 0;			// counts all points from the physics
	let coinObjects = [];				// stores all coin sprite objects
	let sectionBeats = [];					// all beats for a given section
	let coinPlacer = 0;					// counter for coin placement
	let maxCoinSeries = 4;				// max count of coins to spread in series
	let beatLength;						// num beats / curve resolution

	const texture = PIXI.Texture.from("../img/coin.png");

	for(let i = 0; i < analysis.sections.length; i+=1){
		coinPlacer = 0;
		beatLength = beatsToPoints(sectionBeats.length);
		currentSection = analysis.sections[i];
		sectionBeats = getBeatsInSection(currentSection);
		console.log(sectionBeats);
		console.log(beatLength);

		for(let k = 0; k < sectionBeats.length; k+=1) {
			let coinSprite = new PIXI.Sprite(texture);

			if(allPointCounter >= allPoints.length){
				break;
			}

			coinSprite.size = 0.3;
			coinSprite.anchor.x = 0.5;
			coinSprite.anchor.y = 0.5;

			coinSprite.position.x = allPoints[allPointCounter].x + 20;
			coinSprite.position.y = allPoints[allPointCounter].y - 20;

			let coinObj = obj.create({name: "Coin", position: coinSprite.position, sprite: coinSprite, scale: coinSprite.size});

			coinObjects.push(coinObj);
			viewport.addChild(coinSprite);

			coinPlacer += 1;
			allPointCounter += beatLength;


			// reset coin placer when doubled coin series
			if(coinPlacer > (currentSection.time_signature)) {
				coinPlacer = 0;
			}
		}

	}

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
		console.log("Num points per curve: " + numPoints);
		let length;
		if(numBeats > 0) {
			length = Math.ceil(numPoints / numBeats);
		}
		else {length = 1;}

		return length;
	}

	return coinObjects;
}

module.exports = Coins;