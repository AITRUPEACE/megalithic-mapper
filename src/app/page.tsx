"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Sparkles, Play } from "lucide-react";
import { AuthCtas } from "@/components/landing/AuthCtas";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { LandingTour } from "@/components/landing/LandingTour";
import { Button } from "@/shared/ui/button";

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawConstellations = () => {
      // Ancient star map / constellation effect
      const points: Array<{ x: number; y: number; size: number; pulse: number }> = [];
      
      // Generate constellation points based on time for subtle movement
      for (let i = 0; i < 40; i++) {
        const baseX = (Math.sin(i * 0.7) * 0.5 + 0.5) * canvas.width;
        const baseY = (Math.cos(i * 0.5) * 0.5 + 0.5) * canvas.height;
        points.push({
          x: baseX + Math.sin(time * 0.001 + i) * 2,
          y: baseY + Math.cos(time * 0.001 + i) * 2,
          size: 1.5 + Math.sin(i) * 0.5,
          pulse: Math.sin(time * 0.003 + i * 0.5) * 0.5 + 0.5,
        });
      }

      // Draw connecting lines (like ancient star charts)
      ctx.strokeStyle = "rgba(251, 146, 60, 0.06)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + p.pulse * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + p.pulse * 0.4})`;
        ctx.fill();
      });
    };

    const animate = () => {
      time++;
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawConstellations();
      
      animationId = requestAnimationFrame(animate);
    };

    resize();
    // Initial fill
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

export default function LandingPage() {
  const [showTour, setShowTour] = useState(false);

  return (
    <>
      <AnimatedBackground />

      {/* Tour Modal */}
      <LandingTour isOpen={showTour} onClose={() => setShowTour(false)} />

      <main className="relative z-10 min-h-screen text-foreground">
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
          {/* Soft glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            {/* Compass icon as a subtle brand mark */}
            <motion.div
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative">
                <Compass className="h-12 w-12 text-primary/60" strokeWidth={1} />
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-400" />
              </div>
            </motion.div>

            {/* Headline - more human, curious */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 font-serif text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              What if we mapped{" "}
              <span className="italic text-primary">every</span> ancient site
              <br className="hidden sm:block" />
              on Earth—together?
            </motion.h1>

            {/* Subtext - conversational, inviting */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-4 max-w-xl text-lg text-muted-foreground sm:text-xl"
            >
              An open experiment to piece together the puzzle of lost civilizations. 
              Drop pins, share photos, debate theories.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-10 text-sm text-muted-foreground/70"
            >
              We're just getting started. Come build with us.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <AuthCtas />
              
              {/* Tour button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTour(true)}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Play className="h-3 w-3" />
                  Take a quick tour
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <p className="text-xs tracking-widest text-muted-foreground/50 uppercase">
              Scroll to peek inside
            </p>
          </motion.div>
        </section>

        {/* What is this? - casual explainer */}
        <section className="relative px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="space-y-6 text-center"
            >
              <h2 className="font-serif text-2xl font-medium sm:text-3xl">
                Okay, but what <span className="italic">is</span> this?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You know how every few months someone posts a photo of some 
                  megalithic wall in Peru or Turkey, and everyone loses their minds 
                  trying to figure out who built it and when?
                </p>
                <p>
                  This is a place to collect all of that. A collaborative map where 
                  anyone can pin interesting sites, upload evidence, and connect 
                  the dots across continents.
                </p>
                <p className="text-foreground/90">
                  Think Wikipedia meets Google Earth, but for ancient mysteries.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Visual break - simple quote/vibe */}
        <section className="relative overflow-hidden px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mx-auto max-w-4xl text-center"
          >
            <blockquote className="font-serif text-2xl italic text-primary/80 sm:text-3xl">
              "The past is never dead. It's not even past."
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">— Faulkner, probably thinking about Göbekli Tepe</p>
          </motion.div>
        </section>

        {/* Feature Showcase with mockups */}
        <FeatureShowcase />

        {/* What you can do - simple list, not feature cards */}
        <section className="relative px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <h2 className="text-center font-serif text-2xl font-medium sm:text-3xl">
                Things you can do here
              </h2>
              
              <ul className="space-y-4 text-muted-foreground">
                <motion.li 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Drop a pin on the map for a site you've researched, visited, or just find fascinating</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Upload photos, documents, and videos—especially the weird stuff mainstream archaeology ignores</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Connect sites across the globe—notice a pattern? Link them and explain why</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Debate theories with other researchers (respectfully—we're all searching here)</span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Final CTA - warm, inviting */}
        <section className="relative px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-xl text-center"
          >
            <p className="mb-2 text-sm uppercase tracking-widest text-primary/70">
              Early days
            </p>
            <h2 className="mb-4 font-serif text-2xl font-medium sm:text-3xl">
              This is version 0.1
            </h2>
            <p className="mb-8 text-muted-foreground">
              Rough edges and all. If you're into ancient history, alternative archaeology, 
              or just love a good mystery—jump in. The best ideas come from unexpected places.
            </p>
            <AuthCtas variant="compact" />
          </motion.div>
        </section>

        {/* Footer - minimal */}
        <footer className="border-t border-border/20 px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground/60 sm:flex-row">
            <p>Built by curious humans, 2024</p>
            <div className="flex gap-6">
              <Link href="/map" className="transition-colors hover:text-foreground">
                Explore the Map
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
