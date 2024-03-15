import { Injectable } from '@nestjs/common';
import { GameOutcome } from '../../model/GameOutcome';

/**
 * `EloService` provides functionalities related to Elo rating calculations. It encapsulates the logic
 * for calculating new Elo ratings based on the outcome of a game between two players, following the
 * Elo rating system principles. The service uses a fixed K-factor for rating adjustments.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class EloService {
    private kFactor: number = 20;

    /**
     * Constructs a new instance of `EloService`. The constructor is intentionally empty as all methods
     * are stateless and depend only on the input parameters.
     */
    constructor() {}

    /**
     * Calculates a player's new Elo rating based on their current rating, their opponent's rating,
     * and the game outcome. The calculation considers the expected outcome and the actual outcome to
     * adjust the player's rating.
     *
     * @param {number} currentRating - The player's current Elo rating before the game.
     * @param {number} opponentRating - The opponent's Elo rating.
     * @param {GameOutcome} outcome - The outcome of the game for the player (Win, Draw, Lose).
     * @returns {number} The player's new Elo rating after the game.
     */
    public calculateNewRating(currentRating: number, opponentRating: number, outcome: GameOutcome): number {
        const expectedScore = this.calculateExpectedScore(currentRating, opponentRating);
        return currentRating + this.kFactor * (outcome - expectedScore);
    }

    /**
     * Calculates the expected score for a player in a match against an opponent, based on both players'
     * Elo ratings. The expected score is a prediction of the outcome, used in the calculation of new ratings.
     *
     * @param {number} playerRating - The Elo rating of the player.
     * @param {number} opponentRating - The Elo rating of the opponent.
     * @returns {number} The expected score for the player, ranging from 0 (expected loss) to 1 (expected win).
     */
    private calculateExpectedScore(playerRating: number, opponentRating: number): number {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }
}
