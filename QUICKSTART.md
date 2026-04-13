# 🚀 快速启动指南

## 本地开发环境快速搭建

### 第一步：环境检查

```bash
# 检查 Node.js 版本（需要 18+）
node --version

# 检查 npm 版本
npm --version

# 检查 PostgreSQL 版本（需要 14+）
psql --version
```

### 第二步：数据库初始化

```bash
# 创建数据库
createdb savor_db

# 使用默认用户（假设是 postgres）和密码连接
# 如果需要指定用户和密码，使用：
# createdb -U username -h localhost savor_db

# 导入表结构
psql savor_db < database/schema.sql

# 导入示例数据（可选）
psql savor_db < database/seed.sql
```

### 第三步：后端启动

```bash
cd backend

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，设置数据库连接参数
# 例如：
# DATABASE_URL=postgresql://postgres:password@localhost:5432/savor_db
# PORT=3000
# NODE_ENV=development

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**后端运行地址**：http://localhost:3000
输出应该显示：`🚀 Savor backend server running on http://localhost:3000`

### 第四步：前端启动

新建一个终端窗口：

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**前端运行地址**：http://localhost:5173

## 验证安装

1. **数据库检查**
   ```bash
   psql savor_db
   \dt
   # 应该显示所有表：users, saved_contents, content_tags, behavior_tags, interest_tags, wakeup_records
   ```

2. **后端检查**
   访问 http://localhost:3000/api/health
   应该返回：`{"status":"ok","timestamp":"..."}`

3. **前端检查**
   访问 http://localhost:5173
   应该看到 Savor 应用界面

## 测试功能

### 1. 导入收藏
- 点击"➕ 添加收藏"标签页
- 输入一个链接（例如：https://douyin.com/video/123）
- 点击"导入收藏"

### 2. 查看收藏
- 点击"📚 我的收藏"标签页
- 应该看到导入的内容卡片

### 3. 标签管理
- 在内容卡片上点击"标签"按钮
- 可以查看和确认生成的标签

### 4. 推荐功能
- 点击"✨ 为你推荐"标签页
- 查看基于用户兴趣的推荐内容
- 点击"🎯 立即唤醒"触发收藏唤醒机制

## 故障排查

### PostgreSQL 连接失败
```bash
# 检查 PostgreSQL 是否运行
psql --version

# 尝试连接
psql -U postgres -h localhost savor_db

# 如果失败，检查 PostgreSQL 服务状态（Windows）
Get-Service postgresql*

# 或 macOS
brew services list | grep postgres

# 或 Linux
sudo systemctl status postgresql
```

### 后端无法启动
```bash
# 检查端口 3000 是否被占用
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000

# 查看详细错误日志
npm run dev
```

### 前端无法连接后端
检查 `frontend/src/api.ts` 中的 API_BASE_URL 是否正确指向后端地址

### 数据库表不存在
```bash
# 检查数据库中的表
psql savor_db -c "\dt"

# 重新导入 schema
psql savor_db < database/schema.sql
```

## 开发工作流

### 修改后端代码
后端使用 TypeScript 并通过 ts-node 自动编译和重启，修改代码后会自动重新加载。

### 修改前端代码
前端使用 Vite，支持热模块替换（HMR），修改代码后浏览器自动刷新。

### 修改数据库 Schema
1. 修改 `database/schema.sql`
2. 删除并重建数据库：
   ```bash
   dropdb savor_db
   createdb savor_db
   psql savor_db < database/schema.sql
   ```

## 打包部署

### 后端构建
```bash
cd backend
npm run build
# 生成 dist 文件夹
npm start
```

### 前端构建
```bash
cd frontend
npm run build
# 生成 dist 文件夹（可用于静态部署）
npm run preview  # 本地预览构建结果
```

## 环境变量配置

### 后端 (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/savor_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=savor_db
DB_USER=user
DB_PASSWORD=password
PORT=3000
NODE_ENV=development
```

### 前端 (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 性能测试

### 后端 API 性能
```bash
# 使用 curl 测试
curl http://localhost:3000/api/health

# 或使用 Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/health
```

## 更多帮助

查看 [README.md](./README.md) 了解完整文档。
