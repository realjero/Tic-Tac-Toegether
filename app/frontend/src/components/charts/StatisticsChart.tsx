import { useState } from 'react';
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryAxis } from 'victory';

interface StatisticsChartProps {
    data: { x: Date; y: number }[][];
}

const StatisticsChart = ({ data }: StatisticsChartProps) => {
    const [zoomDomain, setZoomDomain] = useState<undefined>(undefined);

    /**
     * Handles zooming functionality of the statistics chart.
     * @param {undefined} domain - The zoom domain.
     */
    const handleZoom = (domain: undefined) => {
        setZoomDomain(domain);
    };

    const colors = ['var(--accent-500)', 'var(--primary-500)', 'var(--secondary-500)'];

    return (
        <>
            <div className="mt-4 flex justify-center gap-4">
                <div className="flex items-center">
                    <div className="mr-2 size-5 rounded-md bg-accent-500"></div>
                    <p className="whitespace-nowrap">WINS</p>
                </div>
                <div className="flex items-center">
                    <div className="mr-2 size-5 rounded-md bg-primary-500"></div>
                    <p className="whitespace-nowrap">DRAWS</p>
                </div>
                <div className="flex items-center">
                    <div className="mr-2 size-5 rounded-md bg-secondary-500"></div>
                    <p className="whitespace-nowrap">LOSSES</p>
                </div>
            </div>

            <VictoryChart
                scale={{ x: 'time' }}
                width={750}
                height={350}
                padding={{ top: 50, bottom: 50, left: 50, right: 0 }}
                containerComponent={
                    <VictoryZoomContainer
                        responsive={true}
                        zoomDimension="x"
                        zoomDomain={zoomDomain}
                        onZoomDomainChange={handleZoom}
                    />
                }
                animate={{
                    duration: 500
                }}>
                <VictoryAxis
                    style={{
                        axis: { stroke: 'var(--text)' },
                        ticks: { stroke: 'var(--text)' },
                        tickLabels: { fill: 'var(--text)' }
                    }}
                />

                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: { stroke: 'var(--text)' },
                        ticks: { stroke: 'var(--text)' },
                        tickLabels: { fill: 'var(--text)' }
                    }}
                />
                {data.map((line, index) => (
                    <VictoryLine
                        style={{
                            data: { stroke: colors[index] },
                            parent: { border: '1px solid #ccc' }
                        }}
                        data={line}
                    />
                ))}
            </VictoryChart>
        </>
    );
};

export default StatisticsChart;
