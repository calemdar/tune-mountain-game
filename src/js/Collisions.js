const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const GameObject = require("./GameObject");

function Collisions(game, viewport, player, coins) {

	// Collect coin if the sprites collided
	function collectCoin() {
		let currCoin;

		for(let i = 0; i < coins.length; i++){
			currCoin = coins[i].sprite;
			if(playerHitTest(player.sprite, currCoin)){
				//console.log("Player collision");
				deleteCoin(currCoin);
				//currCoin.destroy();
				break;
			}
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

	game.ticker.add(collectCoin);
}

module.exports = Collisions;
