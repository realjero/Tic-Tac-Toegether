import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameService } from '../game/game.service';
import { GameUserInfo } from '../../model/GameUserInfo';
import { EGameSymbol } from '../../model/EGameSymbol';

/**
 * `MatchmakingService` manages the matchmaking process, placing users into a queue based on their Elo rating,
 * attempting to match users for a game, and managing matchmaking buckets for efficient pairing.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class MatchmakingService {
    private users = new Map<number, { elo: number; socketId: string }>();
    private eloBuckets = new Map<number, Set<number>>();
    private bucketSize: number = 200;
    private mutex = new Mutex();

    /**
     * Constructs a new instance of `MatchmakingService` with the necessary dependencies.
     *
     * @param {EventEmitter2} eventEmitter - The event emitter used for broadcasting matchmaking-related events.
     * @param {GameService} gameService - Service for managing game sessions.
     */
    constructor(
        private eventEmitter: EventEmitter2,
        private gameService: GameService
    ) {}

    /**
     * Attempts to enqueue a user into the matchmaking queue. It checks if the user is already in the queue
     * or in a game before adding them to the matchmaking process. It also initiates the matchmaking check
     * for potential matches.
     *
     * @param {number} userId - The unique identifier of the user to be enqueued.
     * @param {number} elo - The Elo rating of the user.
     * @param {string} socketId - The WebSocket socket ID associated with the user's connection.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the user was successfully enqueued, or `false` if not.
     */
    async enqueueUser(userId: number, elo: number, socketId: string): Promise<boolean> {
        const release = await this.mutex.acquire();
        try {
            if (await this.isUserInQueueOrGame(userId)) {
                console.error(`User is already in a game or queue ${userId}`);
                release();
                return false;
            }

            await this.addUserToQueue(userId, { elo, socketId });
            await this.checkForMatches(userId, elo);

            this.eventEmitter.emit('admin.queue');
        } catch (error) {
            console.error(`Error enqueuing user ${userId}: ${error}`);
            release();
            return false;
        } finally {
            release();
        }
        return true;
    }

    /**
     * Checks if a user is currently in the matchmaking queue or already in a game.
     *
     * @param {number} userId - The unique identifier of the user to check.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the user is in the queue or in a game, or `false` otherwise.
     */
    private async isUserInQueueOrGame(userId: number): Promise<boolean> {
        return this.users.has(userId) || (await this.gameService.isUserInAnyGame(userId));
    }

    /**
     * Adds a user to the matchmaking queue and assigns them to the appropriate Elo bucket for potential matching.
     *
     * @param {number} userId - The unique identifier of the user to be added to the queue.
     * @param {{ elo: number; socketId: string }} userInfo - An object containing the user's Elo rating and socket ID.
     */
    private async addUserToQueue(userId: number, userInfo: { elo: number; socketId: string }): Promise<void> {
        this.users.set(userId, userInfo);
        const bucketKey = this.getBucketKey(userInfo.elo);
        if (!this.eloBuckets.has(bucketKey)) {
            this.eloBuckets.set(bucketKey, new Set<number>());
        }
        this.eloBuckets.get(bucketKey).add(userId);
    }

    /**
     * Searches for potential matches for a user within their Elo bucket and adjacent buckets. If a match is found,
     * it creates a new game session for the matched users and removes them from the matchmaking queue.
     *
     * @param {number} userId - The unique identifier of the user for whom potential matches are being sought.
     * @param {number} elo - The Elo rating of the user.
     */
    private async checkForMatches(userId: number, elo: number) {
        const userBucketKey = this.getBucketKey(elo);
        const potentialBuckets = [userBucketKey - this.bucketSize, userBucketKey, userBucketKey + this.bucketSize];

        for (const bucketKey of potentialBuckets) {
            if (this.eloBuckets.has(bucketKey)) {
                for (const candidateId of this.eloBuckets.get(bucketKey)) {
                    if (candidateId !== userId && Math.abs(this.users.get(candidateId).elo - elo) <= this.bucketSize) {
                        console.log('Match found');

                        const gameId = this.gameService.generateGameId();

                        await this.gameService.addGameToActiveGamesList(
                            gameId,
                            new GameUserInfo(userId, this.users.get(userId).socketId, EGameSymbol.X), //user 1
                            new GameUserInfo(candidateId, this.users.get(candidateId).socketId, EGameSymbol.O) // user 2
                        );

                        const game = await this.gameService.getGameByGameId(gameId);

                        this.eventEmitter.emit(
                            'matchmaking.match-found',
                            game.user1Info,
                            game.user2Info,
                            game.isPlayer1Turn ? game.user1Info.symbol : game.user2Info.symbol,
                            gameId
                        );

                        this.removePlayersFromQueue(userBucketKey, userId, bucketKey, candidateId);
                        return;
                    }
                }
            }
        }
    }

    /**
     * Removes specified users from their respective matchmaking Elo buckets and the general users map,
     * effectively dequeuing them from the matchmaking process.
     *
     * @param {number} userBucketKey - The Elo bucket key for the first user.
     * @param {number} userId - The unique identifier of the first user to be removed.
     * @param {number} bucketKey - The Elo bucket key for the second user (could be the same as userBucketKey).
     * @param {number} candidateId - The unique identifier of the second user to be removed.
     */
    private removePlayersFromQueue(userBucketKey: number, userId: number, bucketKey: number, candidateId: number) {
        this.eloBuckets.get(userBucketKey).delete(userId);
        this.eloBuckets.get(bucketKey).delete(candidateId);
        this.users.delete(userId);
        this.users.delete(candidateId);
    }

    /**
     * Calculates the Elo bucket key for a given Elo rating, used to determine the appropriate matchmaking bucket.
     *
     * @param {number} elo - The Elo rating of a user.
     * @returns {number} The calculated Elo bucket key.
     */
    private getBucketKey(elo: number): number {
        return Math.floor(elo / this.bucketSize) * this.bucketSize;
    }

    /**
     * Removes a user from the matchmaking queue based on their WebSocket socket ID. This method is typically
     * called when a user disconnects or explicitly leaves the queue.
     *
     * @param {string} socketId - The WebSocket socket ID associated with the user's connection.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the user was successfully dequeued, or `false` otherwise.
     */
    async dequeueUser(socketId: string) {
        const release = await this.mutex.acquire();
        try {
            let userId: number | undefined = undefined;

            // Find userId by socketId
            for (let [key, value] of this.users.entries()) {
                if (value.socketId === socketId) {
                    userId = key;
                    break;
                }
            }

            if (userId === undefined) {
                console.log(`Socket ID ${socketId} does not correspond to any queued user.`);
                return false;
            }

            this.removeUserFromQueue(userId);
        } catch (error) {
            console.error(`Error dequeue user with Socket ID ${socketId}: ${error}`);
            return false;
        } finally {
            release();
            this.eventEmitter.emit('admin.queue');
        }
        return true;
    }

    /**
     * Removes a specific user from the matchmaking queue and their corresponding Elo bucket.
     *
     * @param {number} userId - The unique identifier of the user to be removed from the queue.
     */
    private removeUserFromQueue(userId: number): void {
        const userInfo = this.users.get(userId);
        if (!userInfo) return; // Exit if no user info is found

        const bucketKey = this.getBucketKey(userInfo.elo);
        this.users.delete(userId);

        const bucket = this.eloBuckets.get(bucketKey);
        if (bucket) {
            bucket.delete(userId);

            if (bucket.size === 0) {
                this.eloBuckets.delete(bucketKey);
            }
        }
    }

    /**
     * Retrieves a snapshot of the current matchmaking queue, including user IDs, Elo ratings, socket IDs,
     * and their respective Elo buckets. This method is useful for administrative monitoring of the matchmaking process.
     *
     * @returns {Promise<any>} A promise that resolves to an array representing the current state of the matchmaking queue.
     */
    async getMatchmakingQueue(): Promise<any> {
        if(this.users.entries() === undefined)
            return [];

        let queueSnapshot = [];
        for (const [userId, userInfo] of this.users.entries()) {
            const bucketKey = this.getBucketKey(userInfo.elo);
            queueSnapshot.push({
                userId,
                elo: userInfo.elo,
                socketId: userInfo.socketId,
                bucket: bucketKey,
            });
        }
        return queueSnapshot;
    }
}
