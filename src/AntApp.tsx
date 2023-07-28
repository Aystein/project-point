import * as React from 'react';
import {
  createStyles,
  Navbar,
  UnstyledButton,
  Tooltip,
  Tabs,
  Text,
  AppShell,
  Header,
  Footer,
  Stack,
  Kbd,
  Button,
} from '@mantine/core';
import { IconHome2 } from '@tabler/icons';
import { DataTab } from './MainTabs/DataTab';
import { Main } from './Main';
import { useAppDispatch } from './Store/hooks';
import { initializeDatasets } from './Store/FilesSlice';
import { atom, useAtom } from 'jotai';
import { ClusterTab } from './MainTabs/ClusterTab';
import { HistoryTab } from './MainTabs/HistoryTab';
import { EncodingTab } from './MainTabs/EncodingTab';

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
  { icon: IconHome2, label: 'Home', index: 0 },
  { icon: IconHome2, label: 'Cluster', index: 1 },
  { icon: IconHome2, label: 'History', index: 2 },
  { icon: IconHome2, label: 'Encoding', index: 3 },
];

export function AntApp2() {
  return <AppShell layout='alt' header={<Header height={60} p="xs">HEADER</Header>}
    navbar={
      <Navbar width={{ sm: 300 }}>
        <Navbar.Section grow style={{ display: 'flex' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {Array.from({ length: 100 }).map(() => <div>hihi</div>)}
          </div>
        </Navbar.Section>
      </Navbar>
    }
  >test</AppShell>
}

export function AntApp() {
  const { classes, cx } = useStyles();
  const [active, setActive] = React.useState(mainLinksMockdata[0].label);
  const dispatch = useAppDispatch();

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
        <link.icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  return (
    <AppShell
      padding={0}
      layout="alt"
      header={
        <Header height={60} p="md">
          <div
            style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <Kbd mr={5}>Ctrl</Kbd>
            <span>+</span>
            <Kbd ml={5}>S</Kbd>
          </div>
        </Header>
      }
      navbar={
        <Navbar width={{ sm: 300 }}>
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
                <EncodingTab />
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
