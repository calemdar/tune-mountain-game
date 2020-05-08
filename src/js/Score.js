const {
	InputManager,
	GameStateController,
	GameStateEnums
} = require("tune-mountain-input-manager");

/**
 * Creates the game score object
 * @param stateController - the stateController for the game
 * @returns {number} - the total score
 */
function Score(stateController) {

	let totalScore = 0;

	Score.prototype.updateScore = function updateScore(addScore, multiplier) {
		let newScore = totalScore + addScore;
		let updatedScore = {
			score: newScore,
			multiplier: multiplier
		};
		stateController.notify(GameStateEnums.SCORE_CHANGED, updatedScore);
		totalScore = newScore;
		return newScore;
	};
	Score.prototype.getScore = function getScore(){
		return totalScore;
	};

	return totalScore;
}

module.exports = Score;
