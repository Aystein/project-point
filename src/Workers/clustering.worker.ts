import { DBSCAN } from 'density-clustering';
import { VectorLike } from '../Interfaces';
import { LineFilter } from '../Store/interfaces';

function euclidean(a: number[], b: number[]) {
    const x = a[0] - b[0];
    const y = a[1] - b[1];
    return Math.sqrt(x * x + y * y);
}

self.onmessage = ({ data: { X } }: { data: { X: VectorLike[], lineFilter: LineFilter } }) => {
    const input = X.map((x, i) => [x.x, x.y, i]);
    const delta = 0.05;
    
    const clusters = new DBSCAN().run(input, delta, 3, (a: number[], b: number[]) => {
        /* const ai = a[2];
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
    
        return euclidean(a, b); */
    });
};

