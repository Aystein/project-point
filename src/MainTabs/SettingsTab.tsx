import { NumberInput, Stack } from "@mantine/core";
import { setSettings } from "../Store/SettingsSlice";
import { useAppDispatch, useAppSelector } from "../Store/hooks";

export function SettingsTab() {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);

    return <Stack p="md">
        <NumberInput label="Time delta per iteration" description="In microseconds" value={settings.delta} onChange={(value) => dispatch(setSettings({ delta: value }))} max={10000} min={100} step={100} />
        <NumberInput label="Number of substeps" description="N substeps per full iteration" value={settings.substeps} onChange={(value) => dispatch(setSettings({ substeps: value }))} max={30} min={1} step={1} />
    </Stack>
}