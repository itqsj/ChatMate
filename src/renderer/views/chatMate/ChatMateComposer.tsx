import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { selectCodeMateActiveWorkspace } from '@renderer/store/codeMateSlice';
import { useAppSelector } from '@renderer/store/hooks';

/**
 * 渲染底部输入区，输入框在上，操作区放在输入框下方。
 */
export default function ChatMateComposer() {
  const activeWorkspace = useAppSelector(selectCodeMateActiveWorkspace);

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        px: 2,
        py: 1,
      })}
    >
      <Box
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          mx: 'auto',
          maxWidth: 860,
          overflow: 'hidden',
          p: 0.75,
        })}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          placeholder="描述你要完成的任务..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              fontSize: 12,
              py: 0,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
        />

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 0.75,
            justifyContent: 'space-between',
            pt: 0.4,
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="上传文件"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                height: 24,
                width: 24,
              })}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  fontSize: 13,
                  lineHeight: 1,
                  transform: 'translateY(-1px)',
                }}
              >
                📎
              </Box>
            </IconButton>
            <Chip
              label={`当前工作区: ${activeWorkspace.name}`}
              size="small"
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.light,
                fontSize: 10,
                height: 20,
              })}
            />
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 10,
              })}
            >
              已绑定项目上下文
            </Typography>
          </Stack>

          <Button
            sx={{ fontSize: 12, minHeight: 28, px: 1.5 }}
            variant="contained"
          >
            发送
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
