import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AntApp } from './AntApp';
import { ColorByModal } from './Modals/ColorByModal';
import { TSNEModal } from './Modals/tSNEModal';
import { store } from './Store/Store';
import { SpaghettiModal } from './Modals/SpaghettiModal';
import '@mantine/core/styles.css'
import './globals.module.css';
import { UMAPModal } from './Modals/UMAPModal';
import { MuRegexModal } from './Modals/MuRegexModal';

// document.addEventListener('contextmenu', event => event.preventDefault());

const modals = {
  demonstration: TSNEModal,
  colorby: ColorByModal,
  spaghetti: SpaghettiModal,
  umap: UMAPModal,
  muregex: MuRegexModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

function RootApplication() {
  const [colorScheme, setColorScheme] = React.useState('light');
  const toggleColorScheme = (value?) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return <Provider store={store}>
    <MantineProvider>
      <ModalsProvider modals={modals}>
        <Notifications />
        <AntApp />
      </ModalsProvider>
    </MantineProvider>
  </Provider>
}

createRoot(document.getElementById('root')).render(
  <RootApplication />
);

export * from './WebGL';
