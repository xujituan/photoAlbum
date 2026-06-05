import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { memoriesRouter } from './routes/memories';

const PORT = 5174;

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 静态照片
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// 路由
app.use('/api/memories', memoriesRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'memory-atlas', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n✦ Memory Atlas API 已启动`);
  console.log(`✦ 地址: http://localhost:${PORT}`);
  console.log(`✦ 健康: http://localhost:${PORT}/api/health\n`);
});
