/**
 * 锁屏功能工具函数
 */

import {
  type LockScreenConfig,
  type LockScreenEvent,
  type LockScreenResult,
  type LockScreenState,
  DEFAULT_LOCK_CONFIG,
  DEFAULT_LOCK_STATE,
  LOCK_SCREEN_CONSTANTS,
  LOCK_SCREEN_MESSAGES,
} from '../../constants/lockScreen';

/**
 * 锁屏工具类
 * 提供锁屏相关的核心功能
 */
export class LockScreenUtils {
  private static timeoutTimer: NodeJS.Timeout | null = null;
  private static activityTimer: NodeJS.Timeout | null = null;
  private static isActivityListenerActive = false;

  /**
   * 获取锁屏配置
   */
  static getConfig(): LockScreenConfig {
    try {
      const configStr = sessionStorage.getItem(
        LOCK_SCREEN_CONSTANTS.CONFIG_STORAGE_KEY,
      );
      if (configStr) {
        const config = JSON.parse(configStr);
        return { ...DEFAULT_LOCK_CONFIG, ...config };
      }
    } catch (error) {
      console.error('获取锁屏配置失败:', error);
    }
    return { ...DEFAULT_LOCK_CONFIG };
  }

  /**
   * 保存锁屏配置
   */
  static saveConfig(config: Partial<LockScreenConfig>): LockScreenResult {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };

      // 验证配置
      const validation = this.validateConfig(newConfig);
      if (!validation.success) {
        return validation;
      }

      sessionStorage.setItem(
        LOCK_SCREEN_CONSTANTS.CONFIG_STORAGE_KEY,
        JSON.stringify(newConfig),
      );

