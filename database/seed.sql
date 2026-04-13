-- Savor 数据库 - 示例数据
-- 仅用于开发和测试

-- 插入测试用户
INSERT INTO users (id, username, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'john_student', 'john@example.com'),
  ('550e8400-e29b-41d4-a716-446655440001', 'jane_fitness', 'jane@example.com')
ON CONFLICT DO NOTHING;

-- 插入测试收藏内容
INSERT INTO saved_contents (id, user_id, title, url, source, description, is_viewed, created_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '英语学习技巧', 'https://douyin.com/video/12345', 'douyin', '分享英语学习的高效方法', FALSE, NOW() - INTERVAL '10 days'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '坚持打卡100天的秘诀', 'https://xiaohongshu.com/note/12345', 'xiaohongshu', '如何保持长期自律的方法论', FALSE, NOW() - INTERVAL '5 days'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Python数据分析入门', 'https://bilibili.com/video/BV12345', 'bilibili', '学习Python进行数据分析', TRUE, NOW() - INTERVAL '2 days'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '瑜伽基础课程', 'https://douyin.com/video/67890', 'douyin', '初学者瑜伽30天计划', FALSE, NOW() - INTERVAL '8 days'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '健身房新手必看', 'https://xiaohongshu.com/note/67890', 'xiaohongshu', '从零开始的健身指南', FALSE, NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- 插入内容标签（自动提取）
INSERT INTO content_tags (content_id, tag_name, tag_type, confidence) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '英语', 'auto', 0.95),
  ('660e8400-e29b-41d4-a716-446655440000', '学习', 'auto', 0.90),
  ('660e8400-e29b-41d4-a716-446655440001', '自律', 'auto', 0.85),
  ('660e8400-e29b-41d4-a716-446655440001', '习惯', 'auto', 0.80),
  ('660e8400-e29b-41d4-a716-446655440002', 'Python', 'auto', 0.95),
  ('660e8400-e29b-41d4-a716-446655440002', '数据分析', 'auto', 0.90),
  ('660e8400-e29b-41d4-a716-446655440003', '瑜伽', 'auto', 0.95),
  ('660e8400-e29b-41d4-a716-446655440003', '健身', 'auto', 0.85),
  ('660e8400-e29b-41d4-a716-446655440004', '健身', 'auto', 0.95),
  ('660e8400-e29b-41d4-a716-446655440004', '新手', 'auto', 0.75)
ON CONFLICT DO NOTHING;

-- 插入行为标签
INSERT INTO behavior_tags (content_id, user_id, stay_time, click_count, rewatch_count) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 300, 2, 0),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 450, 3, 1),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 900, 5, 2),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 600, 4, 1),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 500, 2, 0)
ON CONFLICT DO NOTHING;

-- 插入兴趣标签（用户聚合兴趣）
INSERT INTO interest_tags (user_id, tag_name, confidence) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '英语', 0.95),
  ('550e8400-e29b-41d4-a716-446655440000', '学习', 0.90),
  ('550e8400-e29b-41d4-a716-446655440000', '自律', 0.85),
  ('550e8400-e29b-41d4-a716-446655440001', '健身', 0.95),
  ('550e8400-e29b-41d4-a716-446655440001', '瑜伽', 0.85)
ON CONFLICT DO NOTHING;
