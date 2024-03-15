import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

/**
 * `UserEntity` represents a user in the system, including their username, password, profile image, and
 * whether they are an administrator. It is mapped to a database table and includes validations for
 * username and password lengths.
 *
 * @Entity Decorator that marks the class as an entity and maps it to a database table.
 */
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
