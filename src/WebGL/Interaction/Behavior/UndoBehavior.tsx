import { useHotkeys } from '@mantine/hooks';
import * as React from 'react';
import { useAppDispatch } from '../../../Store/hooks';
import { ActionCreators } from 'redux-undo';
import { store } from '../../../Store/Store';
import { createAction } from '@reduxjs/toolkit';

const undoAction = createAction('UNDO');
const redoAction = createAction('REDO');

export function UndoBehavior() {
    const dispatch = useAppDispatch();

    useHotkeys([
        ['ctrl+Z', () =>  {
            store.dispatch(undoAction())
        }],
    ]);

    return null;
}