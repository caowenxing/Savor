# Savor API 参考

## 基础信息

- **基础 URL**: `http://localhost:3000/api`
- **响应格式**: JSON

## 健康检查

### 获取服务器状态

```http
GET /api/health
```

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": "2024-04-13T10:30:00.000Z"
}
```

---

## 内容 API

### 导入收藏

```http
POST /api/contents/import
```

**请求体**：
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://douyin.com/video/12345",
  "title": "可选的自定义标题"
}
```

**响应**（201 Created）：
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "英语学习技巧",
    "url": "https://douyin.com/video/12345",
    "source": "douyin",
    "view_count": 0,
    "is_viewed": false,
    "created_at": "2024-04-13T10:30:00.000Z"
  }
}
```

#### 错误响应

- `400`: 缺少必需字段（userId、url）
- `409`: URL 已存在于用户收藏中
- `500`: 服务器错误

---

### 获取用户收藏列表

```http
GET /api/contents?userId=xxx&limit=20&offset=0
```

**查询参数**：
- `userId` (required): 用户 ID
- `limit` (optional): 每页数量，默认 20
- `offset` (optional): 偏移量，默认 0

**响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "英语学习技巧",
      "url": "https://douyin.com/video/12345",
      "source": "douyin",
      "view_count": 1,
      "is_viewed": true,
      "created_at": "2024-04-13T10:30:00.000Z",
      "last_viewed_at": "2024-04-13T10:35:00.000Z"
    }
  ]
}
```

---

### 获取内容详情

```http
GET /api/contents/:contentId
```

**路径参数**：
- `contentId`: 内容 ID

**响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "英语学习技巧",
    "url": "https://douyin.com/video/12345",
    "source": "douyin",
    "description": "分享英语学习的高效方法",
    "view_count": 2,
    "is_viewed": true,
    "created_at": "2024-04-13T10:30:00.000Z",
    "last_viewed_at": "2024-04-13T11:00:00.000Z"
  }
}
```

---

### 标记内容为已查看

```http
PATCH /api/contents/:contentId/view
```

**路径参数**：
- `contentId`: 内容 ID

**响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "is_viewed": true,
    "view_count": 2,
    "last_viewed_at": "2024-04-13T11:05:00.000Z"
  }
}
```

---

### 删除收藏

```http
DELETE /api/contents/:contentId?userId=xxx
```

**路径参数**：
- `contentId`: 内容 ID

**查询参数**：
- `userId` (required): 用户 ID（用于权限验证）

**响应**（200 OK）：
```json
{
  "success": true
}
```

**错误响应**：
- `404`: 内容不存在或无权限

---

## 标签 API

### 获取内容的标签

```http
GET /api/contents/:contentId/tags
```

**响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "760e8400-e29b-41d4-a716-446655440000",
      "content_id": "660e8400-e29b-41d4-a716-446655440000",
      "tag_name": "英语",
      "tag_type": "auto",
      "confidence": 0.95,
      "created_at": "2024-04-13T10:30:00.000Z"
    },
    {
      "id": "760e8400-e29b-41d4-a716-446655440001",
      "content_id": "660e8400-e29b-41d4-a716-446655440000",
      "tag_name": "学习",
      "tag_type": "auto",
      "confidence": 0.90,
      "created_at": "2024-04-13T10:30:00.000Z"
    }
  ]
}
```

---

### 确认内容标签

```http
POST /api/contents/:contentId/tags/confirm
```

**请求体**：
```json
{
  "tagName": "英语学习"
}
```

**响应**（201 Created）：
```json
{
  "success": true,
  "data": {
    "id": "760e8400-e29b-41d4-a716-446655440002",
    "content_id": "660e8400-e29b-41d4-a716-446655440000",
    "tag_name": "英语学习",
    "tag_type": "user_confirmed",
    "confidence": 1.0,
    "created_at": "2024-04-13T10:35:00.000Z"
  }
}
```

---

### 获取用户兴趣标签

```http
GET /api/users/:userId/interest-tags
```

**路径参数**：
- `userId`: 用户 ID

**响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_name": "英语",
      "confidence": 0.95,
      "last_triggered_at": "2024-04-13T10:40:00.000Z",
      "created_at": "2024-04-13T10:30:00.000Z"
    },
    {
      "id": "850e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_name": "学习",
      "confidence": 0.90,
      "created_at": "2024-04-13T10:30:00.000Z"
    }
  ]
}
```

---

### 更新用户兴趣标签

```http
POST /api/users/:userId/interest-tags/update
```

**路径参数**：
- `userId`: 用户 ID

**响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "tag_name": "英语",
      "confidence": 0.98,
      "last_triggered_at": "2024-04-13T11:00:00.000Z",
      "created_at": "2024-04-13T10:30:00.000Z"
    }
  ]
}
```

---

## 推荐系统 API

### 获取推荐内容

```http
GET /api/recommendations?userId=xxx&limit=20
```

**查询参数**：
- `userId` (required): 用户 ID
- `limit` (optional): 推荐数量，默认 20

**响应**（200 OK）：
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "坚持打卡100天的秘诀",
      "url": "https://xiaohongshu.com/note/12345",
      "source": "xiaohongshu",
      "view_count": 0,
      "is_viewed": false,
      "created_at": "2024-04-08T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "英语学习技巧",
      "url": "https://douyin.com/video/12345",
      "source": "douyin",
      "view_count": 1,
      "is_viewed": true,
      "created_at": "2024-04-13T10:30:00.000Z"
    }
  ]
}
```

---

### 触发每日唤醒机制

```http
POST /api/wakeup/daily
```

**请求体**：
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**响应**（200 OK）：
```json
{
  "success": true,
  "data": {
    "wakeup_count": 3,
    "content_ids": [
      "660e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001",
      "660e8400-e29b-41d4-a716-446655440002"
    ]
  }
}
```

---

## 错误处理

所有错误响应使用统一格式：

```json
{
  "error": "错误消息"
}
```

### 常见 HTTP 状态码

| 状态码 | 含义 | 场景 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复URL） |
| 500 | Internal Server Error | 服务器错误 |

---

## 示例客户端代码

### JavaScript (Fetch API)

```javascript
// 导入收藏
const response = await fetch('http://localhost:3000/api/contents/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://douyin.com/video/12345',
    title: '英语学习技巧'
  })
});
const data = await response.json();
console.log(data);
```

### Python (Requests)

```python
import requests

# 获取推荐
response = requests.get(
  'http://localhost:3000/api/recommendations',
  params={'userId': '550e8400-e29b-41d4-a716-446655440000', 'limit': 20}
)
print(response.json())
```

---

## 速率限制

当前 MVP 版本暂无速率限制。生产环境建议添加。

## 认证

当前 MVP 版本不包含认证机制。生产环境建议添加 JWT 或 OAuth2。
