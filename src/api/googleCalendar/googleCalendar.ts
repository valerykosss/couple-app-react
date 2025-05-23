import { message } from "antd";
import { CalendarEventType } from "../../types/calendar";

const BASE_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

async function doFetch<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  token: string,
  body?: any
) {
  try {
    const response = await fetch(path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Ошибка при выполнении запроса"
      );
    }

    if (method === "DELETE") {
      return null as unknown as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    message.error(
      error instanceof Error ? error.message : "Неизвестная ошибка"
    );
    throw error;
  }
}

export async function fetchGoogleCalendarEvents(token: string) {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  const path = `${BASE_URL}?timeMin=${now.toISOString()}&timeMax=${endOfYear.toISOString()}&singleEvents=true&orderBy=startTime`;

  const data = await doFetch<{ items: CalendarEventType[] }>(
    path,
    "GET",
    token
  );

  return data.items || [];
}

export async function createGoogleCalendarEvent(
  token: string,
  event: Omit<CalendarEventType, "id">
) {
  const data = await doFetch<CalendarEventType>(BASE_URL, "POST", token, event);

  if (!data || !data.id) {
    throw new Error("Ошибка: API не вернуло корректный ID события");
  }

  message.success("Событие успешно создано");
  return {
    id: data.id,
    summary: data.summary,
    start: data.start,
    end: data.end,
    status: data.status,
    htmlLink: data.htmlLink,
  };
}

export async function updateGoogleCalendarEvent(
  token: string,
  event: Partial<CalendarEventType> & { id: string }
) {
  const data = await doFetch<CalendarEventType>(
    `${BASE_URL}/${event.id}`,
    "PUT",
    token,
    {
      summary: event.summary,
      start: event.start,
      end: event.end,
    }
  );
  message.success("Событие успешно обновлено");
  return {
    id: data.id,
    summary: data.summary,
    start: data.start,
    end: data.end,
    status: data.status,
    htmlLink: data.htmlLink,
  };
}

export async function deleteGoogleCalendarEvent(
  token: string,
  eventId: string
) {
  try {
    await doFetch<void>(`${BASE_URL}/${eventId}`, "DELETE", token);
    message.success("Событие успешно удалено из Google Calendar");
    return true;
  } catch (error) {
    console.error("Ошибка удаления из Google Calendar:", error);
    message.error("Не удалось удалить событие из Google Calendar");
    throw error;
  }
}

export function hasGoogleCalendarAccess(): boolean {
  try {
    const { accessToken, refreshToken } = JSON.parse(
      localStorage.getItem("authUser") || "{}"
    );
    return Boolean(accessToken && refreshToken);
  } catch {
    return false;
  }
}
