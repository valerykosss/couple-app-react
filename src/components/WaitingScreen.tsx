import { Spin, Typography } from "antd";

const { Title, Text } = Typography;

export const WaitingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center'
  }}>
    <Spin size="large" />
    <Title level={4} style={{ marginTop: 20 }}>
      Ожидаем, пока партнер завершит выбор
    </Title>
    <Text type="secondary">
      Мы уведомим вас, когда можно будет выбрать свидание
    </Text>
  </div>
);