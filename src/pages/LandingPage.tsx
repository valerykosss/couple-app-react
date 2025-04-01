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
          <Row gutter={64} align="middle" style={{ marginBottom: "100px" }}>
            <Col xs={24} md={10}>
              <Title level={1}  style={{ color: "#273e54", textTransform: "uppercase", fontWeight:'bold', lineHeight: '130%', marginBottom: '30px' }}>Meet Ease –  идеальный планировщик встреч</Title>
              <Paragraph style={{ 
                fontSize: 'clamp(14px, 2vw, 15px)',
                lineHeight: '180%'
              }}>
                Cервис предназначен для помощи парам в планировании совместного досуга. На основе событий в календаре он подбирает оптимальные временные окна для встреч. Приложение поддерживает интеграцию с Google Календарем, а также предлагает встроенный локальный календарь для удобного управления расписанием.
              </Paragraph>
            </Col>
            <Col xs={24} md={14}>
              <img src="/images/6.png" alt="Приложение" style={{ width: "100%" }} />
            </Col>
          </Row>

          <Title level={2} style={{ textAlign: "center", fontWeight:'bold', color: "#273e54", textTransform: "uppercase"  }}>Где используется приложение?</Title>
          <Paragraph style={{ textAlign: "center", marginBottom: '50px', fontSize: 'clamp(14px, 2vw, 15px)' }}>Этот сервис полезен в разных ситуациях, когда важно найти время для свиданий, не нарушая график.</Paragraph>
          <Row gutter={[16, 16]} style={{ marginBottom: "100px" }}>
            {[
              { title: "Загруженный график", text: "Когда у вас и вашего партнера плотный рабочий график, приложение поможет найти свободные слоты для совместного отдыха.", img: "/images/1.png" },
              { title: "Долгие отношения", text: "Если вы давно вместе и стали реже проводить время вдвоем, сервис подскажет удачные моменты для встреч.", img: "/images/2.png" },
              { title: "Спонтанные свидания", text: "Приложение поможет находить неожиданные окна в расписании, чтобы устроить спонтанное свидание.", img: "/images/5.png" }
            ].map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", 
                    transition: "transform 0.3s ease-in-out", 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={13}>
                      <Title level={4} style={{ color: "#1890ff" }}>{item.title}</Title>
                      <Paragraph>{item.text}</Paragraph>
                    </Col>
                    <Col span={11}>
                      <img src={item.img} alt={item.title} style={{ width: "100%", borderRadius: "8px" }} />
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <Title level={2} style={{ textAlign: "center", fontWeight:'bold', color: "#273e54", textTransform: "uppercase", marginBottom: "40px" }}>Часто задаваемые вопросы</Title>
          <Collapse accordion style={{ fontSize: 'clamp(14px, 2vw, 15px)' }} >
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