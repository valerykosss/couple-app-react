import { message, List, Typography, Tag } from "antd";
import { useEffect, useState } from "react";

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
}

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const authData = localStorage.getItem("authUser");
        if (!authData) throw new Error("Требуется авторизация");
        
        const { googleAccessToken } = JSON.parse(authData);
        
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(now.getDate() + 7);

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${now.toISOString()}&timeMax=${weekLater.toISOString()}` +
          `&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
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
  }, []);

  const formatDateTime = (dateTime: string, timeZone: string) => {
    return new Date(dateTime).toLocaleString("ru-RU", {
      timeZone: timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <Title level={2}>Мои события в календаре</Title>
      
      <List
        loading={loading}
        dataSource={events}
        renderItem={(event) => (
          <List.Item
            actions={[
              // <a 
              //   href={event.htmlLink} 
              //   target="_blank" 
              //   rel="noopener noreferrer"
              // >
              //   Открыть в календаре
              // </a>
            ]}
          >
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
                    🕒 {formatDateTime(event.start.dateTime, event.start.timeZone)}
                    {" → "}
                    {formatDateTime(event.end.dateTime, event.end.timeZone)}
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default CalendarPage;