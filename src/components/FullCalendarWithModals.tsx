import { useState, useCallback, useEffect } from 'react';
import { Modal, Button, message, Input } from 'antd';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventChangeArg, DateSelectArg } from '@fullcalendar/core';
import { EventModal } from './EventModal';
import { CalendarEventType } from '../types/calendar';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent, fetchGoogleCalendarEvents, updateGoogleCalendarEvent } from '../api/googleCalendar/сrudGoogleCalendarEvents';

type FullCalendarWithModalsProps = {
  token: string | null;
}

export function FullCalendarWithModals({ token }: FullCalendarWithModalsProps) {
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem("authUser");

  const loadEvents = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const fetchedEvents = await fetchGoogleCalendarEvents(token);
      setEvents(fetchedEvents);
    } catch (error) {
      message.error('Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setModalVisible(true);
    }
  }, [events]);

  const handleEventChange = useCallback(async (changeInfo: EventChangeArg) => {
    try {
      const event = events.find(e => e.id === changeInfo.event.id);
      if (event && token) {
        await updateGoogleCalendarEvent(token, {
          ...event,
          start: { 
            dateTime: changeInfo.event.startStr, 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
          },
          end: { 
            dateTime: changeInfo.event.endStr, 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
          }
        });
        await loadEvents();
      }
    } catch (error) {
      message.error('Не удалось обновить событие');
      await loadEvents();
    }
  }, [events, token, loadEvents]);

  const handleSelect = useCallback(async (selectInfo: DateSelectArg) => {
    Modal.confirm({
      title: 'Создать новое событие',
      content: (
        <Input 
          placeholder="Введите название события" 
          id="event-title-input"
        />
      ),
      onOk: async () => {
        const input = document.getElementById('event-title-input') as HTMLInputElement;
        const title = input?.value.trim();
        
        if (!title || !token) return;

        if (user) {
          try {
            await createGoogleCalendarEvent(token, {
              userId: user.id,
              summary: title,
              start: { 
                dateTime: selectInfo.startStr,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
              },
              end: { 
                dateTime: selectInfo.endStr,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
              },
              status: 'confirmed'
            });
            await loadEvents();
          } catch (error) {
            message.error('Не удалось создать событие');
          }
        }
      },
    });
  }, [token, loadEvents]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!token) return;
    
    try {
      await deleteGoogleCalendarEvent(token, eventId);
      setModalVisible(false);
      await loadEvents();
    } catch (error) {
      message.error('Не удалось удалить событие');
    }
  }, [token, loadEvents]);

  const handleUpdateEvent = useCallback(async (updatedEvent: CalendarEventType) => {
    if (!token) return;
    
    try {
      await updateGoogleCalendarEvent(token, updatedEvent);
      setModalVisible(false);
      await loadEvents();
    } catch (error) {
      message.error('Не удалось обновить событие');
    }
  }, [token, loadEvents]);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        selectable={true}
        editable={true}
        events={events.map(event => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime,
          backgroundColor: event.status === 'confirmed' ? '#1890ff' : '#faad14',
          borderColor: event.status === 'confirmed' ? '#1890ff' : '#faad14',
        }))}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
        select={handleSelect}
        loading={(isLoading) => {
            setLoading(isLoading);
          }}
        locale="ru"
        height="auto"
      />
      
      <EventModal
        event={selectedEvent}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onDelete={handleDeleteEvent}
        onUpdate={handleUpdateEvent}
      />
    </>
  );
}