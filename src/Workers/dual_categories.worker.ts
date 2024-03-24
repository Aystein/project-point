/* eslint-disable no-restricted-globals */
import { IRectangle } from '../WebGL/Math/Rectangle';
import { forceNormalizationNew, scaleToWorld } from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/interfaces';
import { DataType, VectorLike } from '../Interfaces';
import { Column } from '../Store/DataSlice.';
import { bin, HistogramGeneratorNumber } from 'd3';
import { fillRect } from './util';
import groupBy from 'lodash/groupBy';

interface Props {
    data: {
        n: number;
        area: IRectangle;
        xColumn: Column;
        yColumn: Column;
        X: { [key: string]: string | number }[];
    };
}

type NormalizedBin = {
    values: { value, relativeIndex: number }[],
    label: string,
}

self.onmessage = ({
    data: { n, area, xColumn, yColumn, X },
}: Props) => {
    const [a, b, worldX, worldY, r] = forceNormalizationNew(area);

    let labels: LabelContainer[] = [];

    const relativeIndices = X.map((value, i) => ({
        relativeIndex: i,
        value,
    }));

    let Y: VectorLike[] = X.map((node, i) => ({ x: worldX(0.5), y: worldY(0.5) }))

    if (xColumn && yColumn) {
        let xBins: NormalizedBin[]
        let yBins: NormalizedBin[]

        if (xColumn.type === DataType.Numeric) {
            // @ts-ignore
            const bins = bin().value((row) => row.value[xColumn.key])(relativeIndices);

            xBins = bins.map((bin) => {
                return {
                    label: `${bin.x0} - ${bin.x1}`,
                    values: bin,
                }
            })
        } else if (xColumn.type === DataType.Ordinal) {
            const groups = groupBy(relativeIndices, (value) => {
                return value.value[xColumn.key];
            });

            xBins = Object.keys(groups).map((groupKey) => {
                return {
                    label: groupKey,
                    values: groups[groupKey]
                }
            })
        }
        if (yColumn.type === DataType.Numeric) {
            // @ts-ignore
            const bins = bin().value((row) => row.value[yColumn.key])(relativeIndices);

            yBins = bins.map((bin) => {
                return {
                    label: `${bin.x0} - ${bin.x1}`,
                    values: bin,
                }
            })
        } else if (xColumn.type === DataType.Ordinal) {
            const groups = groupBy(relativeIndices, (value) => {
                return value.value[yColumn.key];
            });

            yBins = Object.keys(groups).map((groupKey) => {
                return {
                    label: groupKey,
                    values: groups[groupKey]
                }
            })
        }

        const xStep = 1 / xBins.length;
        const yStep = 1 / yBins.length;

        xBins.forEach((xBin, xi) => {
            yBins.forEach((yBin, yi) => {
                let binArea: IRectangle = {
                    x: worldX(xStep * xi),
                    y: worldY(yStep * yi),
                    width: area.width / xBins.length,
                    height: area.height / yBins.length
                }

                const xSet = new Set(xBin.values.map((value) => value.relativeIndex))
                const ySet = new Set(yBin.values.map((value) => value.relativeIndex))

                const duplicateSet = new Set<number>();

                const includedItems = [...xBin.values, ...yBin.values].filter((value) => {
                    const result = xSet.has(value.relativeIndex) && ySet.has(value.relativeIndex)

                    if (result) {
                        duplicateSet.add(value.relativeIndex)
                    }

                    return result;
                })

                const { Y: rectY } = fillRect(binArea, includedItems.length);

                includedItems.forEach((value, i) => {
                    Y[value.relativeIndex].x = rectY[i].x;
                    Y[value.relativeIndex].y = rectY[i].y;
                })
            })
        })

        labels.push({
            discriminator: 'positionedlabels',
            type: 'x',
            labels: xBins.map((xBin, i) => {
                return { position: xStep / 2 + xStep * i, content: xBin.label }
            })
        })
        labels.push({
            discriminator: 'positionedlabels',
            type: 'y',
            labels: yBins.map((yBin, i) => {
                return { position: yStep / 2 + yStep * i, content: yBin.label }
            })
        })
    }

    self.postMessage({
        type: 'finish',
        Y,
        labels,
    });
};