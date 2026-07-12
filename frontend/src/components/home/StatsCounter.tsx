"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface StatItemProps {
  label: string;
  target: number;
  suffix?: string;
  isInView: boolean;
  delay: number;
}

function StatItem({ label, target, suffix = "+", isInView, delay }: StatItemProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest: number) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration: 2,
        delay,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, target, count, delay]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-0.5">
        <motion.span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          {rounded}
        </motion.span>
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent">
          {suffix}
        </span>
      </div>
      <p className="mt-2 text-sm sm:text-base text-white/70 font-medium">
        {label}
      </p>
    </div>
  );
}

export default function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [stats, setStats] = useState([
    { label: "Trees Planted", target: 5000 },
    { label: "Cleanliness Drives", target: 120 },
    { label: "Active Volunteers", target: 500 },
    { label: "Students Educated", target: 1200 },
    { label: "Events Conducted", target: 200 },
  ]);

  useEffect(() => {
    fetch("/api/statistics")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const data = resData.data;
          setStats([
            { label: "Trees Planted", target: data.treesPlanted ?? 5000 },
            { label: "Cleanliness Drives", target: data.cleanlinessDrives ?? 120 },
            { label: "Active Volunteers", target: data.volunteers ?? 500 },
            { label: "Students Educated", target: data.studentsEducated ?? 1200 },
            { label: "Events Conducted", target: data.eventsConducted ?? 200 },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-dark via-primary to-primary-dark"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Our Impact in Numbers
          </h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            Every number represents a story of positive change in our community
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              target={stat.target}
              isInView={isInView}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
