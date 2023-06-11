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
} from '@mantine/core';
import { IconHome2 } from '@tabler/icons';
import { DataTab } from './MainTabs/DataTab';
import { Main } from './Main';
import { useAppDispatch } from './Store/hooks';
import { initializeDatasets } from './Store/FilesSlice';

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
    borderRight: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  main: {
    flex: 1,
    maxHeight: '100vh',
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
  { icon: IconHome2, label: 'Home', index: 1 },
  { icon: IconHome2, label: 'Home', index: 2 },
];

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
            <Text>Ant Application</Text>
          </div>
        </Header>
      }
      navbar={
        <Navbar width={{ sm: 300 }}>
          <Navbar.Section grow className={classes.wrapper}>
            <Stack className={classes.aside} pt="xs" spacing="xs">
              {mainLinks}
            </Stack>
            <div className={classes.main}>
              <Tabs
                defaultValue={mainLinksMockdata[0].label}
                value={active}
                orientation="vertical"
              >
                <Tabs.Panel value={mainLinksMockdata[0].label}>
                  <DataTab />
                </Tabs.Panel>
              </Tabs>
            </div>
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          maxHeight: '100vh',

          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Main />
      </div>
    </AppShell>
  );
}
