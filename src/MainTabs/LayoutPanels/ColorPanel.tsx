import { Select, Stack } from "@mantine/core";
import * as React from "react";
import { ColorConfiguration } from "../../Store/interfaces";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { setLayoutConfig } from "../../Store/ViewSlice";
import { useForm } from "@mantine/form";

export function ColorPanel({ defaultValue }: { defaultValue: ColorConfiguration }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.present.activeModel);
    const [featureType, setFeatureType] = React.useState(defaultValue?.featureType ?? 'categorical');

    const columns = useAppSelector((state) => state.data.columns);

    const options = React.useMemo(() => {
        return columns
            .map((column) => ({ label: column.key, value: column.key }));
    }, [columns]);

    const [column, setColumn] = React.useState(defaultValue?.column)

    const update = (p_column, p_featureType) => {
        if (p_column) {
            const layoutConfig: ColorConfiguration = {
                channel: 'color',
                type: 'setcolor',
                column: p_column,
                featureType: p_featureType,
            }

            dispatch(setLayoutConfig({ id, layoutConfig }))
        }
    };

    const handleChangeType = (newVal: 'categorical' | 'numerical') => {
        setFeatureType(newVal)
        update(column, newVal)
    }

    const handleChangeColumn = (newVal: string) => {
        setColumn(newVal);
        update(newVal, featureType);
    }

    return <Stack gap="xs">
        <Select
            label="Column"
            placeholder="Pick one"
            searchable
            data={options}
            value={column}
            onChange={handleChangeColumn}
        />

        <Select
            label="Type"
            placeholder="Pick one"
            data={['categorical', 'numeric']}
            value={featureType}
            onChange={handleChangeType}
        />
    </Stack>
}