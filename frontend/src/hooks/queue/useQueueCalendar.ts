"use client";

import { useState, useEffect } from "react";
import type { Queue } from "@/types/queue";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}

interface UseQueueCalendarReturn {
  addToCalendar: (queue: Queue, estimatedTime: Date) => Promise<void>;
  removeFromCalendar: (eventId: string) => Promise<void>;
  events: CalendarEvent[];
}

export function useQueueCalendar(): UseQueueCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Fonction utilitaire pour créer un événement ICS
  const createICSEvent = (event: CalendarEvent): string => {
    const formatDate = (date: Date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${event.id}
SUMMARY:${event.title}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
LOCATION:${event.location || ""}
DESCRIPTION:${event.description || ""}
END:VEVENT
END:VCALENDAR`;
  };

  // Ajouter au calendrier natif
  const addNativeCalendarEvent = async (event: CalendarEvent) => {
    if ("calendar" in navigator && "showSaveNewEvent" in navigator.calendar) {
      try {
        await (navigator.calendar as any).showSaveNewEvent({
          title: event.title,
          start: event.start,
          end: event.end,
          location: event.location,
          description: event.description,
        });
        return true;
      } catch (error) {
        console.error("Failed to add to native calendar:", error);
        return false;
      }
    }
    return false;
  };

  // Télécharger le fichier ICS
  const downloadICSFile = (event: CalendarEvent) => {
    const icsContent = createICSEvent(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const addToCalendar = async (queue: Queue, estimatedTime: Date) => {
    const event: CalendarEvent = {
      id: `queue-${queue.id}-${Date.now()}`,
      title: `File d'attente - ${queue.name}`,
      start: estimatedTime,
      end: new Date(estimatedTime.getTime() + 30 * 60000), // +30 minutes
      location: queue.organization.name,
      description: `Votre rendez-vous estimé pour la file ${queue.name} chez ${queue.organization.name}`,
    };

    // Essayer d'abord le calendrier natif
    const addedNatively = await addNativeCalendarEvent(event);

    // Si ça ne marche pas, proposer le téléchargement ICS
    if (!addedNatively) {
      downloadICSFile(event);
    }

    // Sauvegarder l'événement localement
    setEvents((prev) => [...prev, event]);

    // Sauvegarder dans le stockage local
    const storedEvents = JSON.parse(
      localStorage.getItem("queue_calendar_events") || "[]"
    );
    localStorage.setItem(
      "queue_calendar_events",
      JSON.stringify([...storedEvents, event])
    );
  };

  const removeFromCalendar = async (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));

    // Mettre à jour le stockage local
    const storedEvents = JSON.parse(
      localStorage.getItem("queue_calendar_events") || "[]"
    );
    localStorage.setItem(
      "queue_calendar_events",
      JSON.stringify(storedEvents.filter((event: CalendarEvent) => event.id !== eventId))
    );
  };

  // Charger les événements au démarrage
  useEffect(() => {
    const storedEvents = JSON.parse(
      localStorage.getItem("queue_calendar_events") || "[]"
    );
    setEvents(
      storedEvents.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    );
  }, []);

  return {
    addToCalendar,
    removeFromCalendar,
    events,
  };
}
