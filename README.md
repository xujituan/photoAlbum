# Memory Atlas · 记忆星图

> 电影感暗色 + 极光星云风格的纪念相册 Web 应用

为每一张照片记录**日期、地点、心情、故事**，通过**时间线、拍立得墙、世界地图**三种视角回溯生命中的高光时刻。

## ✨ 特性

- **3D 翻书封面**：CSS 3D 翻页动画作为首屏仪式感
- **8 种心情分类**：每种心情有专属色彩、光晕、emoji 和文案
- **三种浏览视角**：
  - 📅 **时间线**：按月份分组，垂直时间轴 + 心情色点发光
  - 📸 **拍立得墙**：随机倾斜的拍立得相框，鼠标拖拽重排
  - 🗺️ **世界地图**：Leaflet 暗色瓦片 + 鎏金发光图钉 + 弹窗预览
- **完整 CRUD**：上传照片、地图选点、选心情、写故事、删除
- **数据持久化**：SQLite + 本地后端，照片保存到磁盘
- **极致美学**：极光渐变背景、胶片噪点、鎏金描边、玻璃拟态

## 🛠️ 技术栈

| 层 | 选型 |
|----|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Framer Motion |
| 地图 | Leaflet + react-leaflet（OSM 暗色瓦片，零 API Key） |
| 后端 | Express + TypeScript + better-sqlite3 + Multer |
| 数据库 | SQLite（本地文件） |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端（端口 5174）

```bash
npm run server
```

### 3. 启动前端（端口 5173）

```bash
npm run dev
```

### 4. 一键启动前后端

```bash
npm run dev:all
```

打开浏览器访问 [http://localhost:5173](http://localhost:5173)

## 📁 目录结构

```
photoAlbum/
├── api/                          # Express 后端
│   ├── src/
│   │   ├── index.ts              # 服务入口
│   │   ├── db/                   # SQLite + schema
│   │   ├── routes/memories.ts    # 记忆 CRUD
│   │   └── middleware/upload.ts  # Multer 文件上传
│   ├── uploads/                  # 照片存储
│   └── data/                     # SQLite 数据库
├── src/                          # React 前端
│   ├── components/               # 9 个核心组件
│   │   ├── AuroraBackground.tsx  # 极光背景层
│   │   ├── FilmGrain.tsx         # 胶片噪点
│   │   ├── BookCover.tsx         # 3D 翻书封面
│   │   ├── NavBar.tsx            # 顶部导航
│   │   ├── PolaroidCard.tsx      # 拍立得相框
│   │   ├── MoodBadge.tsx         # 心情徽章
│   │   ├── MoodPicker.tsx        # 心情选择器
│   │   ├── MemoryMap.tsx         # Leaflet 地图
│   │   └── EmptyState.tsx        # 空状态
│   ├── pages/                    # 6 个页面
│   │   ├── Home.tsx              # 首页（3D 封面 + Hero + 统计 + 最近）
│   │   ├── Timeline.tsx          # 时间线
│   │   ├── Gallery.tsx           # 拍立得墙
│   │   ├── MapView.tsx           # 地图
│   │   ├── AddMemory.tsx         # 新增记忆
│   │   └── MemoryDetail.tsx      # 记忆详情
│   ├── store/useMemoryStore.ts   # Zustand 状态管理
│   └── utils/{api.ts, moods.ts}  # API 客户端 + 心情元数据
└── .trae/documents/              # 项目文档
    ├── PRD.md
    ├── Technical-Architecture.md
    └── plan.md
```

## 🎨 设计系统

- **配色**：宇宙黑 `#0a0612` · 极光绿 `#00ffa3` · 品红霓虹 `#ff006e` · 电光青 `#00d4ff` · 鎏金 `#d4af37`
- **字体**：Cormorant Garamond（衬线标题）+ Manrope（正文）+ JetBrains Mono（标签）
- **动效**：极光 15-25s 漂移循环、胶片噪点固定、3D 翻书 1.6s ease-in-out

## 🗄️ API 接口

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/memories` | 列表（支持 `?mood=&year=&q=` 筛选） |
| GET    | `/api/memories/:id` | 详情 |
| POST   | `/api/memories` | 新建（multipart: `photo` + `metadata`） |
| PUT    | `/api/memories/:id` | 更新 |
| DELETE | `/api/memories/:id` | 删除 |
| GET    | `/api/memories/stats` | 统计 |
| GET    | `/uploads/:filename` | 静态照片 |

## 📜 脚本命令

```bash
npm run dev       # 启动前端（5173）
npm run server    # 启动后端（5174）
npm run dev:all   # 并发启动前后端
npm run build     # 生产构建
npm run check     # TypeScript 类型检查
```

## 🌌 致谢

- 字体：Google Fonts（Cormorant Garamond / Manrope / JetBrains Mono）
- 地图：OpenStreetMap + CARTO Dark Matter 瓦片
- 图标：Lucide

—— 愿你的每段记忆都发着光 ✦
