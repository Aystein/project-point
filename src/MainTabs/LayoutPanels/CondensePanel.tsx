import { Stack } from "@mantine/core";
import * as React from "react";
import { LayoutConfiguration } from "../../Store/ModelSlice";
import { setLayoutConfig } from "../../Store/ViewSlice";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";

export function CondensePanel({ channel }: { channel: 'x' | 'y' }) {
    const dispatch = useAppDispatch();
    const id = useAppSelector((state) => state.views.activeModel);

    console.log(channel);
    React.useEffect(() => {
        const layoutConfig: LayoutConfiguration = {
            channel,
            type: 'condense',
        }

        dispatch(setLayoutConfig({ id, layoutConfig }))
    }, [dispatch, channel, id]);

    return <Stack>
        No options
    </Stack>
}