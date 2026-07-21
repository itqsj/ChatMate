import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { COLOR_MODE } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import { toggleColorMode } from '@renderer/store/themeSlice';
import { selectThemeMode } from '@renderer/store/selectors';
import icon from '@/assets/icon.svg';

/**
 * 首页组件，负责展示应用入口内容和主题切换按钮。
 */
export default function Home() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);

  return (
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        background: theme.palette.background.default,
        color: 'text.primary',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 3,
        textAlign: 'center',
      })}
    >
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => dispatch(toggleColorMode())}
          >
            {mode === COLOR_MODE.DARK ? 'Light mode' : 'Dark mode'}
          </Button>
        </Stack>
        <div className="Hello">
          <img width="200" alt="icon" src={icon} />
        </div>
        <Typography component="h1" variant="h3" sx={{ fontWeight: 700 }}>
          electron-react-boilerplate
        </Typography>
        <div className="Hello">
          <Button
            variant="contained"
            rel="noreferrer"
            style={{ marginRight: '10px' }}
            startIcon={
              <span role="img" aria-label="books">
                📚
              </span>
            }
          >
            Read our docs
          </Button>
          <Button
            variant="contained"
            color="secondary"
            rel="noreferrer"
            startIcon={
              <span role="img" aria-label="folded hands">
                🙏
              </span>
            }
          >
            Donate
          </Button>
        </div>
      </Box>
    </Box>
  );
}
