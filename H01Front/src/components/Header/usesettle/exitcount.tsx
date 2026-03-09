import { TokenManager } from '@/models/usetoken';
import useUser from '@/models/useuser';
import { workBoardManager } from '@/models/useworkboard';
import { logout } from '@/services/user/logout';
import { message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseExitAccountResult {
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

const useExitAccount = (): UseExitAccountResult => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      if (!userInfo?.USER_ID) {
        message.error('用户信息无效，请重新登录');
        workBoardManager.clearData();
        TokenManager.clearTokens();
        navigate('/login');
        return;
      }

      const response = await logout({});

      if (response.code === 0) {
        message.success(response.msg || '退出登录成功');
        workBoardManager.clearData();
        TokenManager.clearTokens();
        navigate('/login');
      } else {
        console.error('Logout API failed:', response);
        message.error(response.msg || '退出登录发生错误');
        workBoardManager.clearData();
        TokenManager.clearTokens();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error('网络错误，退出登录失败');
      workBoardManager.clearData();
      TokenManager.clearTokens();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleLogout };
};

export default useExitAccount;
