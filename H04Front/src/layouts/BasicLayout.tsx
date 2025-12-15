import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from '@umijs/max';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { getUser, clearAuth, isLoggedIn } from '@/utils/auth';
import { navigateToMain } from '@/utils/navigate';

const { Header, Sider, Content } = Layout;

/**
 * 流程平台基础布局
 */
const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigateToMain();
    }
  }, []);

  // 根据角色生成菜单
  const getMenuItems = () => {
    const role = user?.LOAN_ROLE;
    const items = [];

    // 审核员/总审核菜单
    if (role === 'auditor' || role === 'superAuditor') {
      items.push({
        key: '/flow/audit/todo',
        icon: <ClockCircleOutlined />,
        label: '待办任务',
      });
      items.push({
        key: '/flow/audit/done',
        icon: <CheckCircleOutlined />,
        label: '已办任务',
      });
      items.push({
        key: '/flow/audit/copied',
        icon: <FileTextOutlined />,
        label: '抄送我的',
      });
    }

    // 总审核专属菜单
    if (role === 'superAuditor') {
      items.push({
        key: '/flow/config',
        icon: <SettingOutlined />,
        label: '流程配置',
      });
    }

    return items;
  };

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
          <h2 style={{ margin: 0, fontSize: collapsed ? 14 : 18, color: '#52c41a' }}>
            {collapsed ? '流程' : '流程平台'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
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
