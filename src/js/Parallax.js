const PIXI = require("pixi.js");

class Old {

	constructor (gameRef) {

		this.game = gameRef;

	}

	init() {

		const { game } = this;

		/**
		 *  Parallax Scrolling Logic
		 */
		var texture1 = PIXI.Texture.from("../img/bg-far.png");

		const tilingSprite1 = new PIXI.TilingSprite(
			texture1,
			game.screen.width,
			game.screen.height,
		);
		game.stage.addChild(tilingSprite1);

		tilingSprite1.position.x = 0;
		tilingSprite1.position.y = 0;
		tilingSprite1.tilePosition.x = 0;
		tilingSprite1.tilePosition.y = 0;

		var texture2 = PIXI.Texture.from("../img/bg-mid.png");

		const tilingSprite2 = new PIXI.TilingSprite(
			texture2,
			game.screen.width,
			game.screen.height,
		);
		game.stage.addChild(tilingSprite2);

		tilingSprite2.position.x = 0;
		tilingSprite2.position.y = 128;
		tilingSprite2.tilePosition.x = 0;
		tilingSprite2.tilePosition.y = 0;

		game.ticker.add(() => {
			tilingSprite1.tilePosition.x -= 0.128;
			tilingSprite2.tilePosition.x -= 0.64;
		});

	}

}

function Parallax(game) {

	/**
	 *  Parallax Scrolling Logic
	 */
	var texture1 = PIXI.Texture.from("../img/bg-far.png");

	const tilingSprite1 = new PIXI.TilingSprite(
		texture1,
		game.screen.width,
		game.screen.height,
	);
	game.stage.addChild(tilingSprite1);

	tilingSprite1.position.x = 0;
	tilingSprite1.position.y = 0;
	tilingSprite1.tilePosition.x = 0;
	tilingSprite1.tilePosition.y = 0;

	var texture2 = PIXI.Texture.from("../img/bg-mid.png");

	const tilingSprite2 = new PIXI.TilingSprite(
		texture2,
		game.screen.width,
		game.screen.height,
	);
	game.stage.addChild(tilingSprite2);

	tilingSprite2.position.x = 0;
	tilingSprite2.position.y = 128;
	tilingSprite2.tilePosition.x = 0;
	tilingSprite2.tilePosition.y = 0;

	game.ticker.add(() => {
		tilingSprite1.tilePosition.x -= 0.128;
		tilingSprite2.tilePosition.x -= 0.64;
	});

	console.log("i am using arrow func");

}

module.exports = Parallax;


