import * as React from 'react'
import {
  createStyles,
  Navbar,
  UnstyledButton,
  Tooltip,
  Title,
  Tabs,
  Text,
  AppShell,
  Header,
  Footer,
} from '@mantine/core'
import {
  IconHome2,
} from '@tabler/icons'
import { DataTab } from './MainTabs/DataTab'
import { Main } from './Main'
import { useAppDispatch } from './Store/hooks'
import { initializeDatasets } from './Store/FilesSlice'

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
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  mainLink: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
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

  title: {
    boxSizing: 'border-box',
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xl,
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    paddingTop: 18,
    height: 60,
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  logo: {
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    height: 60,
    paddingTop: theme.spacing.md,
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    marginBottom: theme.spacing.xl,
  },

  link: {
    boxSizing: 'border-box',
    display: 'block',
    textDecoration: 'none',
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}px`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: 44,
    lineHeight: '44px',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },

  linkActive: {
    '&, &:hover': {
      borderLeftColor: theme.fn.variant({
        variant: 'filled',
        color: theme.primaryColor,
      }).background,
      backgroundColor: theme.fn.variant({
        variant: 'filled',
        color: theme.primaryColor,
      }).background,
      color: theme.white,
    },
  },
}))

const mainLinksMockdata = [
  { icon: IconHome2, label: 'Home', index: 0 },
]

export function AntApp() {
  const { classes, cx } = useStyles()
  const [active, setActive] = React.useState(mainLinksMockdata[0].label)
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(initializeDatasets())
  }, [])

  const mainLinks = mainLinksMockdata.map((link) => (
    <Tooltip
      label={link.label}
      position="right"
      withArrow
      key={link.label}
    >
      <UnstyledButton
        onClick={() => setActive(link.label)}
        className={cx(classes.mainLink, {
          [classes.mainLinkActive]: link.label === active,
        })}
      >
        <link.icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ))

  return (
    <AppShell
      padding={0}
      footer={
        <Footer height={60} p="md">
          Application footer
        </Footer>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
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
            <div className={classes.aside}>{mainLinks}</div>
            <div className={classes.main}>
              <Title order={4} className={classes.title}>
                Main Content
              </Title>

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
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          maxHeight: '100vh',
        },
      })}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Main />
      </div>
    </AppShell>
  )
}