      return {
        success: true,
        message: LOCK_SCREEN_MESSAGES.CONFIG_SAVED,
        event: 'manual',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('保存锁屏配置失败:', error);
      return {
        success: false,
        message: '保存配置失败',
        event: 'manual',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取锁屏状态
   */
  static getState(): LockScreenState {
    try {
      const stateStr = sessionStorage.getItem(
        LOCK_SCREEN_CONSTANTS.STATE_STORAGE_KEY,
      );
      if (stateStr) {
        const state = JSON.parse(stateStr);
        return { ...DEFAULT_LOCK_STATE, ...state };
      }
    } catch (error) {
      console.error('获取锁屏状态失败:', error);
    }
    return { ...DEFAULT_LOCK_STATE };
  }

  /**
   * 保存锁屏状态
   */
  static saveState(state: Partial<LockScreenState>): void {
    try {
      const currentState = this.getState();
      const newState = { ...currentState, ...state };
      sessionStorage.setItem(
        LOCK_SCREEN_CONSTANTS.STATE_STORAGE_KEY,
        JSON.stringify(newState),
      );
    } catch (error) {
      console.error('保存锁屏状态失败:', error);
    }
  }

  /**
   * 验证锁屏配置
   */
  static validateConfig(config: LockScreenConfig): LockScreenResult {
    // 检查密码
    if (config.isEnabled && !config.password) {
      return {
        success: false,
        message: LOCK_SCREEN_MESSAGES.PASSWORD_REQUIRED,
        event: 'manual',
        timestamp: Date.now(),
      };
    }

    // 检查超时时间
    if (
      config.timeoutMinutes < LOCK_SCREEN_CONSTANTS.MIN_TIMEOUT_MINUTES ||
      config.timeoutMinutes > LOCK_SCREEN_CONSTANTS.MAX_TIMEOUT_MINUTES
    ) {
      return {
        success: false,
        message: LOCK_SCREEN_MESSAGES.TIMEOUT_INVALID,
        event: 'manual',
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      event: 'manual',
      timestamp: Date.now(),
    };
  }

  /**
   * 验证密码
   */
  static validatePassword(inputPassword: string): LockScreenResult {
    const config = this.getConfig();

    if (inputPassword === config.password) {
      return {
        success: true,
        message: LOCK_SCREEN_MESSAGES.UNLOCK_SUCCESS,
        event: 'unlock',
        timestamp: Date.now(),
      };
    }

    return {
      success: false,
      message: LOCK_SCREEN_MESSAGES.PASSWORD_INCORRECT,
      event: 'unlock',
      timestamp: Date.now(),
    };
  }

  /**
   * 锁定屏幕
   */
  static lockScreen(event: LockScreenEvent = 'manual'): LockScreenResult {
    try {
      const config = this.getConfig();

      if (!config.isEnabled) {
        return {
          success: false,
          message: '锁屏功能未启用',
          event,
          timestamp: Date.now(),
        };
      }

      this.saveState({
        isLocked: true,
        lockStartTime: Date.now(),
      });

      // 停止超时检测
      this.stopTimeoutCheck();

      return {
        success: true,
        message: LOCK_SCREEN_MESSAGES.LOCK_SUCCESS,
        event,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('锁屏失败:', error);
      return {
        success: false,
        message: '锁屏失败',
        event,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 解锁屏幕
   */
  static unlockScreen(password: string): LockScreenResult {
    const passwordResult = this.validatePassword(password);

    if (!passwordResult.success) {
      return passwordResult;
    }

    try {
      this.saveState({
        isLocked: false,
        lockStartTime: null,
        lastActiveTime: Date.now(),
      });

      // 重新开始超时检测
      this.startTimeoutCheck();

      return {
        success: true,
        message: LOCK_SCREEN_MESSAGES.UNLOCK_SUCCESS,
        event: 'unlock',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('解锁失败:', error);
      return {
        success: false,
        message: '解锁失败',
        event: 'unlock',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 强制解锁屏幕（不验证密码）
   * 用于退出登录等场景
   */
  static forceUnlockScreen(): LockScreenResult {
    try {
      this.saveState({
        isLocked: false,
        lockStartTime: null,
        lastActiveTime: Date.now(),
      });

      // 重新开始超时检测
      this.startTimeoutCheck();

      return {
        success: true,
        message: '强制解锁成功',
        event: 'unlock',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('强制解锁失败:', error);
      return {
        success: false,
        message: '强制解锁失败',
        event: 'unlock',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 开始超时检测
   */
  static startTimeoutCheck(): void {
    const config = this.getConfig();

    if (!config.isEnabled || !config.autoLockEnabled) {
      return;
    }

    // 清除现有的计时器
    this.stopTimeoutCheck();

    // 开始活动监听
    this.startActivityListener();

    // 开始超时检测
    this.timeoutTimer = setInterval(() => {
      this.checkTimeout();
    }, LOCK_SCREEN_CONSTANTS.CHECK_TIMEOUT_INTERVAL);
  }

  /**
   * 停止超时检测
   */
  static stopTimeoutCheck(): void {
    if (this.timeoutTimer) {
      clearInterval(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    this.stopActivityListener();
  }

  /**
   * 检查是否超时
   */
  private static checkTimeout(): void {
    const config = this.getConfig();
    const state = this.getState();

    if (!config.isEnabled || state.isLocked) {
      return;
    }

    const now = Date.now();
    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    const timeSinceLastActivity = now - state.lastActiveTime;

    if (timeSinceLastActivity >= timeoutMs) {
      this.lockScreen('timeout');
    }
  }

  /**
   * 开始活动监听
   */
  private static startActivityListener(): void {
    if (this.isActivityListenerActive) {
      return;
    }

    const handleActivity = () => {
      this.updateLastActiveTime();
    };

    // 为所有活动事件添加监听器
    LOCK_SCREEN_CONSTANTS.ACTIVITY_EVENTS.forEach((eventType: string) => {
      document.addEventListener(eventType, handleActivity, true);
    });

    this.isActivityListenerActive = true;
  }

  /**
   * 停止活动监听
   */
  private static stopActivityListener(): void {
    if (!this.isActivityListenerActive) {
      return;
    }

    const handleActivity = () => {
      this.updateLastActiveTime();
    };

    // 移除所有活动事件的监听器
    LOCK_SCREEN_CONSTANTS.ACTIVITY_EVENTS.forEach((eventType: string) => {
      document.removeEventListener(eventType, handleActivity, true);
    });

    this.isActivityListenerActive = false;
  }

  /**
   * 更新最后活动时间
   */
  static updateLastActiveTime(): void {
    const state = this.getState();

    if (!state.isLocked) {
      this.saveState({
        lastActiveTime: Date.now(),
      });
    }
  }

  /**
   * 重置锁屏配置
   */
  static resetConfig(): LockScreenResult {
    try {
      sessionStorage.removeItem(LOCK_SCREEN_CONSTANTS.CONFIG_STORAGE_KEY);
      sessionStorage.removeItem(LOCK_SCREEN_CONSTANTS.STATE_STORAGE_KEY);

      return {
        success: true,
        message: LOCK_SCREEN_MESSAGES.CONFIG_RESET,
        event: 'manual',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('重置锁屏配置失败:', error);
      return {
        success: false,
        message: '重置配置失败',
        event: 'manual',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 初始化锁屏功能
   */
  static init(): void {
    const config = this.getConfig();
    const state = this.getState();

    // 如果已经处于锁定状态，不需要重新初始化
    if (state.isLocked) {
      return;
    }

    // 更新最后活动时间
    this.updateLastActiveTime();

    // 如果启用了自动锁屏，开始超时检测
    if (config.isEnabled && config.autoLockEnabled) {
      this.startTimeoutCheck();
    }
  }

  /**
   * 销毁锁屏功能
   */
  static destroy(): void {
    this.stopTimeoutCheck();
  }
}
