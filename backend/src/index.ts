import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './db';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
initializeDatabase().catch(console.error);

// API路由
app.use('/api', apiRoutes);

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Savor backend server running on http://localhost:${PORT}`);
});

export default app;
