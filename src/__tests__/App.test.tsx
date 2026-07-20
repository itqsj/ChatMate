import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { COLOR_MODE, COLOR_MODE_STORAGE_KEY } from '../constants/theme';
import App from '../renderer/App';
import { createAppStore } from '../renderer/store';

describe('App', () => {
  const originalMatchMedia = window.matchMedia;

  const renderApp = () => {
    return render(
      <Provider store={createAppStore()}>
        <App />
      </Provider>,
    );
  };

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should render', () => {
    expect(renderApp()).toBeTruthy();
  });

  it('should save color mode when toggled', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /dark mode/i }));

    expect(screen.getByRole('button', { name: /light mode/i })).toBeTruthy();
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe(COLOR_MODE.DARK);
  });

  it('should use system color mode when no saved mode exists', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        addEventListener: jest.fn(),
        matches: true,
        media: query,
        removeEventListener: jest.fn(),
      })),
    });

    renderApp();

    expect(screen.getByRole('button', { name: /light mode/i })).toBeTruthy();
  });

  it('should prefer saved color mode on startup', () => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, COLOR_MODE.DARK);

    renderApp();

    expect(screen.getByRole('button', { name: /light mode/i })).toBeTruthy();
  });
});
