import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    @Length(6, 64)
    username: string;

    @Column({ nullable: false })
    @Length(8, 60)
    password: string;

    @Column({ type: 'blob', nullable: true })
    image: Buffer;

    @Column({ default: false, nullable: false })
    isAdmin: boolean;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
