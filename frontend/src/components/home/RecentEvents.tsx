"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  banner?: string;
  bannerUrl?: string;
}

const placeholderEvents: Event[] = [
  {
    id: "1",
    title: "Green Pune Drive 2026",
    date: "2026-07-15",
    venue: "Pune Municipal Gardens",
    description: "A massive tree plantation drive across Pune city with over 200 volunteers planting native species.",
    status: "upcoming",
  },
  {
    id: "2",
    title: "River Cleanup Campaign",
    date: "2026-06-20",
    venue: "Mula-Mutha Riverbank",
    description: "Community cleanup of the Mula-Mutha riverbank to remove plastic waste and restore the natural habitat.",
    status: "ongoing",
  },
  {
    id: "3",
    title: "Education for All Workshop",
    date: "2026-05-10",
    venue: "Community Center, Hadapsar",
    description: "Free educational workshop for underprivileged children covering science, math, and digital literacy.",
    status: "completed",
  },
];

const statusColors: Record<string, string> = {
  upcoming: "bg-accent/10 text-accent-dark",
  ongoing: "bg-primary/10 text-primary",
  completed: "bg-gray-100 text-text-secondary",
};

export default function RecentEvents() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [events, setEvents] = useState<Event[]>(placeholderEvents);

  useEffect(() => {
    fetch("/api/events?limit=3")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed");
      })
      .then((resData) => {
        if (resData && resData.success && Array.isArray(resData.data)) {
          setEvents(resData.data);
        }
      })
      .catch(() => {
        // Use placeholder data
      });
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            What&apos;s Happening
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
            Recent Events
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Stay updated with our latest drives, workshops, and community events
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Banner */}
              <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                {event.banner || event.bannerUrl ? (
                  <img
                    src={event.banner || event.bannerUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-text-light">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <p className="mt-1.5 text-sm text-text-secondary flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {event.venue}
                </p>

                <p className="mt-3 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
          >
            View All Events
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
