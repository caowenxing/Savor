# 前端 500 错误排查文档

## 目标
当前端页面出现 `Request failed with status code 500` 时，说明浏览器成功到达后端，但后端内部发生错误。此文档用于逐步定位问题。

## 1. 确认后端服务是否已启动

在前端浏览器控制台出现 500 错误之前，需要先确认后端是否真正运行。

### 操作步骤

1. 打开一个新的终端窗口。
2. 进入后端目录：
   ```bash
   cd c:\Users\32911\Desktop\Savor\backend
   ```
3. 启动后端：
   ```bash
   npm run dev
   ```
4. 如果有错误，先修复后端启动报错。

### 验证方式

打开浏览器访问：

```text
http://localhost:3000/api/health
```

如果返回：

```json
{"status":"ok","timestamp":"..."}
```

说明后端已启动。

## 2. 确认前端调用地址是否正确

前端使用 Vite 时，环境变量应通过 `import.meta.env` 读取。

### 检查位置

- `frontend/src/api.ts`

### 正确方式

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

如果你没有配置 `.env` 文件，默认地址也能工作。

## 3. 检查请求是否真的到达后端

### 方法 1：查看浏览器控制台的 network 请求

- 找到出错的请求
- 观察请求 URL 是否以 `http://localhost:3000/api` 开头
- 观察响应内容是否有后端报错信息

### 方法 2：查看浏览器控制台中的 JavaScript 错误

- 如果页面白屏或 UI 不显示，说明前端代码运行发生异常
- 常见错误包括：
  - `Cannot read properties of undefined` 或 `Cannot read property 'length'`
  - 这类错误通常说明前端组件的数据结构不完整
- 这种情况下，先看 `Console` 的错误行号，再检查对应组件代码

### 方法 3：直接在后端终端查看日志

- 如果后端终端打印了错误信息，说明后端已经收到请求并产生了异常
- 例如：
  - `authentication failed for user "user"`
  - `relation "saved_contents" does not exist`
  - `TypeError: ...`

## 4. 常见 500 错误原因

### 4.0 页面白屏或组件崩溃

如果前端页面直接白屏或报错 `Cannot read properties of undefined`，说明前端组件接收的数据结构不完整，例如 `tags`、`title` 或 `created_at` 没有正常传递。

这类问题的排查步骤：

1. 查看 `Console` 错误信息，确认出错组件和行号
2. 检查对应组件是否准备了默认值，例如 `tags = []`
3. 检查接口返回的数据是否包含所需字段
4. 先修复前端组件的空值保护，再重新刷新页面

### 4.1 链接保存后打不开

如果你看到“收藏成功”，但在“我的收藏”里点开后无法跳转，通常是因为导入时输入的内容并不是一个有效 URL，而是标题或其他文本。

### 排查步骤

1. 检查“链接地址”字段里是否是完整的 `http://...` 或 `https://...`
2. 如果是普通文本或标题，系统会保存错误链接，点击后无法打开正确页面
3. 请把真实网页链接粘贴到“链接地址”中，再在“自定义标题”里填写说明性标题

### 修复措施

- 已在 `frontend/src/components/AddTab.tsx` 中增加 URL 校验，防止将奇怪标题保存为链接
- 已在 `frontend/src/components/ContentCard.tsx` 中增加 URL 格式补全，支持没有协议的链接
### 修复已保存的收藏

如果你已经保存了错误的条目，可以：

1. 在“我的收藏”页面找到该条目
2. 点击“编辑”按钮
3. 在弹出的输入框中修正标题和链接地址
4. 点击“保存”按钮
### 4.2 数据库连接失败

如果后端报错类似：

```text
user "user" password authentication failed
```

说明 `backend/.env` 中数据库连接字符串不正确。需修改为你本机 PostgreSQL 的用户名和密码，例如：

```env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/savor_db
```

### 4.2 SQL 查询语法或参数错误

请求能到达后端，但后端内部执行 SQL 时出错，这类错误通常会在后端终端中打印出来。

### 4.3 后端路由或接口逻辑问题

如果请求 URL 或参数错误，后端可能返回 400/404/500。检查前端发出的请求是否包含必要字段。

## 5. 重点检查导入收藏接口

当前你的页面出错位置在“导入收藏”操作。

### 请求方式

- 接口：`POST /api/contents/import`
- 参数：
  - `userId`
  - `url`
  - `title`

### 排查顺序

1. 确认 `userId`、`url` 是否存在
2. 确认后端 `/api/contents/import` 路径是否可用
3. 确认后端数据库是否连通
4. 阅读后端终端错误信息

## 6. 建议的排查流程

1. 打开两个终端：一个前端，一个后端
2. 先启动后端，确认 `http://localhost:3000/api/health` 正常
3. 再启动前端，打开页面进行操作
4. 如果出现 500：
   - 先看浏览器 Network 输出
   - 再看后端终端日志

## 7. 进一步定位

如果你看到后端终端报错，请把完整错误信息复制出来；如果报错是数据库授权、本地表缺失、字段错误等，我可以帮你继续修复。
