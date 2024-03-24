import { useInterval } from "@mantine/hooks";
import { ClusteringType, setClustering } from "../../../Store/ViewSlice";
import { useAppDispatch, useAppSelector } from "../../../Store/hooks";
import { DBSCAN } from 'density-clustering';
import { useVisContext } from "../../VisualizationContext";
import React from "react";
import { LineConfiguration } from "../../../Store/interfaces";

export function SemanticBehavior() {
    const rows = useAppSelector((state) => state.data.rows);
    const positions = useAppSelector((state) => state.views.positions);
    const filter = useAppSelector((state) => state.views.filter);
    const dispatch = useAppDispatch();
    const { zoom } = useVisContext();
    const ref = React.useRef();
    const activeModel = useAppSelector((state) => state.views.models.entities[state.views.activeModel]);
    const layoutModel = activeModel ? Object.values(activeModel.layoutConfigurations.entities).find((layout) => layout.channel === 'line') : null
    const lineLayout = layoutModel ? layoutModel as LineConfiguration : null;
    const semanticZoom = useAppSelector((state) => state.settings.semanticScaling);

    const Trigger_DBSCAN = () => {
        if (!activeModel || !activeModel.lineFilter || !lineLayout) {
            dispatch(setClustering([]));
            return;
        }

        const lineFilter = activeModel.lineFilter;
        const newPositions = [...positions];
        const input = positions.map((value, i) => ([value.x, value.y, i]));

        const clusters = new DBSCAN().run(input, (0.05 * semanticZoom) / zoom.s, 2, (a: number[], b: number[]) => {
            const x = a[0] - b[0];
            const y = a[1] - b[1];

            const ai = a[2];
            const bi = b[2];

            const rowA = rows[ai];
            const rowB = rows[bi];

            const lineA = rowA[lineLayout.column];
            const lineB = rowB[lineLayout.column];
            if (lineA !== lineB) {
                return 1000;
            }

            if (lineFilter[lineA].neighboorLookup[rowA.index].prev !== rowB.index && lineFilter[lineA].neighboorLookup[rowA.index].next !== rowB.index) {
                return 1000;
            }

            return Math.sqrt(x * x + y * y);
        });

        const clustering = clusters.map((cluster: number[]) => {
            let centroid = {
                x: 0,
                y: 0,
            }

            cluster.forEach((index) => {
                centroid.x += positions[index].x;
                centroid.y += positions[index].y;
            })

            centroid.x /= cluster.length;
            centroid.y /= cluster.length;

            cluster.forEach((index) => {
                newPositions[index] = centroid;
            })

            return {
                indices: cluster,
                centroid: centroid,
            }
        }) as ClusteringType

        dispatch(setClustering(clustering))
    }

    ref.current = Trigger_DBSCAN;

    const interval = useInterval(() => {
        ref.current();
    }, 1000);

    React.useEffect(() => {
        interval.start();
    }, []);


    return null;
}