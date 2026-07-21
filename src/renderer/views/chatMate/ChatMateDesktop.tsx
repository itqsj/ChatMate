import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import ChatMateComposer from '@renderer/views/chatMate/ChatMateComposer';
import ChatMateMessageList from '@renderer/views/chatMate/ChatMateMessageList';
import ChatMateSidebar from '@renderer/views/chatMate/sidebar/ChatMateSidebar';
import ChatMateWindowBar from '@renderer/views/chatMate/ChatMateWindowBar';

/**
 * ChatMate 页面大容器，只负责整体布局组合。
 */
export default function ChatMateDesktop() {
  return (
    <Box
      sx={(theme) => ({
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: 'grid',
        gridTemplateColumns: '260px minmax(0, 1fr)',
        gridTemplateRows: '34px minmax(0, 1fr)',
        height: '100vh',
        overflow: 'hidden',
      })}
    >
      <ChatMateWindowBar />
      <ChatMateSidebar />

      <Box
        component="main"
        sx={(theme) => ({
          backdropFilter: 'blur(20px)',
          bgcolor: alpha(theme.palette.background.paper, 0.18),
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        })}
      >
        <ChatMateMessageList />
        <ChatMateComposer />
      </Box>
    </Box>
  );
}
