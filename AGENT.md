1. 项目文件目录如下：

electron-react-boilerplate/
├─ src/
│  ├─ main/
│  │  ├─ main.ts                    # Electron app 主进程入口，创建 BrowserWindow，注册 ipcMain，管理窗口生命周期
│  │  ├─ preload.ts                 # preload 桥接层，通过 contextBridge 暴露 renderer 可调用的安全 API
│  │  ├─ menu.ts                    # 应用菜单、右键菜单、开发者工具菜单等窗口菜单逻辑
│  │  └─ util.ts                    # 主进程工具方法，例如 HTML 文件路径解析
│  ├─ renderer/
│  │  ├─ index.tsx                  # React 渲染入口，挂载 Redux Provider、App，并调用 preload 暴露的 window.electron
│  │  ├─ App.tsx                    # React 应用根组件，承载 MUI ThemeProvider、路由和系统主题监听
│  │  ├─ Home.tsx                   # 首页组件，从 Redux 读取主题状态并触发主题切换
│  │  ├─ theme.ts                   # renderer 层 MUI 主题创建、系统主题识别、localStorage 读写工具
│  │  ├─ App.css                    # renderer 层页面样式
│  │  ├─ index.ejs                  # renderer HTML 模板
│  │  ├─ preload.d.ts               # window.electron 的 TypeScript 类型声明
│  │  └─ store/
│  │     ├─ index.ts                # Redux store 创建入口，注册 reducer 和主题持久化 listener
│  │     ├─ hooks.ts                # 类型安全的 useAppDispatch / useAppSelector
│  │     └─ themeSlice.ts           # 主题状态 slice，维护 mode、setColorMode、toggleColorMode
│  ├─ constants/
│  │  └─ theme.ts                   # 主题公共常量
│  └─ __tests__/
│     ├─ App.test.tsx               # renderer 应用渲染、主题切换和持久化测试
│     └─ theme.test.ts              # MUI 主题背景配置测试
├─ .erb/
│  ├─ configs/                      # Webpack 配置，区分 main、preload、renderer 构建
│  ├─ scripts/                      # 构建、端口检查、清理、原生依赖检查等脚本
│  ├─ dll/                          # 开发环境构建产物和 preload 开发产物
│  ├─ mocks/                        # Jest 静态资源 mock
│  └─ img/                          # boilerplate 文档图片资源
├─ assets/                          # 应用图标、mac 授权文件等打包资源
├─ release/                         # electron-builder 应用目录和打包输出目录
├─ node_modules/                    # 依赖安装目录
├─ package.json                     # scripts、依赖、electron-builder、Jest 等项目配置
├─ tsconfig.json                    # TypeScript 配置
└─ README.md                        # Electron React Boilerplate 项目说明

2. 当前项目技术栈：
   - Electron：桌面应用运行容器，主进程负责窗口、菜单、系统能力和 IPC。
   - React：renderer 层 UI 框架。
   - TypeScript：main、preload、renderer 统一使用 TS/TSX。
   - React Router：renderer 层页面路由。
   - Material UI：renderer 层 UI 组件库和主题系统。
   - Redux Toolkit / React Redux：renderer 层全局状态管理，目前管理主题 mode。
   - Webpack：main、preload、renderer 构建工具。
   - Jest / Testing Library：组件和主题逻辑测试。
   - electron-builder：应用打包工具。

3. 本项目分为三层：
   - `src/main/` 是 Electron app 主进程层，负责窗口、菜单、系统能力、IPC 主进程监听。
   - `src/main/preload.ts` 是安全桥接层，负责把允许 renderer 调用的方法挂到 `window.electron`。
   - `src/renderer/` 是 React 页面层，只写页面渲染、交互和调用 preload 暴露的能力。

4. renderer 层和 app 层通信必须通过 preload 暴露的 API：
   - renderer 调用：`window.electron.xxx`
   - preload 转发：`contextBridge.exposeInMainWorld(...)`、`ipcRenderer.send(...)`、`ipcRenderer.invoke(...)`
   - main 接收：`ipcMain.on(...)`、`ipcMain.handle(...)`
   - 不要在 renderer 组件里直接引入 Electron 主进程模块。

5. IPC channel 必须先在 `src/main/preload.ts` 的 `Channels` 类型中声明，再在 main 层注册对应处理逻辑。

6. 新增 Electron 能力时，优先按下面位置放置：
   - renderer 调用入口：`src/main/preload.ts`
   - renderer 类型声明：`src/renderer/preload.d.ts`
   - main 层处理逻辑：简单逻辑可放 `src/main/main.ts`，复杂逻辑再拆到 `src/main/` 下独立文件
   - 页面调用逻辑：放在 `src/renderer/` 对应页面或组件中

7. 组件超过 600 行时，需提供拆分评估与优化方案。
8. 业务常量、枚举、状态码必须统一放到 `src/constants/`。
9. 所有 API 请求必须统一放到 `src/renderer/api/`，禁止在组件中直接写请求逻辑。
10. 可复用的业务逻辑必须抽离到 `src/renderer/hooks/`，避免在多个组件中重复实现。
11. 请先读取 src/renderer/api、src/constants、src/renderer/hooks,避免重复造轮子。
12. 修改完成后，必须对本次更改的文件执行格式化。
13. 修改完成后，必须运行：npm run build，确保无页面报错。
14. 代码实现必须简单直白，优先复用现有代码，不做无意义封装。
15. async/await 必须 try...catch，并给用户反馈。
