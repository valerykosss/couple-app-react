import { message, List, Typography, Tag, Button, Card } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, action, useTypedSelector } from "../store";
import handleGoogleAuth from "../utils/googleAuth";

const { Text, Title } = Typography;

type CalendarEvent = {
  id: string;
  summary: string;
  htmlLink: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: string;
};

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const authState = useTypedSelector(state => state.authSlice);

  useEffect(() => {
    if (!authState.calendarToken) return;

    const fetchEvents = async () => {
      try {
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(now.getDate() + 7);

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${now.toISOString()}&timeMax=${weekLater.toISOString()}` +
            `&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${authState.calendarToken}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setEvents(data.items || []);
      } catch (error) {
        message.error("Ошибка загрузки событий");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [authState.calendarToken]);

  const handleConnectGoogleCalendar = async () => {
    await handleGoogleAuth({
      isRegister: false,
      dispatch,
      navigate: () => {},
      onClose: () => {},
      showWelcomeMessage: false,
    });
  };
  
  return (
    <div>
      <Title level={2}>Мои события в календаре</Title>
      {!authState.calendarToken ? (
        <Card style={{ marginBottom: 20 }}>
          <p>Подключите Google Календарь, чтобы видеть события.</p>
          <Button type="primary" onClick={handleConnectGoogleCalendar}>
            Подключить Google Календарь
          </Button>
        </Card>
      ) : (
        <List
          loading={loading}
          dataSource={events}
          renderItem={(event) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{event.summary}</Text>}
                description={
                  <>
                    <div>
                      <Tag color={event.status === "confirmed" ? "green" : "orange"}>
                        {event.status === "confirmed" ? "Подтверждено" : "Требуется подтверждение"}
                      </Tag>
                    </div>
                    <div>
                      🕒 {new Date(event.start.dateTime).toLocaleString("ru-RU", {
                        timeZone: event.start.timeZone,
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default CalendarPage;