
import { ActionIcon, Box, Card, Group, Menu, Paper, rem, Stack, Text } from '@mantine/core';
import classes from './TopMenu.module.css';
import { IconHandStop } from '@tabler/icons-react';
import { IconAdjustments } from '@tabler/icons-react';
import { IconMenu2 } from '@tabler/icons-react';

export function TopMenu() {
    return <Box className={classes.button}>
        <Stack>
            <Menu shadow="md" width={200} position='bottom-start'>
                <Menu.Target>
                    <ActionIcon variant="default" size={rem(40)} radius="md" color="dark">
                        <IconMenu2 style={{ width: '50%', height: '50%' }} stroke={1} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item>Open CSV</Menu.Item>
                </Menu.Dropdown>
            </Menu>

        </Stack>

        <Group justify='center'>
            <Paper shadow='md' p={rem(4)} radius="md" withBorder>
                <Group gap={rem(4)}>
                    <ActionIcon variant="subtle" size={rem(40)} radius="md" color="dark">
                        <IconHandStop style={{ width: '50%', height: '50%' }} stroke={1} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size={rem(40)} radius="md" color="dark">
                        <IconAdjustments style={{ width: '50%', height: '50%' }} stroke={1} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size={rem(40)} radius="md" color="dark">
                        <IconAdjustments style={{ width: '50%', height: '50%' }} stroke={1} />
                    </ActionIcon>
                </Group>
            </Paper>
        </Group>

        <Box>test</Box>
    </Box>
}