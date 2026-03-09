import { PageContainer } from '@ant-design/pro-components';

import { TokenManager } from '@/models/usetoken';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './index.less';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 使用TokenManager清除所有令牌
    TokenManager.clearTokens();
    message.success('退出登录成功！');
    navigate('/login');
  };

  // 获取用户信息
  const userInfo = sessionStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;

  return (
    <PageContainer
      ghost
      extra={[
        <Button key="logout" onClick={handleLogout}>
          退出登录
        </Button>,
      ]}
    >
      <div className={styles.container}>
        {user && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              background: '#f6f8fa',
              borderRadius: 8,
            }}
          >
            <h3>欢迎回来，{user.USER_NAME || user.name}！</h3>
            <p>用户角色：{user.USER_ROLE || user.role}</p>
            <p>医院：{user.HOSPITAL_CNAME || '未设置'}</p>
            <p>权限路由：{user.routes?.join(', ') || '无'}</p>
            <p>按钮权限：{user.buttons?.join(', ') || '无'}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default HomePage;
