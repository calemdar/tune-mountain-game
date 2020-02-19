const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;
const GameObject = require("./GameObject");

function Trees(analysis, allPoints, viewport, player) {
	const obj = new GameObject();
	let currentSection;
	let allPointCounter = 0;			// counts all points from the physics
	let treeObjects = [];				// stores all tree sprite objects
	let sectionBeats = [];					// all beats for a given section
	let treePlacer = 0;					// counter for tree placement
	let maxtreeSeries = 4;				// max count of trees to spread in series
	let beatLength;						// num beats / curve resolution

	const texture = PIXI.Texture.from("../img/tree2_snowy.png");

	for(let i = 0; i < analysis.sections.length; i+=1){
		treePlacer = 0;
		beatLength = beatsToPoints(sectionBeats.length);
		currentSection = analysis.sections[i];
		sectionBeats = getBeatsInSection(currentSection);
		//console.log(sectionBeats);
		//console.log(beatLength);

		for(let k = 0; k < sectionBeats.length; k+=1) {
			let treeSprite = new PIXI.Sprite(texture);

			if(allPointCounter >= allPoints.length){
				break;
			}

			treeSprite.scale.x = 0.5;
			treeSprite.scale.y = 0.5;
			treeSprite.anchor.x = 0.5;
			treeSprite.anchor.y = 1.0;

			treeSprite.position.x = allPoints[allPointCounter].x;
			treeSprite.position.y = allPoints[allPointCounter].y;

			let treeObj = obj.create({name: "Tree", position: treeSprite.position, sprite: treeSprite, scale: treeSprite.size});

			treeObjects.push(treeObj);
			viewport.addChild(treeSprite);

			treePlacer += 1;
			allPointCounter += beatLength;


			// reset tree placer when doubled tree series
			if(treePlacer > (currentSection.time_signature)) {
				treePlacer = 0;
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
		//console.log("Num points per curve: " + numPoints);
		let length;
		if(numBeats > 0) {
			length = Math.ceil(numPoints / numBeats);
		}
		else {length = 1;}

		return length;
	}

	return treeObjects;
}

module.exports = Trees;
