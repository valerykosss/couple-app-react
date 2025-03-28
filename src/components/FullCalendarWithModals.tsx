import { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventModal } from './EventModal';
import { transformEvents } from '../utils/eventTransformForFullCalendar';
import { fetchGoogleCalendarEvents } from '../api/googleCalendar/googleCalendar';
import { useDispatch } from 'react-redux';
import { action, useTypedSelector } from '../store';

export function FullCalendarWithModals() {
  const dispatch = useDispatch();
  const {
    events,
    selectedEvent,
    isLoading,
    calendarToken
  } = useTypedSelector(state => state.calendarSlice);

  const [modalVisible, setModalVisible] = useState(false);

  // Получаем токен при монтировании
  useEffect(() => {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const { calendarToken } = JSON.parse(authUser);
      dispatch(action.calendarSlice.setCalendarToken(calendarToken));
    }
  }, [dispatch]);

  // Загрузка событий
  useEffect(() => {
    const loadEvents = async () => {
      if (!calendarToken) return;
      
      dispatch(action.calendarSlice.setLoading(true));
      try {
        const googleEvents = await fetchGoogleCalendarEvents(calendarToken);
        dispatch(action.calendarSlice.setEvents(googleEvents));
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
      } finally {
        dispatch(action.calendarSlice.setLoading(false));
      }
    };

    loadEvents();
  }, [calendarToken, dispatch]);

  const handleEventClick = useCallback((clickInfo: { event: any }) => {
    const clickedEvent = events.find(e => e.id === clickInfo.event.id);
    dispatch(action.calendarSlice.setSelectedEvent(clickedEvent || null));
    setModalVisible(true);
  }, [events, dispatch]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    dispatch(action.calendarSlice.setLoading(loading));
  }, [dispatch]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    dispatch(action.calendarSlice.removeEvent(eventId));
    setModalVisible(false);
  }, [dispatch]);

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
        events={transformEvents(events)}
        eventClick={handleEventClick}
        locale="ru"
        loading={handleLoadingChange}
      />

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{ color: 'white', fontSize: '1.5rem' }}>Загрузка...</div>
        </div>
      )}

      <EventModal
        event={selectedEvent}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onDelete={selectedEvent ? () => {
          if (selectedEvent.id) {
            handleDeleteEvent(selectedEvent.id);
          }
        } : undefined}
      />
    </>
  );
}