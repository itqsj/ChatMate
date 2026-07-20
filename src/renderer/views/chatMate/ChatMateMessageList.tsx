import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@renderer/store/hooks';
import {
  selectCodeMateMessages,
  selectCodeMateSelectedChat,
} from '@renderer/store/codeMateSlice';
import ChatMateMessageItem from '@renderer/views/chatMate/ChatMateMessageItem';

/**
 * 展示当前聊天标题和消息流。
 */
export default function ChatMateMessageList() {
  const messages = useAppSelector(selectCodeMateMessages);
  const selectedChat = useAppSelector(selectCodeMateSelectedChat);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          bgcolor: 'transparent',
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 0.75,
          minHeight: 42,
          px: 2,
        })}
      >
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }}>
          {selectedChat?.title || '新聊天'}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
        <Stack spacing={1.25} sx={{ mx: 'auto', maxWidth: 860 }}>
          {messages.length === 0 ? (
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 12,
              })}
            >
              暂无消息
            </Typography>
          ) : (
            messages.map((message) => (
              <ChatMateMessageItem key={message.id} message={message} />
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}
