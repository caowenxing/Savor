const postgres = require('postgres');
const sql = postgres('postgresql://postgres:caowenxing@localhost:5432/savor_db');

async function fixUrls() {
  try {
    const contents = await sql`SELECT id, title, url, description FROM saved_contents WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'`;

    console.log(`找到 ${contents.length} 条收藏记录`);

    for (const content of contents) {
      console.log(`检查: ${content.id} - ${content.title}`);

      // 如果URL看起来像标题+链接混合，尝试提取真实URL
      if (content.url.includes('https://') && content.url.length > 100) {
        const urlMatch = content.url.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const realUrl = urlMatch[1];
          const realTitle = content.title || content.url.split(' ')[0] || '修复的收藏';

          console.log(`修复: ${content.id} -> ${realUrl}`);

          await sql`UPDATE saved_contents SET title = ${realTitle}, url = ${realUrl} WHERE id = ${content.id}`;
        }
      }
    }

    console.log('修复完成');
  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

fixUrls();