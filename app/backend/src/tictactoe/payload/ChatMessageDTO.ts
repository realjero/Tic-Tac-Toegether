/**
 * Represents a chat message data transfer object (DTO) that includes the message content, the sender's username, and the timestamp of the message.
 */
export class ChatMessageDTO {
    message: string;
    sender: string;
    timestamp: Date;

    /**
     * Constructs a new instance of a chat message DTO.
     *
     * @param message - The text content of the chat message.
     * @param sender - The username of the user who sent the message.
     * @param timestamp - The date and time when the message was sent.
     */
    constructor(message: string, sender: string, timestamp: Date) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
    }
}
