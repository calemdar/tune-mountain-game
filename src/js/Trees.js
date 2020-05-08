const PIXI = require("pixi.js");
const Planck = require("planck-js");
const Vec2 = Planck.Vec2;

let tempoFlag = true;			// true = getting bigger, false = getting smaller
let tempoCounter = 0;
let allTrees = [];

/**
 * Creates tree sprites and places them on the proper place on the slope
 * @param sections - sections of the curve
 * @param features - features of the song
 * @param allPoints - all the points of the curves
 * @param viewport - camera viewport
 * @param game - pixi.js application
 * @returns {[]} - array of tree sprites
 */
function Trees(sections, features, allPoints, viewport, game) {

	let currSectionNum = 0;
	let allPointsIndex = 0;
	let treesPerCurve = 40;

	let tempo = features.tempo / 2.0;
	let treeTextures = [];
	let tree1Tex = PIXI.Texture.from("../img/tree1.png");
	let tree2Tex = PIXI.Texture.from("../img/tree1_snowy.png");
	let tree3Tex = PIXI.Texture.from("../img/tree2.png");
	let tree4Tex = PIXI.Texture.from("../img/tree2_snowy.png");
	treeTextures.push(tree1Tex, tree2Tex, tree3Tex, tree4Tex);

	treesPerCurve = treesPerCurve + Math.ceil(features.energy * 10);

	// increments as the resolution of the curve
	// loops for each section
	for(let i = 0; i < sections.length; i++){
		let currPlacement = allPoints[allPointsIndex];
		let currSection = sections[currSectionNum];

		treesPerCurve = treesPerCurve + Math.floor(currSection.duration / 20.0);
		let incrementPos = Math.ceil(60 / treesPerCurve);

		//console.log(treesPerCurve);

		for(let j = 0; j < treesPerCurve; j++){
			let treeTexIndex = getRandomInt(0, treeTextures.length - 1);
			//console.log(treeTexIndex);
			let treeSprite = new PIXI.Sprite(treeTextures[treeTexIndex]);
			let currPointIndex = allPointsIndex;

			// avoid error
			if(allPointsIndex < 10){
				currPointIndex = allPointsIndex + (incrementPos * j);
				currPlacement = allPoints[currPointIndex];
			}

			else if (allPointsIndex >= allPoints.length){
				break;
			}
			else{
				currPointIndex = allPointsIndex + (incrementPos * j) - getRandomInt(0, 4);
				currPlacement = allPoints[currPointIndex];
			}


			treeSprite.anchor.x = 0.5;
			treeSprite.anchor.y = 1.0;

			treeSprite.scale.x = 0.3;
			treeSprite.scale.y = 0.3;

			treeSprite.position.x = currPlacement.x - getRandomInt(0, 4);
			treeSprite.position.y = currPlacement.y;

			//console.log(currPointIndex);

			allTrees.push(treeSprite);
			viewport.addChild(treeSprite);
		}

		currSectionNum++;
		allPointsIndex += 60;
	}


	const pulseTrees = () => {
		let currTree;
		let tempo = features.tempo / 2.0;

		if(tempoCounter === 0){
			tempoFlag = true;
		}
		else if(tempoCounter >= tempo){
			tempoFlag = false;
		}


		for(let i = 0; i < allTrees.length; i++) {
			currTree = allTrees[i];

			let screen = viewport.getVisibleBounds();
			let withinScreen = screen.contains(currTree.position.x, currTree.position.y);

			if (withinScreen) {
				if (tempoFlag) {
					pulseUp(currTree);
				} else {
					pulseDown(currTree);
				}
			}
		}

		// incrementation
		if(tempoFlag){
			tempoCounter++;
		}
		else {
			tempoCounter--;
		}
	};

	game.ticker.add(pulseTrees);
	return allTrees;
}

function pulseUp(sprite){
	//sprite.scale.x += 0.004;
	sprite.scale.y += 0.001;
}
function pulseDown(sprite){
	//sprite.scale.x -= 0.004;
	sprite.scale.y -= 0.001;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

module.exports = Trees;
