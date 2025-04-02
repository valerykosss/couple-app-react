import { Button, Card, Col, message, Row, Typography } from 'antd';
import { action, AppDispatch, useTypedSelector } from '../store';
import handleGoogleAuth, { connectGoogleCalendar } from '../utils/googleAuth';
import { migrateLocalEventsToGoogle, syncGoogleCalendarToFirestore } from '../utils/syncGoogleCalendarToFirestore';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getUser, getUserCouples, subscribeToUserEvents } from '../api/firebase/firebase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import EventCalendarModal from '../components/EventCalendarModal';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { handleUpdateEvent } from '../utils/eventFullCalendarHandlers';
import { EventApi, EventClickArg, EventDropArg } from '@fullcalendar/core';

const { Title } = Typography;

export function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { events, partnerEvents, partnerId } = useTypedSelector((state) => state.calendarSlice);
  const modalState = useTypedSelector((state) => state.eventModalSlice);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [showConnectCard, setShowConnectCard] = useState(false);

  const authUser = localStorage.getItem('authUser');
  if (!authUser) {
    message.error("Не удалось найти данные пользователя.");
    return null;
  }

  const parsedAuthUser = JSON.parse(authUser);
  const userId = parsedAuthUser.id;
  const accessToken = parsedAuthUser.accessToken;
  const refreshToken = parsedAuthUser.refreshToken;

  useEffect(() => {
    let unsubscribeUser = () => { };
    let unsubscribePartner = () => { };

    const loadData = async () => {
      if (!userId) {
        message.error("Не удалось найти userId.");
        return;
      }

      if (accessToken && refreshToken) {
        setHasGoogleAuth(true);
        setShowConnectCard(false);
        await syncGoogleCalendarToFirestore();
      } else {
        const userData = await getUser(userId);
        setHasGoogleAuth(!!userData?.accessToken);
        setShowConnectCard(!userData?.accessToken);
      }

      const couples = await getUserCouples(userId);
      const partnerId = couples[0]?.usersId.find(id => id !== userId) ?? null;
      dispatch(action.calendarSlice.setPartnerId(partnerId));

      unsubscribeUser = subscribeToUserEvents(
        userId,
        dispatch,
        action.calendarSlice.setEvents
      );

      if (partnerId) {
        unsubscribePartner = subscribeToUserEvents(
          partnerId,
          dispatch,
          action.calendarSlice.setPartnerEvents
        );
      }
    };

    loadData().catch(error => {
      console.error("Ошибка загрузки:", error);
      message.error("Ошибка загрузки календаря");
    });

    return () => {
      unsubscribeUser();
      unsubscribePartner();
    };
  }, [dispatch, accessToken, refreshToken, userId]);


  const handleConnectGoogleCalendar = async () => {
    try {
      await connectGoogleCalendar(dispatch);
      setShowConnectCard(false);
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        throw new Error("Данные пользователя не найдены");
      }

      const parsedAuthUser = JSON.parse(authUser);
      const accessToken = parsedAuthUser.accessToken;

      const migrationResult = await migrateLocalEventsToGoogle(
        userId,
        accessToken
      );

      if (migrationResult.success) {
        message.success(`Успешно мигрировано ${migrationResult.migratedCount} событий`);
        setHasGoogleAuth(true);
        await syncGoogleCalendarToFirestore();
      } else {
        message.warning(
          `Мигрировано ${migrationResult.migratedCount} событий, ` +
          `${migrationResult.errors.length} с ошибками`
        );
      }

      setHasGoogleAuth(true);
      message.success("Google Calendar успешно подключен");
    } catch (error) {
      message.error("Не удалось подключить Google Calendar");
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    if (!info.event.extendedProps.canEdit) {
      info.revert();
      return;
    }

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
        () => { } //заглушка для setLoading
      );
    } catch (error) {
      console.error("Ошибка обновления при перетаскивании:", error);
      info.revert(); //откат, если не удалось обновить
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    if (!info.event.extendedProps.canEdit) {
      info.revert();
      return;
    }

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
        () => { }
      );
    } catch (error) {
      console.error("Ошибка обновления при изменении размера:", error);
      info.revert();
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    if (!info.event.extendedProps.canEdit || !info.event.id) {
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
  };

  const mappedEvents = [
    ...events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime,
      end: event.end?.dateTime || event.start.dateTime,
      backgroundColor: "#3788d8",
      borderColor: "#3788d8",
      textColor: "#ffffff",
      extendedProps: {
        canEdit: true
      }
    })),
    ...partnerEvents.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime,
      end: event.end?.dateTime || event.start.dateTime,
      backgroundColor: "#ff9f89",
      borderColor: "#ff9f89",
      textColor: "#000000",
      extendedProps: {
        canEdit: false
      }
    }))
  ];

  const isEventEditable = (event: EventApi): boolean => {
    return event.extendedProps['canEdit'] === true;
  };

  return (
    <div className="calendar-page">
      {showConnectCard && (
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
            eventClick={handleEventClick}
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
