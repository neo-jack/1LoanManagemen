import { clearAuth, getUser, isLoggedIn } from "@/utils/auth";
import { navigateToMain } from "@/utils/navigate";
import {
  AuditOutlined,
  BranchesOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "@umijs/max";
import { Avatar, Button, Dropdown, Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";

const { Header, Sider, Content } = Layout;

/**
 * 贷款模块基础布局
 */
const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = getUser();

  useEffect(() => {
    console.log("[H03 BasicLayout] 当前路由:", location.pathname);
    console.log("[H03 BasicLayout] 用户信息:", user);
    console.log("[H03 BasicLayout] 用户角色:", user?.LOAN_ROLE);
    console.log("[H03 BasicLayout] 是否登录:", isLoggedIn());

    if (!isLoggedIn()) {
      console.log("[H03 BasicLayout] 未登录，跳转到主应用");
      navigateToMain();
    }
  }, [location.pathname]);

  // 根据角色生成菜单
  const getMenuItems = () => {
    const role = user?.LOAN_ROLE;
    const items = [];

    // 学生菜单
    if (role === "student") {
      items.push({
        key: "/loan/apply/list",
        icon: <FileTextOutlined />,
        label: "我的申请",
      });
    }

    // 审核员/总审核菜单
    if (role === "auditor" || role === "superAuditor") {
      items.push({
        key: "/loan/audit/list",
        icon: <AuditOutlined />,
        label: "待审核列表",
      });
    }

    // 总审核专属菜单
    if (role === "superAuditor") {
      items.push({
        key: "/loan/form-config",
        icon: <SettingOutlined />,
        label: "表单设置",
      });
      items.push({
        key: "/loan/flow-config",
        icon: <BranchesOutlined />,
        label: "流程设置",
      });
    }

    return items;
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "返回主应用",
      onClick: () => navigateToMain(),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => {
        clearAuth();
        navigateToMain();
      },
    },
  ];

  const getRoleLabel = () => {
    const role = user?.LOAN_ROLE;
    if (role === "student") return "学生";
    if (role === "auditor") return "审核员";
    if (role === "superAuditor") return "总审核";
    return "";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: collapsed ? 14 : 18,
              color: "#1890ff",
            }}
          >
            {collapsed ? "贷款" : "贷款管理"}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => {
            console.log("[H03 Menu] 点击菜单:", key);
            console.log("[H03 Menu] 当前 URL:", window.location.href);
            console.log("[H03 Menu] 准备导航到:", key);
            navigate(key);
            setTimeout(() => {
              console.log("[H03 Menu] 导航后 URL:", window.location.href);
            }, 100);
          }}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Avatar icon={<UserOutlined />} src={user?.USER_AVATAR} />
              <span>{user?.USER_NAME || "用户"}</span>
              <span style={{ color: "#999", fontSize: 12 }}>
                ({getRoleLabel()})
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
