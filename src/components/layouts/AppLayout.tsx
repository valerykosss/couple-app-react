import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router";
import { Layout, Menu } from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { useTypedSelector } from "../../store";
import CommonHeader from "./CommonHeader";
import { action } from "../../store";
import { useDispatch } from "react-redux";

const { Sider, Content } = Layout;

const contentStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#eeeeee",
};

const siderStyle: React.CSSProperties = {};

const layoutStyle = {};

export default function AppLayout() {
  const token = useTypedSelector((state) => state.authSlice.token);
  const isLoggingOut = useTypedSelector((state) => state.uiSlice.isLoggingOut);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(
      `Checking conditions: token=${token}, path=${location.pathname}, isLoggingOut=${isLoggingOut}`
    );
  
    if (!token && location.pathname.startsWith("/app") && !isLoggingOut) {
      console.log("Opening auth modal");
      dispatch(action.uiSlice.setAuthModalOpen(true));
    }
  }, [token, location.pathname, dispatch, isLoggingOut]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    {
      key: "general",
      icon: <HomeOutlined />,
      label: <Link to="/app">Главная</Link>,
    },
    {
      key: "timetable",
      icon: <UserOutlined />,
      label: <Link to="/app/timetable">Расписание</Link>,
    },
  ];

  return (
    <div>
      <Layout>
        <CommonHeader />

        <Layout style={layoutStyle}>
          <Sider style={siderStyle} collapsible theme="light">
            <Menu theme="light" mode="inline" items={menuItems} />
          </Sider>

          <Layout>
            <Content style={contentStyle}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
}