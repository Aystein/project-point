import React from "react";
import { GroupConfiguration } from "../../Store/interfaces";
import { Select, Stack } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { setLayoutConfig } from "../../Store/ViewSlice";

export function GroupingPanel({ defaultValue }: { defaultValue: GroupConfiguration; }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.activeModel);
    const columns = useAppSelector((state) => state.data.columns);


    const options = React.useMemo(() => {
        return columns
            .map((column) => ({ label: column.key, value: column.key }));
    }, [columns]);

    const [group, setGroup] = React.useState(defaultValue?.column);

    const strategies = [
        { label: 'slice', value: 'slice' },
        {
            label: 'treemap', value: 'treemap'
        }]

    const [strategy, setStrategy] = React.useState(defaultValue?.strategy ?? strategies[0].value)

    React.useEffect(() => {
        if (group && strategy) {
            const layoutConfig: GroupConfiguration = {
                channel: 'xy',
                type: 'group',
                column: group,
                strategy: strategy as 'slice' | 'treemap'
            };

            dispatch(setLayoutConfig({ id, layoutConfig }));
        }
    }, [dispatch, id, group, strategy]);

    return <Stack gap="xs">
        <Select
            label="Column"
            placeholder="Pick one"
            data={options}
            value={group}
            onChange={setGroup} />

        <Select
            label="Strategy"
            placeholder="Pick one"
            data={strategies}
            value={strategy}
            onChange={setStrategy} />
    </Stack>;
}
