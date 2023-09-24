import React from "react";
import { GroupConfiguration, LayoutConfiguration } from "../../Store/interfaces";
import { Select, Stack, Tabs } from "@mantine/core";
import { GroupingPanel } from "./GroupingPanel";
import { UMAPPanel } from "./UMAPPanel";

export function XYPanel({ defaultValue }: { defaultValue: LayoutConfiguration }) {
    const data = React.useMemo(() => {
        return [
            { label: 'Grouping', value: 'group' },
            { label: 'UMAP', value: 'umap' }
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
        </Tabs>
    </Stack>
}