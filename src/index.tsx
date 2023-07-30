import { Notifications } from '@mantine/notifications';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Provider as JotaiProvider } from 'jotai';
import { AntApp } from './AntApp';
import { store } from './Store/Store';
import { ModalsProvider } from '@mantine/modals';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { TSNEModal } from './Modals/tSNEModal';
import { ColorByModal } from './Modals/ColorByModal';

const modals = {
  demonstration: TSNEModal,
  colorby: ColorByModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

function RootApplication() {
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return <JotaiProvider>
    <Provider store={store}>

      <MantineProvider
        theme={{
          colorScheme: colorScheme,
          globalStyles: (theme) => ({
            body: {
              ...theme.fn.fontStyles(),
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[7]
                  : theme.white,
              color:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[0]
                  : theme.black,
              lineHeight: theme.lineHeight,
              padding: 0,
              margin: 0,
            },
          }),
        }}
      >
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <ModalsProvider modals={modals}>
            <Notifications />
            <AntApp />
          </ModalsProvider>
        </ColorSchemeProvider>
      </MantineProvider>
    </Provider>
  </JotaiProvider>
}

createRoot(document.getElementById('root')).render(
  <RootApplication />
);

export * from './WebGL';
