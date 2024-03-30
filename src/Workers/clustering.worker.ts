import { DBSCAN } from 'density-clustering';
import { VectorLike } from '../Interfaces';
import { LineFilter } from '../Store/interfaces';

function euclidean(a: number[], b: number[]) {
    const x = a[0] - b[0];
    const y = a[1] - b[1];
    return Math.sqrt(x * x + y * y);
}

self.onmessage = ({ data: { X, lineFilter } }: { data: { X: VectorLike[], lineFilter: LineFilter } }) => {
    const input = X.map((x, i) => [x.x, x.y, i]);
    // console.log(lineFilter, X)
    
    const sequenceInput = lineFilter.flatMap((line, lineI) => {
        // split up lines in subsequences
        const subsequences = [];
        // console.log(line.indices);

        line.indices.forEach((index, i) => {
            if (i === 0) {
                return;
            }

            subsequences.push([line.indices[i - 1], line.indices[i], lineI]);
        })

        return subsequences;
    })

    console.log(sequenceInput);


    const delta = 0.1;
    
    const clusters = new DBSCAN().run(sequenceInput, delta, 3, (a: number[], b: number[]) => {
        // console.log(a, b)
        const lineAStart = input[a[0]];
        const lineAEnd = input[a[1]];
        const lineBStart = input[b[0]];
        const lineBEnd = input[b[1]];

        // console.log(lineAStart, lineAEnd, lineBStart, lineBEnd)

        // calculate angle
        const angleA = Math.atan2(lineAEnd[1] - lineAStart[1], lineAEnd[0] - lineAStart[0]);
        const angleB = Math.atan2(lineBEnd[1] - lineBStart[1], lineBEnd[0] - lineBStart[0]);

        // calculate angle difference
        const angleDiff = Math.abs(angleA - angleB);

        // if angle difference is too large, return infinity
        if (angleDiff > Math.PI / 4) {
             return 1000;
        }

        return euclidean(lineAStart, lineBStart) + euclidean(lineAEnd, lineBEnd);
    });

    console.log(clusters);
};

