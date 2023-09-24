import {
  AppShell,
  Box,
  Center,
  Tabs,
  useMantineColorScheme
} from '@mantine/core';
import * as React from 'react';
import { Main } from './Main';
import { ClusterTab } from './MainTabs/ClusterTab';
import { DataTab } from './MainTabs/DataTab';
import { HistoryTab } from './MainTabs/HistoryTab';
import { SettingsTab } from './MainTabs/SettingsTab';
import { initializeDatasets } from './Store/FilesSlice';
import { useAppDispatch, useAppSelector } from './Store/hooks';
import { TopMenu } from './MainTabs/TopMenu';
import { SideMenu } from './MainTabs/SideMenu';

/**const useStyles = createStyles((theme) => ({
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
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.dark[7],
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
}));**/



export function AntApp() {
  const [active, setActive] = React.useState("dataset");
  const dispatch = useAppDispatch();
  const dataId = useAppSelector((state) => state.data.id);

  React.useEffect(() => {
    dispatch(initializeDatasets());
  }, []);

  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding={0}
      layout="alt"
      styles={(theme) => ({
        main: {
          maxHeight: '100vh',

          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[1],
        },
      })}
    >
      <AppShell.Main>
        <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <TopMenu />
          <SideMenu />
          {
            dataId ? <Main /> : <Center style={{ width: '100%', height: '100%' }}><DataTab /></Center>
          }
          
        </Box>
      </AppShell.Main>
      {/**<AppShell.Navbar>
        <Tabs
          value={active}
          onChange={setActive}
          style={{ flexDirection: 'column', display: 'flex', flex: 1 }}
        >
          <Tabs.List>
            <Tabs.Tab value="dataset">Data</Tabs.Tab>
            <Tabs.Tab value="cluster">Cluster</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dataset">
            <DataTab />
          </Tabs.Panel>

          <Tabs.Panel value="cluster">
            <ClusterTab />
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTab />
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SettingsTab />
          </Tabs.Panel>
        </Tabs>
        </AppShell.Navbar>**/}
    </AppShell>
  );
}
