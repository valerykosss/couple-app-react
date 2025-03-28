import { Button, Card, Typography } from 'antd';
import { AppDispatch, useTypedSelector } from '../store';
import { FullCalendarWithModals } from '../components/FullCalendarWithModals';
import handleGoogleAuth from '../api/googleAuth/googleAuth';
import { syncEvents } from '../utils/googleCalendarFirebaseSync';
import { useDispatch } from 'react-redux';

const { Title } = Typography;

export function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { calendarToken, id } = useTypedSelector(state => state.authSlice);

  const handleConnectGoogleCalendar = async () => {
    await handleGoogleAuth({
      isRegister: false,
      dispatch,
      navigate: () => {},
      onClose: () => {},
      showWelcomeMessage: false,
    });
    if (calendarToken && id) await syncEvents(calendarToken, id);
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Мой календарь</Title>
      <FullCalendarWithModals />
      {!calendarToken && (
        <Card style={{ marginTop: 20 }}>
          <Button type="primary" onClick={handleConnectGoogleCalendar}>
            Подключить Google Календарь
          </Button>
        </Card>
      )}
    </div>
  );
}