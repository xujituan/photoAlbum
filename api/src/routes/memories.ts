import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import { upload } from '../middleware/upload';

export const memoriesRouter = Router();

interface MemoryRow {
  id: string;
  title: string;
  photo_url: string;
  taken_at: string;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  mood: string;
  story: string | null;
  created_at: string;
}

// 列表（支持筛选）
memoriesRouter.get('/', (req, res) => {
  const { mood, year, q } = req.query as Record<string, string | undefined>;

  let sql = 'SELECT * FROM memories WHERE 1=1';
  const params: any[] = [];

  if (mood) {
    sql += ' AND mood = ?';
    params.push(mood);
  }
  if (year) {
    sql += " AND strftime('%Y', taken_at) = ?";
    params.push(year);
  }
  if (q) {
    sql += ' AND (title LIKE ? OR story LIKE ? OR location_name LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY taken_at DESC, created_at DESC';

  const rows = db.prepare(sql).all(...params) as MemoryRow[];
  res.json(rows);
});

// 统计
memoriesRouter.get('/stats', (_req, res) => {
  const total = (db.prepare('SELECT COUNT(*) as c FROM memories').get() as any).c;
  const yearRows = db
    .prepare("SELECT DISTINCT strftime('%Y', taken_at) as y FROM memories ORDER BY y DESC")
    .all() as any[];
  const years = yearRows.map((r) => r.y);
  const moodRows = db
    .prepare('SELECT mood, COUNT(*) as c FROM memories GROUP BY mood')
    .all() as any[];
  const moodCount: Record<string, number> = {};
  moodRows.forEach((r) => (moodCount[r.mood] = r.c));
  const latest = (db
    .prepare('SELECT MAX(taken_at) as latest FROM memories')
    .get() as any).latest;
  res.json({ total, years, moodCount, latestAt: latest });
});

// 详情
memoriesRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) as
    | MemoryRow
    | undefined;
  if (!row) return res.status(404).json({ error: '未找到该记忆' });
  res.json(row);
});

// 新建
memoriesRouter.post('/', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '需要上传照片' });
    const metaRaw = req.body.metadata;
    if (!metaRaw) return res.status(400).json({ error: '缺少 metadata' });

    const meta = JSON.parse(metaRaw);
    const id = uuid();
    const photoUrl = `/uploads/${req.file.filename}`;

    db.prepare(
      `INSERT INTO memories (id, title, photo_url, taken_at, location_name, lat, lng, mood, story)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      meta.title || '未命名记忆',
      photoUrl,
      meta.taken_at || new Date().toISOString().slice(0, 10),
      meta.location_name || null,
      meta.lat ?? null,
      meta.lng ?? null,
      meta.mood || 'contemplative',
      meta.story || null
    );

    const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(id) as MemoryRow;
    res.status(201).json(row);
  } catch (e: any) {
    console.error('[POST /memories]', e);
    res.status(500).json({ error: e.message });
  }
});

// 更新
memoriesRouter.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) as
    | MemoryRow
    | undefined;
  if (!row) return res.status(404).json({ error: '未找到该记忆' });

  const { title, taken_at, location_name, lat, lng, mood, story } = req.body;
  db.prepare(
    `UPDATE memories SET
      title = COALESCE(?, title),
      taken_at = COALESCE(?, taken_at),
      location_name = ?,
      lat = ?,
      lng = ?,
      mood = COALESCE(?, mood),
      story = ?
     WHERE id = ?`
  ).run(
    title ?? null,
    taken_at ?? null,
    location_name ?? row.location_name,
    lat ?? row.lat,
    lng ?? row.lng,
    mood ?? null,
    story ?? row.story,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// 删除
memoriesRouter.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: '未找到该记忆' });
  res.json({ ok: true });
});
