import { useHotkeys } from '@mantine/hooks';
import * as React from 'react';
import { useAppDispatch } from '../../../Store/hooks';

export function UndoBehavior() {
    const dispatch = useAppDispatch();

    useHotkeys([
        ['ctrl+G', () => null],
        ['ctrl+H', () => null],
    ]);

    return null;
}