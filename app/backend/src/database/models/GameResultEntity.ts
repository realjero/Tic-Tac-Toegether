import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { UserEloRatingEntity } from './UserEloRatingEntity';

@Entity()
export class GameResultEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEloRatingEntity, { nullable: false })
    @JoinColumn()
    player1: UserEloRatingEntity;

    @ManyToOne(() => UserEloRatingEntity, { nullable: false })
    @JoinColumn()
    player2: UserEloRatingEntity;

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn()
    winner: UserEntity | null;

    @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    constructor(player1: UserEloRatingEntity, player2: UserEloRatingEntity, winner: UserEntity | null) {
        this.player1 = player1;
        this.player2 = player2;
        this.winner = winner;
    }
}
