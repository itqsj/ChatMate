import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from '@renderer/App';
import { store } from '@renderer/store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);

// calling IPC exposed from preload script
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log('1111111render层', arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
