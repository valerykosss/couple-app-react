import React, { useState, useEffect } from "react";
import { Avatar, Button, Card, List, Typography, Space, Input, Col, Row, message } from "antd";
import { HeartOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { collection, addDoc } from "firebase/firestore";
import { addUserToCouple, createCouple, db, getUserByEmail, getUserCouples } from "../api/firebase/firebase";
import { action, useTypedSelector } from "../store";
import { useDispatch } from "react-redux";

const { Title } = Typography;

export default function GeneralPage() {
  const dispatch = useDispatch();
  const { id: userId } = useTypedSelector(state => state.authSlice);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [dates] = useState([
    { id: 1, title: "Романтический ужин", date: "10 апреля 2025" },
    { id: 2, title: "Прогулка в парке", date: "15 апреля 2025" },
  ]);

  useEffect(() => {
    const fetchCouple = async () => {
      if (!userId) return;
      try {
        const couples = await getUserCouples(userId);
        if (couples.length > 0) {
          const currentPartnerId = couples[0].usersId.find(id => id !== userId) ?? null;
          setPartnerId(currentPartnerId);
          setCoupleId(couples[0].id);
          dispatch(action.calendarSlice.setPartnerId(currentPartnerId));
        }
      } catch (error) {
        console.error("Ошибка загрузки пары:", error);
      }
    };

    fetchCouple();
  }, [userId, dispatch]);

  // Отправка приглашения
  const sendInvitation = async () => {
    if (!email) {
      message.error("Введите email партнера");
      return;
    }
  
    setLoading(true);
    try {
      const partnerUser = await getUserByEmail(email);
      if (!partnerUser) {
        message.error("Пользователь с таким email не найден");
        return;
      }

      if (!userId) {
        throw new Error("userId не может быть null");
      }
  
      const existingCouples = await getUserCouples(userId);
      if (existingCouples.length > 0) {
        message.error("У вас уже есть пара!");
        setLoading(false);
        return;
      }
  
      // Создаем новую пару
      const newCoupleId = await createCouple(userId);
      await addUserToCouple(newCoupleId, partnerUser.id);
      setCoupleId(newCoupleId);
      setPartnerId(partnerUser.id);
      dispatch(action.calendarSlice.setPartnerId(partnerUser.id));
  
      message.success("Партнер добавлен!");
    } catch (error) {
      console.error("Ошибка добавления партнера:", error);
      message.error("Не удалось добавить партнера");
    }
    setLoading(false);
  };

  return (
    <Row style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <Col xs={24} sm={16} md={14} lg={12} xl={10} style={{ padding: "20px" }}>
        <Space align="center" size={12}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>Мой аккаунт</Title>
            {partnerId && <Typography.Text style={{ color: "#888" }}>В паре</Typography.Text>}
          </div>
        </Space>

        {/* Если партнер есть - показываем блок с датами */}
        {partnerId ? (
          <div style={{ marginTop: "20px" }}>
            <Card hoverable style={{ textAlign: "center", padding: "20px" }}>
              <HeartOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
              <Title level={5} style={{ marginTop: 10 }}>Подобрать свидание и время</Title>
            </Card>

            <Title level={5} style={{ marginTop: "20px" }}>Ближайшие свидания</Title>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={dates}
              renderItem={(item) => (
                <List.Item>
                  <Card hoverable title={item.title}>{item.date}</Card>
                </List.Item>
              )}
            />
          </div>
        ) : (
          // Если партнера нет - показываем блок с добавлением
          <Card style={{ textAlign: "center", padding: "20px", marginTop: "20px" }}>
            <PlusOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <Title level={5}>Добавьте Вашего партнера для полноценного использования приложения</Title>
            <Input
              placeholder="Введите email партнера"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <Button type="primary" onClick={sendInvitation} loading={loading}>
              Отправить приглашение
            </Button>
          </Card>
        )}
      </Col>

      <Col xs={24} sm={8} md={10} lg={12} xl={14} style={{ backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <img src="images/1.png" alt="Romantic theme" style={{ width: "auto", height: "75%" }} />
      </Col>
    </Row>
  );
}