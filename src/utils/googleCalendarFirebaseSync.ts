import { createEvent, getEventsByUser, updateEvent } from "../api/firebase/firebase";
import { createGoogleCalendarEvent, fetchGoogleCalendarEvents, updateGoogleCalendarEvent } from "../api/googleCalendar/googleCalendar";
import { CalendarEventType } from "../types/calendar";

export async function syncEvents(token: string, userId: string) {
  // Синхронизация в обе стороны
  const [googleEvents, localEvents] = await Promise.all([
    fetchGoogleCalendarEvents(token),
    getEventsByUser(userId)
  ]);

  // Синхронизация Google → Firebase
  await Promise.all(googleEvents.map(event => 
    createEvent(event).catch(() => updateEvent(event.id!, event))
  ));

  // Синхронизация Firebase → Google
  await Promise.all(localEvents.map(event => 
    event.id ? updateGoogleCalendarEvent(token, event) : createGoogleCalendarEvent(token, event)
  ));
}

export async function createAndSyncEvent(token: string, event: CalendarEventType) {
  const googleEvent = await createGoogleCalendarEvent(token, event);
  await createEvent({ ...event, id: googleEvent.id });
  return googleEvent;
}

export async function updateAndSyncEvent(token: string, event: CalendarEventType) {
  await Promise.all([
    updateGoogleCalendarEvent(token, event),
    event.id ? updateEvent(event.id, event) : Promise.resolve()
  ]);
}