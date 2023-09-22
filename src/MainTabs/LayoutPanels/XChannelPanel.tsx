import { Select, Tabs } from '@mantine/core';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { Selectors } from '../../Store/Selectors';
import { DataType } from '../../Interfaces';
import { setLayoutConfig } from '../../Store/ViewSlice';
import { LayoutConfiguration } from '../../Store/ModelSlice';
import { CondensePanel } from './CondensePanel';

function NumericalScalePanel({ channel }: { channel: 'x' | 'y' }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(Selectors.data);
    const id = useAppSelector((state) => state.views.activeModel);

    const [column, setColumn] = React.useState<string>();

    const options = React.useMemo(() => {
        return data.columns
            .filter((value) => value.type === DataType.Numeric)
            .map((value) => value.key);
    }, [data]);

    const handleChange = (value: string) => {
        setColumn(value);
        console.log(value);
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

export function ChannelPanel({ channel }: { channel: 'x' | 'y' }) {
    const data = React.useMemo(() => {
        return [
            { label: 'Numerical scale', value: 'numericalscale' },
            { label: 'Condense', value: 'condense' },
        ]
    }, []);

    const [value, setValue] = React.useState(data[0].value);

    return <>
        <Select label="Select layout" data={data} value={value} onChange={setValue} />

        <Tabs value={value} keepMounted={false}>
            <Tabs.Panel value='numericalscale'>
                <NumericalScalePanel channel={channel} />
            </Tabs.Panel>
            <Tabs.Panel value='condense'>
                <CondensePanel channel={channel} />
            </Tabs.Panel>
        </Tabs>
    </>
}