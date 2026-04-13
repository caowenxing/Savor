# 后端端口冲突与启动排查文档

## 问题描述
启动后端时，出现以下错误：

```
Error: listen EADDRINUSE: address already in use :::3000
```

这表示端口 `3000` 已经被占用，后端服务无法在该端口上启动。

## 发生原因
- 后端已经有一个 `node` 进程正在监听 `3000` 端口
- 你再次执行 `npm run dev` 时，会尝试重复绑定端口
- 这时会报 `EADDRINUSE` 错误并立即退出

## 解决步骤

### 1. 检查端口占用
在后端目录中运行：

```powershell
netstat -ano | findstr :3000
```

如果输出包含 `LISTENING`，说明端口被占用。

### 2. 找到占用进程
记住输出中的 PID（最后一列），例如：

```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       14508
```

这里 `14508` 就是占用端口的进程 ID。

### 3. 结束占用进程
使用以下命令结束该进程：

```powershell
taskkill /PID 14508 /F
```

### 4. 确认端口已释放
再次运行：

```powershell
netstat -ano | findstr :3000
```

如果没有输出，则表示端口已经释放。

### 5. 从后端目录重新启动后端

```powershell
cd C:\Users\32911\Desktop\Savor\backend
npm run dev
```

如果启动成功，你应该看到：

```
Database connection established successfully
🚀 Savor backend server running on http://localhost:3000
```

## 备用方案：更换后端端口
如果你不想处理端口冲突，也可以直接把后端改成其他端口，例如 `3001`。

1. 修改 `backend/.env`：

```env
PORT=3001
```

2. 修改前端 API 地址：

在 `frontend/src/api.ts` 中把默认地址改成：

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

3. 重新启动后端和前端。

## 其他说明
- 后端只需启动一个进程，不要重复在同一个目录中连续执行 `npm run dev`
- 前端可以单独运行在 `http://localhost:5173`
- 后端运行正常后，前端页面才可正常访问后端 API

## 结论
此问题不是前端错误，而是后端端口冲突。通过结束占用端口的进程或更改后端端口，可以解决 `EADDRINUSE` 错误并正常启动后端。