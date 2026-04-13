# 🍰 Savor - 内容再发现平台

> 让收藏成为持续的价值

## 产品概述

**Savor** 是一个基于用户收藏行为的内容再发现平台，帮助用户重新利用已收藏但未被消费的内容。

### 核心价值
- 将"收藏行为"转化为"可持续利用资产"
- 构建用户兴趣模型
- 提升内容复用效率

## 项目结构

```
Savor/
├── backend/               # Node.js + Express 后端
│   ├── src/
│   │   ├── index.ts       # 主应用入口
│   │   ├── db.ts          # 数据库连接
│   │   ├── types.ts       # 类型定义
│   │   ├── services/      # 业务逻辑服务
│   │   │   ├── contentService.ts     # 内容管理
│   │   │   ├── tagService.ts         # 标签系统
│   │   │   └── recommendationService.ts  # 推荐系统
│   │   └── routes/
│   │       └── api.ts     # API 路由
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/              # React + TypeScript 前端
│   ├── src/
│   │   ├── main.tsx       # 入口文件
│   │   ├── App.tsx        # 主应用
│   │   ├── api.ts         # API 调用
│   │   ├── components/    # React 组件
│   │   │   ├── AddTab.tsx          # 添加收藏
│   │   │   ├── ContentCard.tsx     # 内容卡片
│   │   │   ├── ContentGrid.tsx     # 瀑布流
│   │   │   ├── TagConfirmation.tsx # 标签确认
│   │   │   └── RecommendationTab.tsx  # 推荐页
│   │   └── styles/        # CSS 样式
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── database/              # 数据库 Schema
│   ├── schema.sql         # 表结构定义
│   └── seed.sql           # 测试数据
│
└── README.md              # 项目文档
```

## 核心功能

### 1. 收藏导入
- 用户粘贴链接导入内容（支持抖音、小红书、B站等）
- 系统自动解析内容信息
- 自动生成内容标签

### 2. 首页瀑布流
- 卡片式内容展示
- 瀑布流布局（Pinterest风格）
- 支持标记已查看、删除、添加标签

### 3. 三层标签体系
#### ① 内容标签（自动 + 辅助）
- 从标题/描述自动提取关键词
- 用户可手动确认或添加新标签

#### ② 行为标签（系统生成）
- 停留时间
- 点击频率
- 回看次数

#### ③ 兴趣标签（系统抽象）
- 系统自动聚合用户兴趣（如"英语学习"、"健身"、"自律"）

### 4. 推荐系统（核心）
```
推荐权重 = 短期兴趣权重(30%) + 长期价值权重(40%) + 时间衰减反向权重(30%)
```

#### 短期兴趣强化（Recent Boost）
- 触发条件：用户近期收藏内容
- 行为：推送同标签内容

#### 长期内容唤醒（Recall）
- 触发条件：收藏后长时间未访问（> 3天）
- 行为：重新推荐值得再看的内容

### 5. 收藏唤醒机制
- 每日推送"你3天前收藏的内容，值得再看"
- 自动挖掘高价值内容

## 技术栈

### 后端
- **运行时**：Node.js 18+
- **框架**：Express 4
- **语言**：TypeScript
- **数据库**：PostgreSQL 14+
- **数据库驱动**：postgres (js)

### 前端
- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite
- **HTTP 客户端**：Axios
- **样式**：CSS3

### 数据库
- **PostgreSQL 14+**
- 表结构已定义在 `database/schema.sql`

## 安装指南

### 前置要求
- Node.js 18 或更高版本
- PostgreSQL 14 或更高版本
- npm 或 yarn

### 1. 数据库设置

```bash
# 创建数据库
createdb savor_db

# 导入 schema
psql savor_db < database/schema.sql

# （可选）导入示例数据
psql savor_db < database/seed.sql
```

### 2. 后端设置

```bash
cd backend

# 复制环境配置
cp .env.example .env

# 编辑 .env 文件，设置数据库连接信息
# DATABASE_URL=postgresql://user:password@localhost:5432/savor_db

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm start
```

后端服务器运行在 `http://localhost:3000`

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
```

前端应用运行在 `http://localhost:5173`

## API 文档

### 内容相关

