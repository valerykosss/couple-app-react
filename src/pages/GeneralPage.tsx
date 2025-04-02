import React, { useState } from "react";
import { Avatar, Button, Card, List, Typography, Space, Input, Col, Row } from "antd";
import { HeartOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function GeneralPage() {
    const [partner, setPartner] = useState("");
  const [email, setEmail] = useState("");
  const [dates] = useState([
    { id: 1, title: "Романтический ужин", date: "10 апреля 2025" },
    { id: 2, title: "Прогулка в парке", date: "15 апреля 2025" },
  ]);

  return (
    <Row style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <Col xs={24} sm={16} md={14} lg={12} xl={10} style={{ padding: "20px" }}>
        <Space align="center" size={12}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>Имя пользователя</Title>
            {partner && <Typography.Text style={{ color: "#888" }}>В паре с {partner}</Typography.Text>}
          </div>
        </Space>

        <div style={{ marginTop: "20px" }}>
          {partner ? (
            <Card hoverable style={{ textAlign: "center", padding: "20px" }}>
              <HeartOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
              <Title level={5} style={{ marginTop: 10 }}>Подобрать свидание и время</Title>
            </Card>
          ) : (
            <Card style={{ textAlign: "center", padding: "20px" }}>
              <PlusOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <Title level={5}>Добавьте Вашего партнера для полноценного использования приложения</Title>
              <Input 
                placeholder="Введите email партнера"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <Button type="primary" onClick={() => setPartner(email)}>Присоединить</Button>
            </Card>
          )}
        </div>

        {partner && dates.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <Title level={5}>Ближайшие свидания</Title>
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
        )}
      </Col>

      <Col xs={24} sm={8} md={10} lg={12} xl={14} style={{ backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <img src="images/1.png" alt="Romantic theme" style={{ width: "auto", height: "75%"}} />
      </Col>
    </Row>
  );
}