/*
//-------------------------------------//
//           用户信息监控   
//             
//-------------------------------------//
*/

import { USER_INFO } from '@/constants';
import { useCallback, useEffect, useState } from 'react';

// 用户信息变化监听器类型
type UserInfoListener = (userInfo: typeof USER_INFO) => void;

/**
 * 用户信息监控管理器
 * 负责监控用户信息变化并通知所有监听器
 */
export class UserInfoWatcher {
  private static instance: UserInfoWatcher;
  private listeners: Set<UserInfoListener> = new Set();
  private currentUserInfo: typeof USER_INFO;

  private constructor() {
    // 初始化时从localStorage获取用户信息
    this.currentUserInfo = this.getUserInfoFromStorage();

    // 监听localStorage变化
    this.setupStorageListener();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): UserInfoWatcher {
    if (!UserInfoWatcher.instance) {
      UserInfoWatcher.instance = new UserInfoWatcher();
    }
    return UserInfoWatcher.instance;
  }

  /**
   * 从localStorage获取用户信息
   */
  private getUserInfoFromStorage(): typeof USER_INFO {
    try {
      const savedUserInfo = sessionStorage.getItem('userInfo');
      if (savedUserInfo) {
        return JSON.parse(savedUserInfo);
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
    return { ...USER_INFO };
  }

  /**
   * 设置localStorage监听器
   */
  private setupStorageListener(): void {
    // 监听storage事件（跨标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key === 'userInfo' && e.newValue) {
        try {
          const newUserInfo = JSON.parse(e.newValue);
          this.updateUserInfo(newUserInfo);
        } catch (error) {
          console.error('解析localStorage中的用户信息失败:', error);
        }
      }
    });

    // 定期检查localStorage变化（同标签页内的变化）
    setInterval(() => {
      const currentStorageInfo = this.getUserInfoFromStorage();
      if (this.hasUserInfoChanged(currentStorageInfo)) {
        this.updateUserInfo(currentStorageInfo);
      }
    }, 500); // 每500ms检查一次
  }

  /**
   * 检查用户信息是否发生变化
   */
  private hasUserInfoChanged(newUserInfo: typeof USER_INFO): boolean {
    return JSON.stringify(this.currentUserInfo) !== JSON.stringify(newUserInfo);
  }

  /**
   * 更新用户信息并通知所有监听器
   */
  private updateUserInfo(newUserInfo: typeof USER_INFO): void {
    const oldUserInfo = { ...this.currentUserInfo };
    this.currentUserInfo = { ...newUserInfo };

    // 特别检查头像是否发生变化
    const avatarChanged = oldUserInfo.USER_AVATAR !== newUserInfo.USER_AVATAR;

    if (avatarChanged) {
      console.log('检测到头像变化:', {
        old: oldUserInfo.USER_AVATAR,
        new: newUserInfo.USER_AVATAR,
      });
    }

    // 通知所有监听器
    this.notifyListeners(newUserInfo);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(userInfo: typeof USER_INFO): void {
    this.listeners.forEach((listener) => {
      try {
        listener(userInfo);
      } catch (error) {
        console.error('用户信息监听器执行失败:', error);
      }
    });
  }

  /**
   * 添加监听器
   */
  public addListener(listener: UserInfoListener): void {
    this.listeners.add(listener);
  }

  /**
   * 移除监听器
   */
  public removeListener(listener: UserInfoListener): void {
    this.listeners.delete(listener);
  }

  /**
   * 获取当前用户信息
   */
  public getCurrentUserInfo(): typeof USER_INFO {
    return { ...this.currentUserInfo };
  }

  /**
   * 手动触发用户信息更新检查
   */
  public checkForUpdates(): void {
    const currentStorageInfo = this.getUserInfoFromStorage();
    if (this.hasUserInfoChanged(currentStorageInfo)) {
      this.updateUserInfo(currentStorageInfo);
    }
  }

  /**
   * 强制更新用户信息（用于组件主动更新用户信息时）
   */
  public forceUpdate(userInfo: typeof USER_INFO): void {
    // 更新localStorage
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    // 更新内部状态
    this.updateUserInfo(userInfo);
  }
}

// 导出单例实例
export const userInfoWatcher = UserInfoWatcher.getInstance();

// 导出便捷的hook函数
export const useUserInfoWatcher = () => {
  return userInfoWatcher;
};

//-------------------------------------//
//            useUser Hook
//-------------------------------------//

const useUser = () => {
  // 从 localStorage 读取用户信息
  const getUserInfo = () => {
    const savedUserInfo = sessionStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        return JSON.parse(savedUserInfo);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
    return USER_INFO;
  };

  const [userInfo, setUserInfoState] = useState(getUserInfo());

  // 监听用户信息变化
  useEffect(() => {
    const handleUserInfoChange = (newUserInfo: typeof USER_INFO) => {
      setUserInfoState(newUserInfo);
    };

    // 添加监听器
    userInfoWatcher.addListener(handleUserInfoChange);

    // 同步当前状态
    const currentUserInfo = userInfoWatcher.getCurrentUserInfo();
    if (JSON.stringify(currentUserInfo) !== JSON.stringify(userInfo)) {
      setUserInfoState(currentUserInfo);
    }

    // 清理监听器
    return () => {
      userInfoWatcher.removeListener(handleUserInfoChange);
    };
  }, []); // 只在组件挂载时执行一次

  // 更新用户信息
  const setUserInfo = useCallback((newUserInfo: any) => {
    // 使用监控器的强制更新方法，确保所有组件都能收到更新通知
    userInfoWatcher.forceUpdate(newUserInfo);
  }, []);

  return {
    userInfo,
    setUserInfo,
  };
};

export default useUser;