#### 导入收藏
```
POST /api/contents/import
Body: { userId, url, title? }
```

#### 获取收藏列表
```
GET /api/contents?userId=xxx&limit=20&offset=0
```

#### 标记为已查看
```
PATCH /api/contents/:contentId/view
```

#### 删除收藏
```
DELETE /api/contents/:contentId?userId=xxx
```

### 标签相关

#### 获取内容标签
```
GET /api/contents/:contentId/tags
```

#### 确认标签
```
POST /api/contents/:contentId/tags/confirm
Body: { tagName }
```

#### 获取用户兴趣标签
```
GET /api/users/:userId/interest-tags
```

#### 更新兴趣标签
```
POST /api/users/:userId/interest-tags/update
```

### 推荐相关

#### 获取推荐
```
GET /api/recommendations?userId=xxx&limit=20
```

#### 触发每日唤醒
```
POST /api/wakeup/daily
Body: { userId }
```

## MVP 范围

### ✅ 已实现
- ✓ 链接导入
- ✓ 收藏展示（瀑布流）
- ✓ 简单标签系统
- ✓ 基础推荐（规则版）
- ✓ 收藏唤醒机制
- ✓ 用户兴趣聚合

### ⏳ 后续功能（Phase 2）
- 社交功能
- 评论系统
- AI 标签生成
- 高级推荐算法
- 课程推荐（商业化）

## 数据模型

### 用户表 (users)
```typescript
id: UUID
username: string
email: string
created_at: Date
updated_at: Date
```

### 收藏表 (saved_contents)
```typescript
id: UUID
user_id: UUID (FK)
title: string
url: string (UNIQUE)
source: 'douyin' | 'xiaohongshu' | 'bilibili' | 'other'
description: string?
thumbnail_url: string?
view_count: number
is_viewed: boolean
created_at: Date
last_viewed_at: Date?
```

### 内容标签 (content_tags)
```typescript
id: UUID
content_id: UUID (FK)
tag_name: string
tag_type: 'auto' | 'user_confirmed'
confidence: 0-1
created_at: Date
```

### 行为标签 (behavior_tags)
```typescript
id: UUID
content_id: UUID (FK)
user_id: UUID (FK)
stay_time: number (seconds)
click_count: number
rewatch_count: number
generated_at: Date
```

### 兴趣标签 (interest_tags)
```typescript
id: UUID
user_id: UUID (FK)
tag_name: string
confidence: 0-1
last_triggered_at: Date?
created_at: Date
```

## 开发规范

### 命名规范
- React 组件：PascalCase (如 `ContentCard`)
- 函数/变量：camelCase (如 `getUserContents`)
- 类型/接口：PascalCase (如 `SavedContent`)
- 常量：UPPER_SNAKE_CASE (如 `MAX_DECAY_DAYS`)

### 代码风格
- 使用 TypeScript 进行类型检查
- 使用 async/await 处理异步操作
- 添加适当的注释和文档

## 调试

### 后端
```bash
cd backend
npm run dev
# 开启 TypeScript 编译和自动重启功能
```

### 前端
```bash
cd frontend
npm run dev
# Vite 开发服务器在 localhost:5173
```

## 性能优化建议

1. **前端**
   - 使用虚拟滚动处理大量列表
   - 图片懒加载
   - React.memo 优化组件重渲染

2. **后端**
   - 添加查询缓存
   - 数据库查询优化（已有索引）
   - 推荐算法分页处理

3. **数据库**
   - 定期分析表统计信息
   - 配置定期 VACUUM

## 常见问题

### Q: 如何修改用户ID？
A: 在前端 `src/App.tsx` 中修改默认 userId，或通过 localStorage 设置

### Q: 如何添加新的平台支持？
A: 
1. 修改 `backend/src/types.ts` 中的 source 类型
2. 在 `contentService.ts` 的 `detectSource` 函数中添加检测逻辑
3. 在 API 中对应更新

### Q: 推荐算法如何调优？
A: 修改 `recommendationService.ts` 中的相关常数和权重计算逻辑

## 许可证

MIT

## 联系方式

- GitHub: [Savor Repository]
- 邮箱: contact@savor.app

---

**Savor v1.0 MVP** - 让内容重获新生 🍰
