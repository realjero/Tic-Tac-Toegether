import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface History {
    opponentEloAtTimestamp: number;
    opponentName: string;
    ownEloAtTimestamp: number;
    timestamp: string;
    winner: string;
}

interface HistoryProps {
    history: History[];
    username: string;
}

const History: React.FC<HistoryProps> = ({ history, username }) => {
    const headers = ['Date', 'Enemy', 'Winner', 'Result', ''];

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead className="">
                    <tr className="text-left">
                        {headers.map((header, index) => (
                            <th key={index} className="p-4">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="w-full divide-y divide-gray-500">
                    {history.map((game, index) => (
                        <tr key={index}>
                            <td className="whitespace-nowrap p-4">
                                {new Date(game.timestamp)
                                    .toLocaleString('en', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })
                                    .replace(/,/g, '')}
                            </td>
                            <td className="w-full max-w-0 overflow-hidden text-ellipsis whitespace-nowrap p-4">
                                {game.opponentName}
                            </td>
                            <td className="whitespace-nowrap p-4">
                                {game.winner === null
                                    ? '-'
                                    : game.winner === username
                                      ? 'You'
                                      : 'Enemy'}
                            </td>
                            <td className="whitespace-nowrap p-4">{game.ownEloAtTimestamp}</td>
                            <td className="whitespace-nowrap p-4">
                                <button>
                                    <ChevronDownIcon width={24} height={24} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default History;
