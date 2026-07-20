import { COLOR_MODE } from '../constants/theme';
import {
  createAppTheme,
  DARK_BACKGROUND,
  LIGHT_BACKGROUND,
} from '../renderer/theme';

describe('theme', () => {
  it('should use gradient backgrounds from theme', () => {
    expect(createAppTheme(COLOR_MODE.DARK).palette.background.default).toBe(
      DARK_BACKGROUND,
    );
    expect(createAppTheme(COLOR_MODE.LIGHT).palette.background.default).toBe(
      LIGHT_BACKGROUND,
    );
  });
});
