import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  cta?: { to: string; label: string };
}

export function EmptyState({ icon: Icon = Inbox, title, hint, cta }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-24 px-8 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-2xl bg-aurora1/20" />
        <div className="relative w-24 h-24 rounded-full glass flex items-center justify-center mb-6">
          <Icon size={36} className="text-gold" />
        </div>
      </div>
      <h3 className="font-display text-3xl text-cream font-semibold mb-3">{title}</h3>
      {hint && <p className="text-cream/60 max-w-md mb-8">{hint}</p>}
      {cta && (
        <Link to={cta.to} className="btn-gold px-6 py-3 rounded-lg text-sm">
          {cta.label}
        </Link>
      )}
    </motion.div>
  );
}
