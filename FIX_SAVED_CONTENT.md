# 修复已保存收藏的链接

## 问题描述
如果你之前保存的收藏点不开，可能是因为链接字段保存了错误的格式。

## 手动修复方法

1. 打开前端页面，进入“我的收藏”
2. 找到有问题的收藏条目
3. 点击“编辑”按钮
4. 在标题和链接输入框中修正内容
5. 点击“保存”

## 批量修复脚本（可选）

如果你有很多条目需要修复，可以运行以下脚本：

```bash
# 进入后端目录
cd C:\Users\32911\Desktop\Savor\backend

# 运行修复脚本
node -e "
const postgres = require('postgres');
const sql = postgres('postgresql://postgres:caowenxing@localhost:5432/savor_db');

// 修复函数：从描述中提取真实URL
async function fixUrls() {
  const contents = await sql\`SELECT id, title, url, description FROM saved_contents WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'\`;

  for (const content of contents) {
    // 如果URL看起来像标题+链接混合，尝试提取真实URL
    if (content.url.includes('https://') && content.url.length > 100) {
      const urlMatch = content.url.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        const realUrl = urlMatch[1];
        const realTitle = content.title || content.url.split(' ')[0] || '修复的收藏';

        console.log(\`修复: \${content.id} -> \${realUrl}\`);

        await sql\`UPDATE saved_contents SET title = \${realTitle}, url = \${realUrl} WHERE id = \${content.id}\`;
      }
    }
  }

  console.log('修复完成');
  process.exit(0);
}

fixUrls().catch(console.error);
"
```

## 运行脚本后

1. 重启前端页面
2. 刷新“我的收藏”页面
3. 再次点击收藏条目，应该能正常跳转

## 注意事项

- 脚本会自动从混合文本中提取第一个 `https://` 开头的链接
- 如果提取失败，可以手动编辑
- 建议先备份数据库再运行脚本