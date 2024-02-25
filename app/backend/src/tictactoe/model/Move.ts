import { IsInt, Max, Min } from 'class-validator';

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
