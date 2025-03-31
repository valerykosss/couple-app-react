import CommonHeader from "../components/layouts/CommonHeader";
import { Card, Layout, Typography, Row, Col, Collapse } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;



export default function LandingPage() {
  const faqItems = [
    { question: "Что делает это приложение?", answer: "Этот сервис помогает парам находить свободное время для свиданий на основе их событий в календаре. Он работает как с Google Календарем, так и с локальным календарем в приложении." },
    { question: "Как его использовать?", answer: "Вы подключаете свой календарь, указываете предпочтительное время для свиданий, и сервис автоматически предлагает подходящие варианты." },
    { question: "Какие функции доступны?", answer: "Синхронизация с календарем, рекомендации времени для встреч, напоминания и интеграция с популярными сервисами." },
  ];


  return (
    <div>
      <Layout>

        <CommonHeader />

        <Content style={{ padding: "50px" }}>
        {/* Интро */}
        <Row gutter={64} align="middle" style={{ marginBottom: "50px" }}>
          <Col xs={24} md={12}>
            <Title>О приложении</Title>
            <Paragraph>
              Наш сервис предназначен для помощи парам в планировании совместного досуга. На основе событий в календаре он подбирает оптимальные временные окна для встреч. Приложение поддерживает интеграцию с Google Календарем, а также предлагает встроенный локальный календарь для удобного управления расписанием.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <img src="https://via.placeholder.com/400" alt="Приложение" style={{ width: "100%" }} />
          </Col>
        </Row>

        {/* Описание ситуаций использования */}
        <Title level={2} style={{ textAlign: "center" }}>Где используется приложение?</Title>
        <Paragraph style={{ textAlign: "center" }}>Этот сервис полезен в разных ситуациях, когда важно найти время для свиданий, не нарушая график.</Paragraph>
        <Row gutter={[16, 16]}>
          {[ 
            { title: "Загруженный график", text: "Когда у вас и вашего партнера плотный рабочий график, приложение поможет найти свободные слоты для совместного отдыха.", img: "https://via.placeholder.com/150" },
            { title: "Долгие отношения", text: "Если вы давно вместе и стали реже проводить время вдвоем, сервис подскажет удачные моменты для встреч.", img: "https://via.placeholder.com/150" },
            { title: "Спонтанные свидания", text: "Приложение поможет находить неожиданные окна в расписании, чтобы устроить спонтанное свидание.", img: "https://via.placeholder.com/150" }
          ].map((item, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: "8px", // Закругленные углы
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Тень для эффекта выпуклости
                  transition: "transform 0.3s ease-in-out", // Плавная анимация при наведении
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)"; // Увеличение карточки при наведении
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"; // Возврат к исходному размеру
                }}
              >
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Title level={4} style={{ color: "#1890ff" }}>{item.title}</Title> {/* Цвет заголовка */}
                    <Paragraph>{item.text}</Paragraph>
                  </Col>
                  <Col span={12}>
                    <img src={item.img} alt={item.title} style={{ width: "100%", borderRadius: "8px" }} /> {/* Закругленные углы у изображений */}
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
                {/* FAQ */}
                <Title level={2} style={{ marginTop: "50px" }}>Часто задаваемые вопросы</Title>
        <Collapse accordion>
          {faqItems.map((item, index) => (
            <Panel header={item.question} key={index.toString()}>
              <Paragraph>{item.answer}</Paragraph>
            </Panel>
          ))}
        </Collapse>
      </Content>



      </Layout>
    </div>
  );
};