# 炫酷纪念相册 — 实施计划

## 1. Summary（项目概述）

打造一款**电影感暗色 + 极光星云**风格的个人纪念相册 Web 应用。用户可以为每张照片记录**日期、地点、心情、故事**，并通过**时间线、拍立得画廊、世界地图**三种视角回溯生命中的高光时刻。

定位：「记忆星图」 — 把人生切片收藏进一个会发光的数字博物馆。

技术栈：React 18 + TypeScript + Vite + Tailwind + Zustand（前端） / Express + SQLite + better-sqlite3（全栈） / Leaflet（地图，无 API Key） / Framer Motion（动画）。

---

## 2. Current State Analysis（现状分析）

| 项目 | 状态 |
|------|------|
| 工作目录 | `d:\tradeproject\photoAlbum` |
| 已有文件 | 仅 `README.md`（空内容） |
| 前端代码 | 不存在 |
| 后端代码 | 不存在 |
| 数据库 | 不存在 |
| Node 环境 | 需在初始化阶段确认 |

**结论**：纯绿地项目，可自由选型，按标准全栈结构搭建。

---

## 3. Proposed Changes（具体改动）

### 3.1 文档与初始化（前置）

| 文件 | 作用 |
|------|------|
| `.trae/documents/PRD.md` | 产品需求文档 |
| `.trae/documents/Technical-Architecture.md` | 技术架构文档 |
| `.trae/documents/plan.md` | 本计划文件 |

**初始化流程**：
1. 使用 `react-express-ts` 模板创建项目骨架
2. 在 `package.json` 中追加依赖：`framer-motion`、`leaflet`、`react-leaflet`、`better-sqlite3`、`multer`、`cors`、`uuid`
3. `npm install` 安装全部依赖

---

### 3.2 视觉设计系统（Design Tokens）

**色彩（CSS 变量定义于 `src/index.css`）**：
```
--void:        #0a0612  宇宙黑底
--ink:         #1a0f2e  墨紫深色
--aurora-1:    #00ffa3  极光绿
--aurora-2:    #ff006e  品红霓虹
--aurora-3:    #00d4ff  电光青
--gold:        #d4af37  鎏金点缀
--cream:       #f5e6d3  米白文字
--grain:       0.06 透明度的胶片噪点
```

**字体（Google Fonts）**：
- Display：`Cormorant Garamond`（衬线，杂志标题）
- Body：`Manrope`（现代无衬线）
- Mono：`JetBrains Mono`（坐标/日期标签）

**关键效果**：
- `AuroraBackground`：3 层径向渐变 + 缓慢位移（15-25s 循环）
- `FilmGrain`：SVG 噪点覆盖，0.06 透明度，固定
- `LightLeak`：边缘柔光漏光
- 玻璃拟态：`backdrop-filter: blur(20px) saturate(180%)`

---

### 3.3 路由与页面（前端）

| 路由 | 页面 | 核心模块 |
|------|------|----------|
| `/` | **Home（首页）** | 3D 翻书封面 + Hero「今日记忆」+ 最近 6 张预览 + 统计仪表板 |
| `/timeline` | **Timeline（时间线）** | 垂直时间轴 + 心情色点 + 月份分组 + 滚动视差 |
| `/gallery` | **Gallery（拍立得墙）** | 自由网格 + 拍立得相框（随机旋转 -8°~+8°） + 鼠标拖拽重排 |
| `/map` | **MapView（地图）** | Leaflet 暗色瓦片 + 自定义鎏金图钉 + 聚合弹窗 |
| `/add` | **AddMemory（新增）** | 拖拽上传 + 地图选点 + 心情选择 + 故事编辑器 |
| `/memory/:id` | **MemoryDetail（详情）** | 全屏看图 + 大段故事 + 心情标签 + 回到定位 |

**共享组件**：
- `NavBar`：顶部固定，半透明深色，左侧 Logo（金色衬线字体「Memory Atlas」），右侧 5 个导航 + 心情筛选下拉
- `BookCover`：CSS 3D 翻书动画，作为 `/` 首屏；点击翻开进入应用
- `PolaroidCard`：拍立得样式相框，相纸白 + 底部手写日期 + 金色图钉
- `MoodBadge`：8 种心情对应 8 套配色 + emoji + 渐变光晕
- `FilmGrain`：全站固定噪点层

---

### 3.4 后端 API

**文件结构**：
```
api/
├── src/
│   ├── index.ts          # Express 启动 + CORS + 静态文件
│   ├── db/
│   │   ├── index.ts      # better-sqlite3 连接
│   │   └── schema.sql    # 表结构
│   ├── routes/
│   │   └── memories.ts   # 记忆 CRUD
│   ├── middleware/
│   │   └── upload.ts     # multer 配置
│   └── uploads/          # 照片存储目录
└── package.json
```

**REST 接口**（baseURL: `http://localhost:5174`）：

| Method | Path | Body / Query | 用途 |
|--------|------|--------------|------|
| GET    | `/api/memories` | `?mood=&year=&q=` | 列表（支持心情/年份/关键词筛选） |
| GET    | `/api/memories/:id` | — | 详情 |
| POST   | `/api/memories` | multipart: photo + JSON: metadata | 新建 |
| PUT    | `/api/memories/:id` | JSON | 更新 |
| DELETE | `/api/memories/:id` | — | 删除 |
| GET    | `/api/memories/stats` | — | 心情/月份统计 |
| GET    | `/uploads/:filename` | — | 静态照片访问 |

