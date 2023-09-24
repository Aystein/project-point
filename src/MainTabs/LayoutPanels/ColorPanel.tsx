import { Select, Stack } from "@mantine/core";
import * as React from "react";
import { ColorConfiguration } from "../../Store/interfaces";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { setLayoutConfig } from "../../Store/ViewSlice";

export function ColorPanel({ defaultValue }: { defaultValue: ColorConfiguration }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.activeModel);
    const [featureType, setFeatureType] = React.useState(defaultValue?.featureType ?? 'categorical');

    const columns = useAppSelector((state) => state.data.columns);

    const options = React.useMemo(() => {
        return columns
            .map((column) => ({ label: column.key, value: column.key }));
    }, [columns]);

    const [column, setColumn] = React.useState(defaultValue?.column ?? options[0].value)

    React.useEffect(() => {
        if (column) {
            const layoutConfig: ColorConfiguration = {
                channel: 'color',
                type: 'setcolor',
                column,
                featureType,
            }

            dispatch(setLayoutConfig({ id, layoutConfig }))
        }
    }, [dispatch, id, column, featureType]);

    return <Stack gap="xs">
        <Select
            label="Column"
            placeholder="Pick one"
            searchable
            data={options}
            value={column}
            onChange={setColumn}
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