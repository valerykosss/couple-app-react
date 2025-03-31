import CommonHeader from "../components/layouts/CommonHeader";
import { Card, Layout, Typography, Row, Col, Collapse } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;



export default function LandingPage() {
  const faqItems = [
    { question: "Что делает это приложение?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { question: "Как его использовать?", answer: "Suspendisse potenti. Vivamus pharetra cursus arcu." },
    { question: "Какие функции доступны?", answer: "Integer vel lacus a quam lobortis hendrerit." },
  ];

  return (
    <div>
      <Layout>

        <CommonHeader />

        <Content style={{ padding: "50px" }}>
        {/* Интро */}
        <Row gutter={64} align="middle" style={{ marginBottom: "50px" }}>
          <Col span={12}>
            <Title>О приложении</Title>
            <Paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.
            </Paragraph>
          </Col>
          <Col span={12}>
            <img src="https://via.placeholder.com/400" alt="Приложение" style={{ width: "100%" }} />
          </Col>
        </Row>

        {/* Описание ситуаций использования */}
        <Title level={2} style={{ textAlign: "center" }}>Где используется приложение?</Title>
        <Paragraph style={{ textAlign: "center" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Paragraph>
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((key) => (
            <Col span={8} key={key}>
              <Card>
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Title level={4}>Ситуация {key}</Title>
                    <Paragraph>Lorem ipsum dolor sit amet.</Paragraph>
                  </Col>
                  <Col span={12}>
                    <img src="https://via.placeholder.com/150" alt="Ситуация" style={{ width: "100%" }} />
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