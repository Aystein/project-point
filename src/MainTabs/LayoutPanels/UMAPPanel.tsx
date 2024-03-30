import * as React from 'react';
import { Button, Stack } from "@mantine/core";
import { modals } from '@mantine/modals';
import { setLayoutConfig } from '../../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { UmapConfiguration } from '../../Store/interfaces';

export function UMAPPanel({ defaultValue }: { defaultValue; }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.present.activeModel);

    const onFinish = ({ columns }: { columns: string[] }) => {
        const layoutConfig: UmapConfiguration = {
            channel: 'xy',
            type: 'umap',
            columns,
            perplexity: 30,
            neighbors: 15,
        };

        dispatch(setLayoutConfig({ id, layoutConfig }));
    }

    return <Stack>
        <>
            <Button onClick={() => modals.openContextModal({
                modal: 'umap',
                title: 'UMAP settings',
                innerProps: {
                    onFinish,
                },
            })}>Select columns</Button>
        </>
    </Stack>
}