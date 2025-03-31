import { Button, Card, Col, message, Row, Typography } from 'antd';
import { action, AppDispatch, useTypedSelector } from '../store';
import handleGoogleAuth, { connectGoogleCalendar } from '../utils/googleAuth';
import { syncGoogleCalendarToFirestore } from '../utils/syncGoogleCalendarToFirestore';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { subscribeToUserEvents } from '../api/firebase/firebase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import EventCalendarModal from '../components/EventCalendarModal';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { handleUpdateEvent } from '../utils/eventFullCalendarHandlers';
import { EventDropArg } from '@fullcalendar/core';

const { Title } = Typography;

export function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const events = useTypedSelector((state) => state.calendarSlice.events);
  const modalState = useTypedSelector((state) => state.eventModalSlice);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  
  const authUser = localStorage.getItem('authUser');
  if (!authUser) {
    message.error("Не удалось найти данные пользователя.");
    return null;
  }

  const parsedAuthUser = JSON.parse(authUser);
  const userId = parsedAuthUser.id;
  const accessToken = parsedAuthUser.accessToken;
  const refreshToken = parsedAuthUser.refreshToken;

  const handleConnectGoogleCalendar = async () => {
    try {
      await connectGoogleCalendar(dispatch);
      setHasGoogleAuth(true);
      message.success("Google Calendar успешно подключен");
    } catch (error) {
      message.error("Не удалось подключить Google Calendar");
    }
  };

  useEffect(() => {
    if (accessToken && refreshToken) {
      setHasGoogleAuth(true);
      syncGoogleCalendarToFirestore();
    }

    if (!userId) {
      message.error("Не удалось найти userId.");
      return;
    }

    const unsubscribe = subscribeToUserEvents(userId, dispatch);

    return () => unsubscribe();
  }, [dispatch, accessToken, refreshToken, userId]);

  
  const handleEventDrop = async (info: EventDropArg) => {
    const { event } = info;
  
    if (!event.id) {
      console.error("Событие не содержит ID:", event);
      return;
    }
  
    try {
      await handleUpdateEvent(
        { title: event.title || "" },
        {
          id: event.id,
          start: event.start?.toISOString() || "",
          end: event.end?.toISOString() || event.start?.toISOString() || "",
        },
        dispatch,
        null,
        () => {} //заглушка для setLoading
      );
    } catch (error) {
      console.error("Ошибка обновления при перетаскивании:", error);
      info.revert(); //откат, если не удалось обновить
    }
  };
  
  const handleEventResize = async (info: EventResizeDoneArg) => {
    const { event } = info;
  
    if (!event.id) {
      console.error("Событие не содержит ID:", event);
      return;
    }
  
    try {
      await handleUpdateEvent(
        { title: event.title || "" },
        {
          id: event.id,
          start: event.start?.toISOString() || "",
          end: event.end?.toISOString() || event.start?.toISOString() || "",
        },
        dispatch,
        null,
        () => {}
      );
    } catch (error) {
      console.error("Ошибка обновления при изменении размера:", error);
      info.revert();
    }
  };


  const mappedEvents = events.map(event => ({
    id: event.id,
    title: event.summary, 
    start: event.start.dateTime,
    end: event.end?.dateTime || event.start.dateTime,
    backgroundColor: "#3788d8",
    borderColor: "#3788d8", 
    textColor: "#ffffff"
  }));

  return (
    <div className="calendar-page">
      {!hasGoogleAuth && (
        <Row justify="center" style={{ margin: '20px' }}>
          <Col span={24} md={18} lg={12}>
            <Card 
              title="Интеграция с Google Calendar" 
              actions={[
                <Button 
                  type="primary" 
                  onClick={handleConnectGoogleCalendar}
                >
                  Подключить Google Calendar
                </Button>
              ]}
            >
              <p>Подключите ваш Google Calendar для синхронизации событий</p>
            </Card>
          </Col>
        </Row>
      )}
      
      <Row justify="center" style={{ padding: '20px' }}>
      <Col span={24} style={{ padding: '20px' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} 
        initialView="dayGridMonth" 
        locales={[ruLocale]} 
        locale="ru" 
        editable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventResizableFromStart={true}
        events={mappedEvents}
        headerToolbar={{
          left: 'prev,next today', 
          center: 'title', 
          right: 'dayGridMonth,timeGridWeek', 
        }}
        views={{
          dayGridMonth: {
            buttonText: 'Месяц', 
            titleFormat: { year: 'numeric', month: 'long' },
            selectable: false,
          },
          timeGridWeek: {
            buttonText: 'Неделя',
            selectable: true,
          },
        }}
        eventClick={(info) => {
          if (!info.event.id) {
            console.error("Event missing ID:", info.event);
            return;
          }
          dispatch(
            action.eventModalSlice.showEditDeleteModal({
              id: info.event.id,
              title: info.event.title,
              start: info.event.startStr,
              end: info.event.endStr,
            })
          );
        }}
        contentHeight="500px"
        selectable={true}
        select={(info) => {
          const calendarApi = info.view.calendar;
          const currentView = calendarApi.view.type;
          
          if (currentView === 'timeGridWeek') {
            dispatch(
              action.eventModalSlice.showCreateModal({
                start: info.startStr,
                end: info.endStr,
              })
            );
          }
        }}
      />
    </Col>
  </Row>

  <EventCalendarModal 
    visible={modalState.isVisible} 
    eventData={modalState.eventData} 
    modalType={modalState.modalType}
  />
    </div>
  );
}
