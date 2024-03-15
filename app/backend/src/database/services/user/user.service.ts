import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../models/UserEntity';
import { DataSource, Repository } from 'typeorm';

/**
 * `UserService` provides services related to user management, such as finding, creating, and updating users.
 * It interacts with the `UserEntity` repository to perform database operations concerning user entities.
 *
 * @Injectable Decorator that marks the class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class UserService {
    private readonly userRepository: Repository<UserEntity>;

    /**
     * Initializes a new instance of `UserService` and sets up the repository for `UserEntity`.
     *
     * @param dataSource The data source instance used to access the database and its repositories.
     */
    constructor(private dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(UserEntity);
    }

    /**
     * Finds a user by their username.
     *
     * @param {string} username The username of the user to find.
     * @returns {Promise<UserEntity | null>} A promise that resolves to the `UserEntity` if found, or `null` if not.
     */
    async findUserByUsername(username: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { username: username } });
    }

    /**
     * Finds a user by their user ID.
     *
     * @param {number} userId The unique identifier of the user to find.
     * @returns {Promise<UserEntity | null>} A promise that resolves to the `UserEntity` if found, or `null` if not.
     */
    async findUserByUserId(userId: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    /**
     * Creates and saves a new user with the provided username and password.
     *
     * @param {string} username The username for the new user.
     * @param {string} password The password for the new user.
     * @returns {Promise<UserEntity>} A promise that resolves to the newly created and saved `UserEntity`.
     */
    async saveUser(username: string, password: string): Promise<UserEntity> {
        return await this.userRepository.save(new UserEntity(username, password));
    }

    /**
     * Updates the username of an existing user identified by their user ID.
     *
     * @param {number} userId The unique identifier of the user to update.
     * @param {string} username The new username for the user.
     * @returns {Promise<UserEntity | undefined>} A promise that resolves to the updated `UserEntity`, or `undefined` if the user was not found.
     */
    async updateUser(userId: number, username: string): Promise<UserEntity | undefined> {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.username = username;
        return await this.userRepository.save(user);
    }

    /**
     * Checks if a user identified by their user ID has administrative privileges.
     *
     * @param {number} userId The unique identifier of the user to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the user is an administrator, otherwise `false`.
     */
    async isUserAdmin(userId: number): Promise<boolean> {
        return (await this.findUserByUserId(userId)).isAdmin;
    }

    /**
     * Updates the profile image of an existing user.
     *
     * @param {number} userId The unique identifier of the user whose image is to be updated.
     * @param {Buffer} buffer The new image data as a byte array.
     * @returns {Promise<UserEntity | undefined>} A promise that resolves to the updated `UserEntity` with the new image, or `undefined` if the user was not found.
     */
    async saveImage(userId: number, buffer: Buffer): Promise<UserEntity | undefined> {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.image = buffer;
        return await this.userRepository.save(user);
    }

    /**
     * Retrieves the profile image of a user as a byte array.
     *
     * @param {number} userId The unique identifier of the user whose image is to be retrieved.
     * @returns {Promise<Buffer | undefined>} A promise that resolves to the image data as a byte array, or `undefined` if the user or image was not found.
     */
    async getImageAsByteArrayByUserId(userId: number): Promise<Buffer | undefined> {
        const user = await this.findUserByUserId(userId);
        return !user ? undefined : user.image;
    }

    /**
     * Updates the password of an existing user.
     *
     * @param {number} userId The unique identifier of the user whose password is to be updated.
     * @param {string} newPassword The new password for the user.
     */
    async updateUserPassword(userId: number, newPassword: string) {
        const user = await this.findUserByUserId(userId);
        if (!user) return undefined;

        user.password = newPassword;
        return await this.userRepository.save(user);
    }

    /**
     * Retrieves a list of all users.
     *
     * @returns {Promise<UserEntity[]>} A promise that resolves to an array of all `UserEntity` instances.
     */
    async getAllUsers(): Promise<UserEntity[]> {
        return await this.userRepository.find();
    }
}
