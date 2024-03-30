import { Select, Stack, Tabs } from '@mantine/core';
import * as React from 'react';
import { DataType } from '../../Interfaces';
import { LayoutConfiguration, LinearScaleConfiguration } from '../../Store/interfaces';
import { Selectors } from '../../Store/Selectors';
import { setLayoutConfig } from '../../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { CondensePanel } from './CondensePanel';

function NumericalScalePanel({ channel, defaultValue }: { channel: 'x' | 'y', defaultValue: LinearScaleConfiguration }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(Selectors.data);
    const id = useAppSelector((state) => state.views.present.activeModel);

    const [column, setColumn] = React.useState<string>(defaultValue?.column);

    const options = React.useMemo(() => {
        return data.columns
            .filter((value) => value.type === DataType.Numeric)
            .map((value) => value.key);
    }, [data]);

    const handleChange = (value: string) => {
        setColumn(value);

        const layoutConfig: LayoutConfiguration = {
            channel,
            type: 'numericalscale',
            column: value,
        }

        dispatch(setLayoutConfig({ id, layoutConfig }))
    }

    return <Select
        label="Select column"
        placeholder="Pick one"
        searchable
        data={options}
        value={column}
        onChange={handleChange}
    />
}

export function AxisPanel({ channel, defaultValue }: { channel: 'x' | 'y', defaultValue: LayoutConfiguration }) {
    const data = React.useMemo(() => {
        return [
            { label: 'Numerical scale', value: 'numericalscale' },
            { label: 'Condense', value: 'condense' },
        ]
    }, []);

    const [value, setValue] = React.useState(defaultValue?.type ?? data[0].value);

    return <Stack gap="xs">
        <Select label="Select layout" data={data} value={value} onChange={setValue} />

        <Tabs value={value} keepMounted={false}>
            <Tabs.Panel value='numericalscale'>
                <NumericalScalePanel channel={channel} defaultValue={defaultValue?.type === 'numericalscale' ? defaultValue : undefined} />
            </Tabs.Panel>
            <Tabs.Panel value='condense'>
                <CondensePanel channel={channel} defaultValue={defaultValue} />
            </Tabs.Panel>
        </Tabs>
    </Stack>
}