import { Select, Stack } from "@mantine/core";
import { DualAxisConfiguration, LayoutConfiguration } from "../../Store/interfaces";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import React from "react";
import { setLayoutConfig } from "../../Store/ViewSlice";

export function DualAxisPanel({
    defaultValue,
}: {
    defaultValue: DualAxisConfiguration;
}) {
    const [xColumn, setXColumn] = React.useState(defaultValue?.xColumn);
    const [yColumn, setYColumn] = React.useState(defaultValue?.yColumn);
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.present.activeModel);
    const columns = useAppSelector((state) => state.data.columns);

    const options = React.useMemo(() => {
        return columns.map((column) => ({ label: column.key, value: column.key }));
    }, [columns]);

    const update = (newX: string, newY: string) => {
        const layoutConfig: LayoutConfiguration = {
            channel: 'xy',
            type: 'dual_axis',
            xColumn: newX,
            yColumn: newY,
        }

        dispatch(setLayoutConfig({ id, layoutConfig }))
    }

    return <Stack>
        <Select
            label="X"
            placeholder="Pick one"
            searchable
            data={options}
            value={xColumn}
            onChange={(value) => {
                setXColumn(value);
                update(value, yColumn)
            }}
        />

        <Select
            label="Y"
            placeholder="Pick one"
            searchable
            data={options}
            value={yColumn}
            onChange={(value) => {
                setYColumn(value)
                update(xColumn, value)
            }}
        />
    </Stack>
}