import { ReactNode, useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { HomeOutlined, CalendarOutlined, HeartOutlined, TableOutlined } from "@ant-design/icons";
import { Link, useLocation, Outlet } from "react-router";
import CommonHeader from "./CommonHeader";

const { Sider, Content } = Layout;

const contentStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#eeeeee",
};

const siderStyle: React.CSSProperties = {};

const layoutStyle = {};


const AppLayout = () => {
  const MENU_ITEMS = [
    {
      key: "general",
      icon: <HomeOutlined />,
      label: <Link to="/app">Главная</Link>,
      path: "/app"
    },
    {
      key: "timetable",
      icon: <HeartOutlined />,
      label: <Link to="/app/tinder">Подобрать свидание</Link>,
      path: "/app/timetable"
    },
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: <Link to="/app/calendar">Календарь</Link>,
      path: "/app/calendar"
    },
    {
      key: "dateRecords",
      icon: <TableOutlined />,
      label: <Link to="/app/dateRecords">Записи свиданий</Link>,
      path: "/app/dateRecords"
    }
  ];

  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => {
    const currentItem = MENU_ITEMS.find(
      item => location.pathname === item.path
    );
    setSelectedKey(currentItem?.key || "");
  }, [location.pathname]);


  return (
    <Layout>
      <CommonHeader />
      <Layout style={layoutStyle}>
        <Sider style={siderStyle} collapsible theme="light">
          <Menu
            selectedKeys={[selectedKey]}
            theme="light"
            mode="inline"
            items={MENU_ITEMS.map(({ path, ...rest }) => rest)}
          />
        </Sider>
        <Layout>
          <Content style={contentStyle}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;