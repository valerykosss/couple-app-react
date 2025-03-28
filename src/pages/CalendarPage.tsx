import { Button, Card, Typography } from 'antd';
import { useTypedSelector } from '../store';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import handleGoogleAuth from '../api/googleAuth/googleAuth';
import { FullCalendarWithModals } from '../components/FullCalendarWithModals';

const { Title } = Typography;

export function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useTypedSelector(state => state.authSlice);

  const handleConnectGoogleCalendar = async () => {
    try {
      await handleGoogleAuth({
        isRegister: false,
        dispatch,
        navigate: () => {},
        onClose: () => {},
        showWelcomeMessage: false,
      });
    } catch (error) {
      console.error('Ошибка при подключении Google Calendar:', error);
    }
  };

  if (!authState.calendarToken) {
    return (
      <div style={{ padding: 20 }}>
        <Title level={2}>Мой календарь</Title>
        <Card style={{ marginBottom: 20 }}>
          <p>Подключите Google Календарь, чтобы видеть события</p>
          <Button 
            type="primary" 
            onClick={handleConnectGoogleCalendar}
          >
            Подключить Google Календарь
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Мой календарь</Title>
      <FullCalendarWithModals token={authState.calendarToken} />
    </div>
  );
}