import { NumberInput, Slider, Stack, Input, useMantineTheme } from "@mantine/core";
import { setSettings } from "../Store/SettingsSlice";
import { useAppDispatch, useAppSelector } from "../Store/hooks";

export function SettingsTab() {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);
    const theme = useMantineTheme();

    return <Stack p="md">
        <NumberInput label="Time delta per iteration" description="In microseconds" value={settings.delta} onChange={(value) => dispatch(setSettings({ delta: value }))} max={10000} min={100} step={100} />
        <NumberInput label="Number of substeps" description="N substeps per full iteration" value={settings.substeps} onChange={(value) => dispatch(setSettings({ substeps: value }))} max={30} min={1} step={1} />
        <Input.Wrapper label="Radius scaling" description="Determines the relative radius of the marks">
            <Slider
                mt={`calc(${theme.spacing.xs} / 2)`}
                defaultValue={1}
                min={0}
                max={1}
                step={0.01}
                precision={2}
                value={settings.radiusScaling}
                onChange={(newVal) => dispatch(setSettings({ radiusScaling: newVal }))}
            />
        </Input.Wrapper>
    </Stack>
}