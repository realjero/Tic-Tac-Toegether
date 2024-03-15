import { IsInt, Max, Min } from 'class-validator';

/**
 * Represents a move in the game, characterized by the coordinates (x, y) on the game board where the move is made.
 * Includes validation constraints to ensure that moves are within the bounds of the game board.
 *
 * @class Move
 */
export class Move {
    @IsInt()
    @Min(0)
    @Max(2)
    x: number;

    @IsInt()
    @Min(0)
    @Max(2)
    y: number;
}
