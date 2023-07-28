import { Notifications } from '@mantine/notifications';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Provider as JotaiProvider } from 'jotai';
import { AntApp, AntApp2 } from './AntApp';
import { store } from './Store/Store';
import { ModalsProvider } from '@mantine/modals';
import { MantineProvider } from '@mantine/core';
import { TSNEModal } from './Modals/tSNEModal';
import { GroupByModal } from './Modals/GroupByModal';
import { ColorByModal } from './Modals/ColorByModal';

const modals = {
  demonstration: TSNEModal,
  grouping: GroupByModal,
  colorby: ColorByModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

createRoot(document.getElementById('root')).render(
  <JotaiProvider>
    <Provider store={store}>
      <MantineProvider
        theme={{
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
        <ModalsProvider modals={modals}>
          <Notifications />
          <AntApp />
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  </JotaiProvider>
);

export * from './WebGL';
