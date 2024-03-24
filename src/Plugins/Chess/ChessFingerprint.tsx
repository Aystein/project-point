import { Box, Center, Paper, Text } from "@mantine/core";
import { useAppSelector } from "../../Store/hooks";

export function ChessFingerprint({ filter }: { filter: number[] }) {
    const width = 250;
    const data = useAppSelector((state) => state.data.rows)
    const step = width / 8;
    const row = data[filter[0]];

    const pieces = {
        wk: '♔',
        wq: '♕',
        wr: '♖',
        wb: '♗',
        wp: '♙',
        wn: '♘',
        bk: '♚',
        bq: '♛',
        br: '♜',
        bb: '♝',
        bp: '♟︎',
        bn: '♞'
    }

    const color = '#ddd';

    return row ? <Center pos="relative">

        <Paper pos="relative" withBorder style={{
            width: width,
            height: width,
            boxShadow: 'none',
            backgroundPosition: `0px 0px, ${step}px ${step}px`,
            backgroundSize: `${step * 2}px ${step * 2}px`,
            backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color} 100%),linear-gradient(45deg, ${color} 25%, white 25%, white 75%, ${color} 75%, ${color} 100%)`
        }}>{
                [8, 7, 6, 5, 4, 3, 2, 1].map((y, yi) => {
                    return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((x, xi) => {
                        const screenX = xi * step;
                        const screenY = yi * step;

                        return <Text style={{ left: screenX, top: screenY, position: 'absolute', lineHeight: 1, fontSize: step, width: step, height: step }}>{pieces[row[`${x}${y}`]]}</Text>
                    })
                })
            }
        </Paper>
    </Center> : null
}