import { create } from 'zustand'
import { VectorLike } from '../Interfaces'

type StoreType = {
    positions: { _buffer: VectorLike[] }
    updatePositions: (update: VectorLike[], indices?: number[]) => void;
}

export const useScatterStore = create<StoreType>((set) => ({
    positions: { _buffer: null },
    updatePositions: (update: VectorLike[], indices?: number[]) => {
        set((state) => {
            const array = state.positions;

            if (indices) {
                array._buffer = array._buffer.slice();

                indices.forEach((globalIndex, localIndex) => {
                    array._buffer[globalIndex] = update[localIndex]
                })
            } else {
                array._buffer = update;
            }

            return ({ positions: { ...state.positions } })
        })
    },
}))