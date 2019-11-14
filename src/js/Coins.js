const PIXI = require("pixi.js");
const Viewport = require("./Viewport");

function Coins(analysis, allPoints, viewport) {
	let currentSection;
	let pointCounter = 0;
	let coinSprites = [];
	let sectionBeats;

	const texture = PIXI.Texture.from("../img/ball.png");

	for(let i = 0; i < analysis.sections.length; i+=1){
		currentSection = analysis.sections[i];
		sectionBeats = getBeatsInSection(currentSection);
		console.log(sectionBeats);

		for(let k = 0; k < sectionBeats.length; k+=1) {

			if((k % 4) === 0){
				let coin = new PIXI.Sprite(texture);
				coin.size = 0.2;
				coin.position.x = allPoints[pointCounter].x;
				coin.position.y = allPoints[pointCounter].y - 30;


				coinSprites.push(coin);
				viewport.addChild(coin);
			}

			if(pointCounter < allPoints.length) {
				pointCounter += (Math.floor(60 / sectionBeats.length));
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
	return coinSprites;
}

module.exports = Coins;