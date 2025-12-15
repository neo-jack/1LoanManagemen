import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from '@umijs/max';
import { Layout, Menu, Avatar, Dropdown, Button, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { getUser, clearAuth, hasHrAccess } from '@/utils/auth';
import { navigateToMain } from '@/utils/navigate';

const { Header, Sider, Content } = Layout;

/**
 * 基础布局组件
 */
const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = getUser();

  useEffect(() => {
    // 检查权限
    if (!hasHrAccess()) {
      message.error('您没有权限访问人事管理模块');
      navigateToMain();
    }
  }, []);

  // 菜单项配置
  const menuItems = [
    {
      key: '/hr/student/list',
      icon: <UserOutlined />,
      label: '学生管理',
    },
    {
      key: '/hr/auditor/list',
      icon: <TeamOutlined />,
      label: '审核员管理',
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主应用',
      onClick: () => navigateToMain(),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        clearAuth();
        navigateToMain();
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0, fontSize: collapsed ? 14 : 18 }}>
            {collapsed ? 'HR' : '人事管理'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} src={user?.USER_AVATAR} />
              <span>{user?.USER_NAME || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
