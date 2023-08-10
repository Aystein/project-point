import {
  ActionIcon,
  AppShell,
  Group,
  Header,
  Kbd,
  Navbar,
  Stack,
  Tabs,
  Tooltip,
  UnstyledButton,
  createStyles,
  useMantineColorScheme
} from '@mantine/core';
import { IconFile, IconLasso, IconMoon, IconSettings, IconClock } from '@tabler/icons-react';
import * as React from 'react';
import { Main } from './Main';
import { ClusterTab } from './MainTabs/ClusterTab';
import { DataTab } from './MainTabs/DataTab';
import { HistoryTab } from './MainTabs/HistoryTab';
import { initializeDatasets } from './Store/FilesSlice';
import { useAppDispatch } from './Store/hooks';
import { SettingsTab } from './MainTabs/SettingsTab';

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: 'flex',
  },

  aside: {
    flex: '0 0 60px',
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
      }`,
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  mainLink: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainLinkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color,
    },
  },
}));

const mainLinksMockdata = [
  { icon: IconFile, label: 'Dataset', index: 0 },
  { icon: IconLasso, label: 'Cluster', index: 1 },
  { icon: IconClock, label: 'History', index: 2 },
  { icon: IconSettings, label: 'Settings', index: 3 },
];


export function AntApp() {
  const { classes, cx } = useStyles();
  const [active, setActive] = React.useState(mainLinksMockdata[0].label);
  const dispatch = useAppDispatch();
  const colorScheme = useMantineColorScheme();

  React.useEffect(() => {
    dispatch(initializeDatasets());
  }, []);

  const mainLinks = mainLinksMockdata.map((link) => (
    <Tooltip label={link.label} position="right" withArrow key={link.index}>
      <UnstyledButton
        onClick={() => setActive(link.label)}
        className={cx(classes.mainLink, {
          [classes.mainLinkActive]: link.label === active,
        })}
      >
        <link.icon />
      </UnstyledButton>
    </Tooltip>
  ));

  return (
    <AppShell
      padding={0}
      layout="alt"
      header={
        <Header height={60}>
          <Group position='apart' style={{ width: '100%', height: '100%' }} p='xs'>
            <Group>
              <Kbd mr={5}>Ctrl</Kbd>
              <span>+</span>
              <Kbd ml={5}>S</Kbd>
            </Group>

            <ActionIcon variant="default" size="lg" onClick={() => {
              colorScheme.toggleColorScheme()
            }}><IconMoon stroke={1} /></ActionIcon>
          </Group>
        </Header>
      }
      navbar={
        <Navbar width={{ sm: 360 }}>
          <Navbar.Section grow className={classes.wrapper}>
            <Stack className={classes.aside} pt="xs" spacing="xs">
              {mainLinks}
            </Stack>
            <Tabs
              defaultValue={mainLinksMockdata[0].label}
              value={active}
              style={{ flexDirection: 'column', display: 'flex', flex: 1 }}
              sx={{
                '> div': {
                  overflowY: 'auto',
                  flexGrow: 1,
                  height: 0,
                  flexDirection: 'column'
                }
              }}
            >
              <Tabs.Panel value={mainLinksMockdata[0].label} style={{ display: active === mainLinksMockdata[0].label ? 'flex' : 'none' }}>
                <DataTab />
              </Tabs.Panel>

              <Tabs.Panel value={mainLinksMockdata[1].label} style={{ display: active === mainLinksMockdata[1].label ? 'flex' : 'none' }}>
                <ClusterTab />
              </Tabs.Panel>

              <Tabs.Panel value={mainLinksMockdata[2].label} style={{ display: active === mainLinksMockdata[2].label ? 'flex' : 'none' }}>
                <HistoryTab />
              </Tabs.Panel>

              <Tabs.Panel value={mainLinksMockdata[3].label} style={{ display: active === mainLinksMockdata[3].label ? 'flex' : 'none' }}>
                <SettingsTab />
              </Tabs.Panel>
            </Tabs>
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          maxHeight: '100vh',

          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.white,
        },
      })}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Main />
      </div>
    </AppShell>
  );
}
