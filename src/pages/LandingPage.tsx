import { Layout } from "antd";
import CommonHeader from "../components/layouts/CommonHeader";
const { Content } = Layout;

export default function LandingPage() {

  return (
    <div>
      <Layout>

        <CommonHeader />

        <Content>
          <h1>Добро пожаловать в CoupleDatePlanner</h1>
          <p>Описание лендинга</p>

        </Content>
      </Layout>
    </div>
  );
};