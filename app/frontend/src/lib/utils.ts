import { HistoryItem } from '../types/types';

export const eloOverTime = (history: HistoryItem[], createdAt: Date) => {
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

export const statisticsOverTime = (history: HistoryItem[], username: string, createdAt: Date) => {
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
