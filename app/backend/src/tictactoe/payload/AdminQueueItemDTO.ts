import {UsernameEloDTO} from "./UsernameEloDTO";

export class AdminQueueItemDTO {
    user: UsernameEloDTO;
    bucket: number;

    constructor(user: UsernameEloDTO, bucket: number) {
        this.user = user;
        this.bucket = bucket;
    }
}
