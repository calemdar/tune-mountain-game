const PIXI = require("pixi.js");
const Viewport = require("./Viewport");
const GameObject = require("./GameObject");

function Collisions(game, viewport, player, coins) {


	console.log(coins);
	function collectCoin() {
		let currCoin;

		for(let i = 0; i < coins.length; i++){
			currCoin = coins[i].sprite;
			if(hitTest(player.sprite, currCoin)){
				console.log("Player collision");
				deleteCoin(currCoin);
				//currCoin.destroy();
				break;
			}
		}

	}
	function hitTest(s1, s2){
		if ((s1.x-s1.width/2) + (s1.width/2) > (s2.x-s2.width/2)) {
			if ((s1.x - s1.width / 2) < (s2.x - s2.width / 2) + (s2.width / 2)) {
				if ((s1.y - s1.height / 2) + (s1.height / 2) > (s2.y - s2.height / 2)) {
					if ((s1.y - s1.height / 2) < (s2.y - s2.height / 2) + (s2.height / 2)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	function deleteCoin(coin){

		coin.position.x = -1000;
		coin.position.y = -1000;
	}

	game.ticker.add(collectCoin);
}

module.exports = Collisions;