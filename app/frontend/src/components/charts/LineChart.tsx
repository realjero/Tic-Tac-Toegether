import { useState } from 'react';
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryAxis } from 'victory';

interface LineChartProps {
    data: { x: Date; y: number }[][];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const [zoomDomain, setZoomDomain] = useState<undefined>(undefined);

    const handleZoom = (domain: undefined) => {
        setZoomDomain(domain);
    };

    const colors = ['var(--accent-500)', 'var(--primary-500)', 'var(--secondary-500)'];

    return (
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
    );
};

export default LineChart;
