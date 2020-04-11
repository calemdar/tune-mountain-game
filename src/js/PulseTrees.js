const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const GameObject = require("./GameObject");

function PulseTrees(game, viewport, player, trees, songFeatures) {

	let tempoCounter = 0;
	let tempoFlag = true;		// true = getting bigger, false = getting smaller

	function pulseUp(sprite){
		//sprite.scale.x += 0.004;
		sprite.scale.y += 0.004;


	}
	function pulseDown(sprite){

		//sprite.scale.x -= 0.004;
		sprite.scale.y -= 0.004;

	}

	const pulseTrees = () => {
		let currTree;
		let tempo = songFeatures.tempo / 2.0;

		if(tempoCounter === 0){
			tempoFlag = true;
		}
		else if(tempoCounter >= tempo){
			tempoFlag = false;
		}

		for(let i = 0; i < trees.length; i++) {
			currTree = trees[i].sprite;

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

	/*
	Don't want to delete code but refactoring tree pulsing properly
	// Collect coin if the sprites collided
	function collectCoin() {
		let currCoin;

		for(let i = 0; i < coins.length; i++){
			currCoin = coins[i].sprite;
			if(playerHitTest(player.sprite, currCoin)){
				//console.log("Player collision");
				//deleteCoin(currCoin);
				//currCoin.destroy();
				break;
			}
			//if(tempo)
		}

	}

	// Check collision between sprites
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

		coin.position.x = -1000;
		coin.position.y = -1000;
	}

	 */
}

module.exports = PulseTrees;
