import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

/**
 * `UserEloRatingEntity` represents a user's Elo rating in the system. It is linked to a `UserEntity` and
 * contains the Elo score.
 *
 * @Entity Decorator that marks the class as an entity and maps it to a database table.
 */
@Entity()
export class UserEloRatingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1000, nullable: false })
    elo: number;

    @ManyToOne(() => UserEntity, { nullable: false, cascade: true })
    @JoinColumn()
    player: UserEntity;

    constructor(player: UserEntity, elo: number) {
        this.player = player;
        this.elo = elo;
    }
}
