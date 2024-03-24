import React from "react";
import { DualAxisConfiguration, GroupConfiguration, LayoutConfiguration, SpaghettiConfiguration } from "../../Store/interfaces";
import { Select, Stack, Tabs } from "@mantine/core";
import { GroupingPanel } from "./GroupingPanel";
import { UMAPPanel } from "./UMAPPanel";
import { SpaghettiPanel } from "./SpaghettiPanel";
import { DualAxisPanel } from "./DualAxisPanel";

export function XYPanel({ defaultValue }: { defaultValue: LayoutConfiguration }) {
    const data = React.useMemo(() => {
        return [
            { label: 'Grouping', value: 'group' },
            { label: 'UMAP', value: 'umap' },
            { label: 'Spaghetti', value: 'spaghetti' },
            { label: 'Axis', value: 'dual_axis' }
        ]
    }, []);

    const [value, setValue] = React.useState(defaultValue?.type ?? data[0].value);

    return <Stack gap="xs">
        <Select label="Select layout" data={data} value={value} onChange={setValue} />

        <Tabs value={value} keepMounted={false}>
            <Tabs.Panel value='group'>
                <GroupingPanel defaultValue={defaultValue ? defaultValue as GroupConfiguration : undefined} />
            </Tabs.Panel>
            <Tabs.Panel value='umap'>
                <UMAPPanel defaultValue={defaultValue ? defaultValue as GroupConfiguration : undefined} />
            </Tabs.Panel>
            <Tabs.Panel value='spaghetti'>
                <SpaghettiPanel defaultValue={defaultValue ? defaultValue as SpaghettiConfiguration : undefined} />
            </Tabs.Panel>
            <Tabs.Panel value='dual_axis'>
                <DualAxisPanel defaultValue={defaultValue ? defaultValue as DualAxisConfiguration : undefined} />
            </Tabs.Panel>
        </Tabs>
    </Stack>
}