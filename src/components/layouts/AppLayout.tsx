import { ReactNode } from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router"; // <-- исправленный импорт
import CommonHeader from "./CommonHeader";
import { Outlet } from "react-router";

const { Sider, Content } = Layout;

const contentStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#eeeeee",
};

const siderStyle: React.CSSProperties = {};

const layoutStyle = {};

export default function AppLayout() {
  const menuItems = [
    {
      key: "general",
      icon: <HomeOutlined />,
      label: <Link to="/app">Главная</Link>,
    },
    {
      key: "timetable",
      icon: <UserOutlined />,
      label: <Link to="/app/timetable">Расписание</Link>
    },
  ];

  return (
    <Layout>
      <CommonHeader />
      <Layout style={layoutStyle}>
        <Sider style={siderStyle} collapsible theme="light">
          <Menu defaultSelectedKeys={["general"]} theme="light" mode="inline" items={menuItems} />
        </Sider>
        <Layout>
          <Content style={contentStyle}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}