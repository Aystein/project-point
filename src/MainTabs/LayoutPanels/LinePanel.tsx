import { Select, Stack } from "@mantine/core";
import * as React from "react";
import { ColorConfiguration, LineConfiguration } from "../../Store/interfaces";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { removeLayoutConfig, setLayoutConfig } from "../../Store/ViewSlice";

export function LinePanel({ defaultValue }: { defaultValue: ColorConfiguration }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.present.activeModel);
    const [featureType, setFeatureType] = React.useState(defaultValue?.featureType ?? 'categorical');

    const columns = useAppSelector((state) => state.data.columns);

    const options = React.useMemo(() => {
        return columns
            .map((column) => ({ label: column.key, value: column.key }));
    }, [columns]);

    const [column, setColumn] = React.useState(defaultValue?.column)

    const handleColumnChange = (value: string) => {
        setColumn(value);

        if (value) {
            const layoutConfig: LineConfiguration = {
                channel: 'line',
                type: 'setline',
                column: value,
            }

            dispatch(setLayoutConfig({ id, layoutConfig }))
        } else {
            dispatch(removeLayoutConfig({ channel: 'line' }))
        }
    }

    return <Stack gap="xs">
        <Select
            label="Column"
            placeholder="Pick one"
            searchable
            data={options}
            value={column}
            onChange={handleColumnChange}
        />

        <Select
            label="Type"
            placeholder="Pick one"
            data={['categorical', 'numeric']}
            value={featureType}
            onChange={(newVal: 'categorical' | 'numerical') => setFeatureType(newVal)}
        />
    </Stack>
}