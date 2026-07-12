"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  banner?: string;
  bannerUrl?: string;
  registrationLink?: string;
}

const statusColors: Record<string, string> = {
  upcoming: "bg-accent/10 text-accent-dark border-accent/30",
  ongoing: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-gray-100 text-text-secondary border-gray-200",
};

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

export default function EventCard({ event }: { event: EventData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
    >
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {event.banner || event.bannerUrl ? (
          <img
            src={event.banner || event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="h-16 w-16 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm ${statusColors[event.status]}`}>
            {statusLabels[event.status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {new Date(event.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {event.venue}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors mb-2">
          {event.title}
        </h3>

        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-1">
          {event.description}
        </p>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-border">
          {event.status === "upcoming" ? (
            <Link
              href={event.registrationLink || "/contact"}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Register Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : event.status === "ongoing" ? (
            <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Event in Progress
            </span>
          ) : (
            <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 text-text-secondary text-sm font-medium">
              Event Completed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
