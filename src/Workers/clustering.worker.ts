import { DBSCAN } from 'density-clustering';
import { VectorLike } from '../Interfaces';

self.onmessage = ({ data: { X } }: { data: { X: VectorLike[] } }) => {
    const input = 
    
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
};

