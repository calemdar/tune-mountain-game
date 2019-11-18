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
	let sectionBeats;					// all beats for a given section
	let coinPlacer = 0;					// counter for coin placement
	let maxCoinSeries = 4;				// max count of coins to spread in series

	const texture = PIXI.Texture.from("../img/coin.png");

	for(let i = 0; i < analysis.sections.length; i+=1){
		coinPlacer = 0;
		currentSection = analysis.sections[i];
		sectionBeats = getBeatsInSection(currentSection);
		//console.log(sectionBeats);

		for(let k = 0; k < sectionBeats.length; k+=1) {
			let coinSprite = new PIXI.Sprite(texture);

			if(coinPlacer <= maxCoinSeries) {


				coinSprite.size = 0.3;
				coinSprite.anchor.x = 0.5;
				coinSprite.anchor.y = 0.5;
				coinSprite.position.x = allPoints[allPointCounter].x;
				coinSprite.position.y = allPoints[allPointCounter].y - 30;
				let coinObj = obj.create({name: "Coin", position: coinSprite.position, sprite: coinSprite, scale: coinSprite.size});

				coinObjects.push(coinObj);
				viewport.addChild(coinSprite);


			}
			coinPlacer += 1;
			allPointCounter += 1;

			// reset coin placer when doubled coin series
			if(coinPlacer > (currentSection.time_signature * maxCoinSeries)) {
				coinPlacer = 0;
			}


			if(allPointCounter < allPoints.length) {
				//allPointCounter += (Math.floor(60 / sectionBeats.length));
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



	return coinObjects;
}

module.exports = Coins;