import { Stack } from "@mantine/core";
import * as React from "react";
import { LayoutConfiguration } from "../../Store/interfaces";
import { setLayoutConfig } from "../../Store/ViewSlice";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";

export function CondensePanel({ channel, defaultValue }: { channel: 'x' | 'y', defaultValue: LayoutConfiguration }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.activeModel);

    React.useEffect(() => {
        const layoutConfig: LayoutConfiguration = {
            channel,
            type: 'condense',
        }

        dispatch(setLayoutConfig({ id, layoutConfig }))
    }, [dispatch, channel, id]);

    return <Stack>
    </Stack>
}