"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EventCard from "@/components/events/EventCard";

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

const placeholderEvents: EventData[] = [
  {
    id: "1",
    title: "Green Pune Drive 2026",
    date: "2026-07-15",
    venue: "Pune Municipal Gardens",
    description: "A massive tree plantation drive across Pune city with over 200 volunteers planting native species to increase green cover and fight pollution.",
    status: "upcoming",
  },
  {
    id: "2",
    title: "River Cleanup Campaign",
    date: "2026-06-20",
    venue: "Mula-Mutha Riverbank",
    description: "Community cleanup of the Mula-Mutha riverbank to remove plastic waste and restore the natural habitat for aquatic life.",
    status: "ongoing",
  },
  {
    id: "3",
    title: "Education for All Workshop",
    date: "2026-05-10",
    venue: "Community Center, Hadapsar",
    description: "Free educational workshop for underprivileged children covering science, math, and digital literacy skills for the modern world.",
    status: "completed",
  },
  {
    id: "4",
    title: "Flower Recycling Awareness Camp",
    date: "2026-04-22",
    venue: "Dagdusheth Temple Area",
    description: "Awareness camp on temple flower recycling, demonstrating how waste flowers can be transformed into incense sticks, compost, and natural colors.",
    status: "completed",
  },
  {
    id: "5",
    title: "World Environment Day Celebration",
    date: "2026-06-05",
    venue: "Katraj Lake",
    description: "Grand celebration of World Environment Day with tree plantation, eco-walk, and awareness sessions about biodiversity conservation.",
    status: "completed",
  },
  {
    id: "6",
    title: "Clean India - Clean Schools",
    date: "2026-08-01",
    venue: "Zilla Parishad Schools, Pune",
    description: "Initiative to clean and maintain rural school premises, install dustbins, and educate children on waste management practices.",
    status: "upcoming",
  },
];

const tabs = [
  { key: "all", label: "All Events" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState<EventData[]>(placeholderEvents);

  useEffect(() => {
    fetch("/api/events")
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

  const filteredEvents =
    activeTab === "all"
      ? events
      : events.filter((e) => e.status === activeTab);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text">
            Our Events
          </h1>
          <p className="mt-3 text-text-secondary max-w-xl mx-auto">
            Discover our upcoming events, ongoing initiatives, and past
            successes in environmental and social change.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg
              className="h-16 w-16 text-text-light mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <p className="text-text-secondary text-lg">No events found</p>
            <p className="text-text-light text-sm mt-1">
              Check back later for updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
