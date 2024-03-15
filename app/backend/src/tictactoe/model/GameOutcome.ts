/**
 * Enumeration for game outcomes, used in Elo rating calculations after a game is concluded.
 * Each outcome is associated with a numeric value that represents its impact on the calculation of Elo ratings.
 *
 * @enum {number}
 * @property {Win} Represents a win outcome, with the highest positive impact on the player's Elo rating.
 * @property {Draw} Represents a draw outcome, with a neutral impact on the player's Elo rating.
 * @property {Lose} Represents a loss outcome, with a negative impact on the player's Elo rating.
 */
export enum GameOutcome {
    Win = 1,
    Draw = 0.5,
    Lose = 0,
}
