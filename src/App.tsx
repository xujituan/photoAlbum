import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/AuroraBackground';
import { FilmGrain } from '@/components/FilmGrain';
import { NavBar } from '@/components/NavBar';
import { CinematicOverlay } from '@/components/CinematicOverlay';
import { Toaster } from '@/components/Toaster';
import { CustomCursor } from '@/components/CustomCursor';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { BokehField } from '@/components/BokehField';
import { NowShowingTicker } from '@/components/NowShowingTicker';
import { Home } from '@/pages/Home';
import { Timeline } from '@/pages/Timeline';
import { Gallery } from '@/pages/Gallery';
import { MapView } from '@/pages/MapView';
import { AddMemory } from '@/pages/AddMemory';
import { MemoryDetail } from '@/pages/MemoryDetail';

function NotFound() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6"
      >
        <div className="font-mono text-[10px] text-gold uppercase tracking-[0.5em] mb-4">
          ✦ Scene Not Found
        </div>
        <h1 className="font-display text-[10rem] md:text-[16rem] font-bold text-cream leading-none tracking-tight">
          404
        </h1>
        <div className="h-px w-24 bg-gold/40 mx-auto my-6" />
        <p className="font-display italic text-2xl md:text-3xl text-cream/55 max-w-lg mx-auto">
          这一页还没有记忆
        </p>
        <p className="mt-2 text-cream/30 text-sm font-mono uppercase tracking-widest">
          The page you're looking for hasn't been captured yet.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <Link to="/" className="btn-gold px-6 py-3 rounded-full text-xs">
          ✦ 回到首页
        </Link>
        <Link
          to="/gallery"
          className="px-6 py-3 rounded-full text-xs glass text-cream/70 hover:text-cream"
        >
          浏览回忆墙
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute bottom-12 font-mono text-[10px] text-cream/20 uppercase tracking-[0.4em]"
      >
        memory atlas · 2026
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <BokehField />
      <CinematicOverlay />
      <FilmGrain />
      <NavBar />
      <Toaster />
      <CustomCursor />
      <KeyboardShortcuts />
      <NowShowingTicker />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/add" element={<AddMemory />} />
          <Route path="/memory/:id" element={<MemoryDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
