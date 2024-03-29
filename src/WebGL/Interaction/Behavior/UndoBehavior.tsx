import { useHotkeys } from '@mantine/hooks';
import * as React from 'react';

export function UndoBehavior() {
    useHotkeys([
        ['ctrl+K', () => console.log('Trigger search')],
    ]);

    return null;
}