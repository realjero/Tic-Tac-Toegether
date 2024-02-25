import { Injectable } from '@nestjs/common';
import { GameOutcome } from '../../model/GameOutcome';

@Injectable()
export class EloService {
    private kFactor: number = 20;

    constructor() {}

    public calculateNewRating(currentRating: number, opponentRating: number, outcome: GameOutcome): number {
        const expectedScore = this.calculateExpectedScore(currentRating, opponentRating);
        return currentRating + this.kFactor * (outcome - expectedScore);
    }

    private calculateExpectedScore(playerRating: number, opponentRating: number): number {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }
}
