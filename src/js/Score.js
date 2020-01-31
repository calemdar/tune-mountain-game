const {
	InputManager,
	GameStateController,
	GameStateEnums
} = require("tune-mountain-input-manager");

function Score(stateController) {

	let totalScore = 0;

	Score.prototype.updateScore = function updateScore(addScore) {
		let newScore = totalScore + addScore;
		stateController.notify(GameStateEnums.SCORE_CHANGED, newScore);
		totalScore = newScore;
		return newScore;
	};
	Score.prototype.getScore = function getScore(){
		return totalScore;
	};

	return totalScore;
}

module.exports = Score;