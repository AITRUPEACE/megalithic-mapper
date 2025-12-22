"use client";

import { motion } from "framer-motion";
import { MapPin, ThumbsUp, MessageSquare, Camera, Search, Layers, Star, Users, Globe } from "lucide-react";

// Animated map mockup with floating markers
function MapMockup() {
  const markers = [
    { x: 25, y: 35, delay: 0, label: "Giza" },
    { x: 70, y: 40, delay: 0.2, label: "Angkor" },
    { x: 45, y: 55, delay: 0.4, label: "Machu Picchu" },
    { x: 55, y: 30, delay: 0.6, label: "Stonehenge" },
    { x: 80, y: 60, delay: 0.8, label: "Easter Island" },
  ];

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/80 shadow-2xl shadow-amber-500/5">
      {/* Map grid lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
            style={{ top: `${(i + 1) * 12.5}%` }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent"
            style={{ left: `${(i + 1) * 8.33}%` }}
          />
        ))}
      </div>

      {/* Continent silhouettes (simplified) */}
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M10 35 Q15 30 25 32 T35 35 Q40 38 38 45 Q35 50 30 48 T20 45 Q12 42 10 35Z"
          fill="currentColor"
          className="text-amber-500/40"
        />
        <path
          d="M45 25 Q55 22 65 28 T75 35 Q78 42 72 48 Q65 52 55 50 T45 45 Q42 35 45 25Z"
          fill="currentColor"
          className="text-amber-500/40"
        />
        <path
          d="M25 55 Q30 52 35 58 T40 68 Q38 75 30 72 T22 65 Q20 60 25 55Z"
          fill="currentColor"
          className="text-amber-500/40"
        />
        <path
          d="M75 50 Q82 48 88 55 T90 68 Q88 75 80 73 T72 65 Q70 55 75 50Z"
          fill="currentColor"
          className="text-amber-500/40"
        />
      </svg>

      {/* Animated markers */}
      {markers.map((marker, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: marker.delay + 0.5, duration: 0.4, type: "spring" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: marker.delay }}
          >
            <div className="relative -translate-x-1/2 -translate-y-full">
              <MapPin className="h-6 w-6 text-amber-500 drop-shadow-lg" fill="currentColor" />
              <motion.div
                className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-amber-200"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: marker.delay + 0.8 }}
              >
                {marker.label}
              </motion.div>
            </div>
          </motion.div>
          {/* Pulse effect */}
          <motion.div
            className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/30"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: marker.delay }}
          />
        </motion.div>
      ))}

      {/* Search bar mockup */}
      <motion.div
        className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-slate-800/90 px-3 py-2 shadow-lg"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Search ancient sites...</span>
      </motion.div>

      {/* Layer toggle mockup */}
      <motion.div
        className="absolute right-4 top-4 flex items-center gap-1 rounded-lg bg-slate-800/90 p-2 shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Layers className="h-4 w-4 text-amber-500" />
      </motion.div>
    </div>
  );
}

// Site details panel mockup
function DetailsPanelMockup() {
  return (
    <motion.div
      className="relative w-full max-w-sm overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/80 shadow-2xl shadow-amber-500/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header image placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-amber-900/40 to-slate-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-8 w-8 text-amber-500/40" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">Great Pyramid of Giza</h4>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Egypt • Pyramid • c. 2560 BCE</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Camera className="h-3 w-3" />
            <span>124 photos</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span>56 discussions</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          The oldest and largest of the pyramids in the Giza pyramid complex. One of the Seven Wonders of the Ancient World...
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
            <span className="text-xs font-medium">Follow</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs">Discuss</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Community features mockup
function CommunityMockup() {
  return (
    <div className="space-y-4">
      {/* Voting card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/80 p-4 shadow-xl"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <button className="rounded p-1 hover:bg-slate-800 transition-colors">
              <ThumbsUp className="h-4 w-4 text-emerald-500" fill="currentColor" />
            </button>
            <span className="text-sm font-semibold text-emerald-400">42</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">New site submission</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Proposed megalithic structure near Cusco, Peru
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
              <span className="text-xs text-muted-foreground">by @explorer_jane</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contribution badge */}
      <motion.div
        className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/80 p-4 shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Globe className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Explorer Badge Earned!</p>
            <p className="text-xs text-muted-foreground">Visited 10 different site regions</p>
          </div>
        </div>
      </motion.div>

      {/* Active researchers */}
      <motion.div
        className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/80 p-4 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium">Active researchers</span>
        </div>
        <div className="flex -space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2 border-slate-900"
              style={{
                background: `linear-gradient(135deg, hsl(${30 + i * 20}, 70%, 50%), hsl(${40 + i * 20}, 80%, 40%))`,
              }}
            />
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] text-muted-foreground">
            +99
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[150px]" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="mb-2 text-sm uppercase tracking-widest text-primary/70">
            See it in action
          </p>
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">
            A glimpse of the experience
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Map feature */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-medium mb-2">Interactive World Map</h3>
              <p className="text-sm text-muted-foreground">
                Explore thousands of ancient sites plotted on a beautiful, zoomable map. 
                Filter by era, culture, site type, and more.
              </p>
            </motion.div>
            <MapMockup />
          </div>

          {/* Details + Community */}
          <div className="space-y-8">
            {/* Details panel */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-2">Rich Site Details</h3>
                <p className="text-sm text-muted-foreground">
                  Every site has photos, research links, coordinates, and active discussions.
                </p>
              </motion.div>
              <div className="flex justify-center lg:justify-start">
                <DetailsPanelMockup />
              </div>
            </div>

            {/* Community features */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-medium mb-2">Community-Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Vote on submissions, earn badges, and connect with fellow researchers.
                </p>
              </motion.div>
              <CommunityMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


