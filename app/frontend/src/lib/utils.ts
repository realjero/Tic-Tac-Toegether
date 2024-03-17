import { HistoryItem } from '../types/types';

/**
 * Calculates the Elo rating over time based on the player's game history.
 * @param {HistoryItem[]} history - The player's game history.
 * @param {Date} createdAt - The date when the player's profile was created.
 * @returns { { x: Date, y: number }[] } - An array representing the Elo rating over time.
 */
export const eloOverTime = (history: HistoryItem[], createdAt: Date): { x: Date; y: number }[] => {
    const firstItem = {
        x: new Date(createdAt),
        y: 1000
    };
    const data = history.map((game) => {
        return { x: game.timestamp, y: game.ownEloAtTimestamp };
    });

    data.unshift(firstItem);
    return data;
};

/**
 * Calculates the statistics over time based on the player's game history.
 * @param {HistoryItem[]} history - The player's game history.
 * @param {string} username - The username of the player.
 * @param {Date} createdAt - The date when the player's profile was created.
 * @returns { { x: Date, y: number }[][] } - An array of arrays representing the statistics over time.
 * The outer array contains three arrays: wins, draws, and losses. Each inner array contains objects with x and y properties representing the timestamp and count of wins, draws, and losses over time, respectively.
 */
export const statisticsOverTime = (
    history: HistoryItem[],
    username: string,
    createdAt: Date
): { x: Date; y: number }[][] => {
    let winSum = 0;
    let lossSum = 0;
    let drawSum = 0;
    const wins = [{ x: new Date(createdAt), y: 0 }];
    const losses = [{ x: new Date(createdAt), y: 0 }];
    const draws = [{ x: new Date(createdAt), y: 0 }];

    history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (const item of history) {
        const { winner, timestamp } = item;

        if (winner === username) {
            wins.push({ x: timestamp, y: ++winSum });
        } else if (winner === undefined) {
            draws.push({ x: timestamp, y: ++drawSum });
        } else {
            losses.push({ x: timestamp, y: ++lossSum });
        }
    }

    if (history.length > 0) {
        const lastItem = history[history.length - 1];

        wins.push({ x: lastItem.timestamp, y: winSum });
        losses.push({ x: lastItem.timestamp, y: lossSum });
        draws.push({ x: lastItem.timestamp, y: drawSum });
    }

    return [wins, draws, losses];
};

export const boardPresets = [
    [
        ['O', 'X', ''],
        ['O', 'X', 'O'],
        ['', 'X', '']
    ],
    [
        ['X', '', 'O'],
        ['', 'O', 'X'],
        ['X', 'O', '']
    ],
    [
        ['X', '', ''],
        ['', 'O', ''],
        ['', '', 'X']
    ],
    [
        ['', '', 'X'],
        ['O', '', ''],
        ['', 'X', 'O']
    ],
    [
        ['', 'X', 'O'],
        ['', '', ''],
        ['O', '', 'X']
    ],
    [
        ['X', '', ''],
        ['', 'O', ''],
        ['O', 'X', '']
    ],
    [
        ['', 'X', 'O'],
        ['', 'O', ''],
        ['X', '', 'X']
    ],
    [
        ['', 'O', 'X'],
        ['X', '', ''],
        ['O', '', 'X']
    ]
];
