// 高校学生助学贷款管理系统登录页面
import { TokenManager } from '@/models/usetoken';
import { userInfoWatcher } from '@/models/useuser';
import { login } from '@/services/user/login';

import {
  BankOutlined,
  FileTextOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Space, Typography } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './index.less';

const { Title, Text, Paragraph } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 测试账号数据
  const testAccounts = [
    { role: '总审核', username: 'root1', password: '123' },
    { role: '审核', username: 'root2', password: '123' },
    { role: '学生', username: 'root3', password: '123' },
  ];

  // 一键填充测试账号
  const fillTestAccount = (username: string, password: string) => {
    form.setFieldsValue({ username, password });
  };

  const onFinish = async (values: LoginForm) => {
    console.log('[Login Page] 开始登录流程');
    console.log('[Login Page] 用户名:', values.username);
    console.log('[Login Page] 原始密码长度:', values.password.length);
    setLoading(true);

    try {
      // 注意：login函数内部已经会进行MD5加密
      // 这里直接传入明文密码，由login函数负责加密
      console.log('[Login Page] 调用登录API');
      const response = await login(values);

      console.log('[Login Page] 原始响应对象:', response);
      console.log('[Login Page] 响应类型:', typeof response);
      console.log('[Login Page] 响应code:', response?.code);
      console.log('[Login Page] 响应data:', response?.data);
      console.log('[Login Page] 响应msg:', response?.msg);

      if (response && response.code === 0 && response.data) {
        console.log('[Login Page] ✅ 登录响应成功');
        console.log('[Login Page] 完整响应数据:', response.data);
        console.log(
          '[Login Page] AccessToken存在:',
          !!response.data.AccessToken,
        );
        console.log(
          '[Login Page] AccessToken长度:',
          response.data.AccessToken
            ? response.data.AccessToken.length
            : 'undefined',
        );
        console.log(
          '[Login Page] RefreshToken存在:',
          !!response.data.RefreshToken,
        );
        console.log(
          '[Login Page] RefreshToken长度:',
          response.data.RefreshToken
            ? response.data.RefreshToken.length
            : 'undefined',
        );
        console.log('[Login Page] ExpiresIn:', response.data.ExpiresIn);

        // 验证必要的字段是否存在
        if (!response.data.AccessToken || !response.data.RefreshToken) {
          console.error('[Login Page] 缺少必要的token字段');
          console.error('[Login Page] AccessToken:', response.data.AccessToken);
          console.error(
            '[Login Page] RefreshToken:',
            response.data.RefreshToken,
          );
          message.error('登录响应数据不完整');
          return;
        }

        // 登录成功，使用TokenManager保存令牌信息
        TokenManager.updateTokens(
          response.data.AccessToken,
          response.data.ExpiresIn || 3600,
          response.data.RefreshToken,
        );

        // 保存用户信息到 localStorage 并通知 userInfoWatcher
        localStorage.setItem('userInfo', JSON.stringify(response.data.USER));
        userInfoWatcher.forceUpdate(response.data.USER);
        console.log(
          '[Login Page] 用户信息已保存并通知所有监听器:',
          response.data.USER,
        );

        message.success(response.msg || '登录成功！');
        console.log('[Login Page] 准备跳转到工作台');
        navigate('/xt/workboard');
      } else {
        console.log('[Login Page] 登录响应失败:', response);
        message.error(response.msg || '登录失败！');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      message.error(error.message || '网络错误，请稍后重试！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.medicalLoginContainer}>
      {/* 左侧品牌区域 */}
      <div className={styles.leftPanel}>
        <div className={styles.brandSection}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <BankOutlined className={styles.medicineIcon} />
            </div>
            <Title level={1} className={styles.brandTitle}>
              助学贷款管理系统
            </Title>
            <Text className={styles.brandSubtitle}>
              高校学生助学贷款综合管理平台
            </Text>
          </div>

          <div className={styles.featureSection}>
            <div className={styles.featureItem}>
              <FileTextOutlined className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <Text strong className={styles.featureTitle}>
                  便捷申请
                </Text>
                <Text className={styles.featureDesc}>
                  在线提交贷款申请，资料一键上传
                </Text>
              </div>
            </div>

            <div className={styles.featureItem}>
              <TeamOutlined className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <Text strong className={styles.featureTitle}>
                  高效审批
                </Text>
                <Text className={styles.featureDesc}>
                  多级审批流程，实时跟踪进度
                </Text>
              </div>
            </div>

            <div className={styles.featureItem}>
              <SafetyCertificateOutlined className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <Text strong className={styles.featureTitle}>
                  安全可靠
                </Text>
                <Text className={styles.featureDesc}>
                  数据加密传输，保障信息安全
                </Text>
              </div>
            </div>
          </div>

          <div className={styles.bottomText}>
            <Text className={styles.copyright}>
              © 2024 高校学生助学贷款管理系统. All rights reserved.
            </Text>
          </div>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className={styles.rightPanel}>
        <div className={styles.loginSection}>
          <div className={styles.formHeader}>
            <Title level={2} className={styles.welcomeTitle}>
              欢迎回来
            </Title>
            <Text className={styles.welcomeSubtitle}>
              请登录您的账户以继续使用平台
            </Text>
          </div>

          <Form
            name="login"
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            className={styles.loginForm}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
              className={styles.formItem}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="请输入用户名"
                className={styles.customInput}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码!' }]}
              className={styles.formItem}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="请输入密码"
                className={styles.customInput}
              />
            </Form.Item>

            <Form.Item className={styles.submitItem}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className={styles.loginButton}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className={styles.divider}>
            <Text type="secondary">测试账号</Text>
          </Divider>

          <div className={styles.testAccount}>
            <Space
              direction="vertical"
              size="small"
              className={styles.accountInfo}
            >
              {testAccounts.map((account, index) => (
                <div key={index} className={styles.accountItem}>
                  <Text strong className={styles.roleText}>
                    {account.role}
                  </Text>
                  <Button
                    type="primary"
                    size="small"
                    className={styles.loginButton}
                    onClick={() =>
                      fillTestAccount(account.username, account.password)
                    }
                  >
                    登录
                  </Button>
                </div>
              ))}
            </Space>
          </div>

          <div className={styles.helpSection}>
            <Text className={styles.helpText}>遇到问题？请联系系统管理员</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
