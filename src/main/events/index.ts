import registerChatDBEvents from '@/main/events/chatDB';

/**
 * 注册 Electron 主进程事件，按模块拆分到 events 目录下的独立文件。
 */
const registerEvents = () => {
  registerChatDBEvents();
};

export default registerEvents;