**数据模型（SQLite）**：
```sql
CREATE TABLE memories (
  id              TEXT PRIMARY KEY,        -- uuid
  title           TEXT NOT NULL,
  photo_url       TEXT NOT NULL,           -- /uploads/xxx.jpg
  taken_at        TEXT NOT NULL,           -- ISO 日期
  location_name   TEXT,
  lat             REAL,
  lng             REAL,
  mood            TEXT NOT NULL,           -- joyful/nostalgic/peaceful/exciting/melancholy/romantic/adventurous/contemplative
  story           TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood ON memories(mood);
CREATE INDEX idx_taken ON memories(taken_at);
```

**8 种心情枚举**：
- 🌟 joyful（欢欣）— 极光绿
- 🌙 nostalgic（怀旧）— 鎏金
- 🌊 peaceful（宁静）— 电光青
- ⚡ exciting（兴奋）— 品红
- 🍂 melancholy（忧伤）— 灰紫
- 🌹 romantic（浪漫）— 玫瑰粉
- 🗻 adventurous（冒险）— 琥珀橙
- 💭 contemplative（沉思）— 淡蓝灰

---

### 3.5 文件清单（完整产出）

```
photoAlbum/
├── .trae/documents/
│   ├── PRD.md
│   ├── Technical-Architecture.md
│   └── plan.md
├── api/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/{index.ts, schema.sql}
│   │   ├── routes/memories.ts
│   │   └── middleware/upload.ts
│   ├── uploads/.gitkeep
│   └── package.json
├── src/
│   ├── components/
│   │   ├── AuroraBackground.tsx
│   │   ├── FilmGrain.tsx
│   │   ├── NavBar.tsx
│   │   ├── BookCover.tsx
│   │   ├── PolaroidCard.tsx
│   │   ├── MoodBadge.tsx
│   │   ├── MemoryMap.tsx
│   │   ├── MoodPicker.tsx
│   │   └── EmptyState.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Timeline.tsx
│   │   ├── Gallery.tsx
│   │   ├── MapView.tsx
│   │   ├── AddMemory.tsx
│   │   └── MemoryDetail.tsx
│   ├── store/useMemoryStore.ts
│   ├── utils/api.ts
│   ├── utils/moods.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**估算文件数**：约 30 个源文件（10 组件 + 6 页面 + 后端 5 个 + 配置 + 文档）。

---

## 4. Assumptions & Decisions（关键决策）

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 状态管理 | Zustand | 轻量、TS 友好 |
| 地图方案 | Leaflet + OSM 暗色瓦片 | 零 API Key、私有部署友好 |
| 照片存储 | 后端 `uploads/` 目录 | 全栈要求 + 大文件友好 |
| 日期/位置反查 | 用 Nominatim 公开 API（按需） | 避免引入付费服务 |
| 动画库 | Framer Motion | 复杂入场/翻书效果必需 |
| 字体加载 | Google Fonts CDN | 美学优先 |
| 包管理器 | npm（用户未指定，pnpm 未确认） | 稳妥默认 |
| 端口分配 | 前端 5173、后端 5174 | Vite 默认 + 错开避免冲突 |

---

## 5. Verification（验证步骤）

按以下顺序自检：

1. **后端冒烟**
   - `curl http://localhost:5174/api/memories` 返回 200 + 空数组
   - 用 `curl -F photo=@sample.jpg -F 'metadata={"title":"test","mood":"joyful","taken_at":"2024-01-01"};type=application/json' http://localhost:5174/api/memories` 创建一条
   - 再次 GET 验证返回新数据 + 照片文件落在 `api/uploads/`

2. **前端构建**
   - `npm run build` 无 TS 错误、无 ESLint 错误
   - 浏览器打开 `http://localhost:5173`，控制台无报错

3. **功能回路**
   - 录入一张照片（带心情+位置）→ 出现在时间线、画廊、地图
   - 点击地图图钉弹出 popup，点击进入详情
   - 删除后所有视图同步消失
   - 心情筛选下拉切换后只显示对应颜色卡片

4. **美学巡检**
   - 极光渐变背景有缓慢流动
   - 胶片噪点固定不干扰文字
   - 拍立得相框随机倾斜、自然
   - 3D 翻书封面翻开后平滑过渡
   - 暗色瓦片地图 + 鎏金图钉对比鲜明

5. **响应式**
   - 1440 / 1024 / 768 / 375 四档断点均不破版

---

## 6. Out of Scope（明确不做）

- 用户登录/多用户系统
- 移动端原生 App
- 视频/音频记忆
- 朋友圈分享/社交功能
- AI 自动打标签（避免引入额外服务）
- PWA 离线（首版聚焦体验完整）

---

## 7. 执行顺序（推荐 Todo）

1. 生成 PRD 与技术架构文档至 `.trae/documents/`，通知用户审阅
2. 用 `vite-init` 创建 react-express-ts 骨架
3. 追加并安装全部依赖
4. 后端：DB schema + 记忆 CRUD + 上传接口 + 启动验证
5. 前端：设计 token + 极光背景 + 胶片噪点 + NavBar
6. 前端：核心组件 BookCover / PolaroidCard / MoodBadge
7. 前端：6 个页面逐个实现（Home → Timeline → Gallery → Map → Add → Detail）
8. 联调：前后端打通，验证一条完整回路
9. 美化打磨：动画、入场、空状态
10. README 写运行说明，启动 dev server 截图验证
