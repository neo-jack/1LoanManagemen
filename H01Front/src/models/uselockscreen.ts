/**
 * 锁屏功能全局状态管理
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type LockScreenConfig,
  type LockScreenEvent,
  type LockScreenResult,
  type LockScreenState,
  DEFAULT_LOCK_CONFIG,
  DEFAULT_LOCK_STATE,
  LOCK_SCREEN_CONSTANTS,
} from '../constants/lockScreen';
import { LockScreenUtils } from '../utils/lock';

// 锁屏状态变化监听器类型
type LockScreenConfigListener = (config: LockScreenConfig) => void;
type LockScreenStateListener = (state: LockScreenState) => void;

/**
 * 锁屏管理器
 * 提供全局的锁屏状态管理和配置管理
 */
export class LockScreenManager {
  private static instance: LockScreenManager;
  private configListeners: Set<LockScreenConfigListener> = new Set();
  private stateListeners: Set<LockScreenStateListener> = new Set();
  private currentConfig: LockScreenConfig;
  private currentState: LockScreenState;
  private isInitialized = false;

  private constructor() {
    this.currentConfig = LockScreenUtils.getConfig();
    this.currentState = LockScreenUtils.getState();
    this.init();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): LockScreenManager {
    if (!LockScreenManager.instance) {
      LockScreenManager.instance = new LockScreenManager();
    }
    return LockScreenManager.instance;
  }

  /**
   * 初始化锁屏管理器
   */
  private init(): void {
    if (this.isInitialized) {
      return;
    }

    // 监听 storage 变化
    this.setupStorageListener();

    // 定期检查状态变化
    this.startPeriodicCheck();

    // 初始化锁屏功能
    LockScreenUtils.init();

    this.isInitialized = true;
  }

  /**
   * 设置 storage 监听器
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === LOCK_SCREEN_CONSTANTS.CONFIG_STORAGE_KEY && e.newValue) {
        try {
          const newConfig = JSON.parse(e.newValue);
          this.updateConfig(newConfig, false);
        } catch (error) {
          console.error('解析锁屏配置失败:', error);
        }
      }

      if (e.key === LOCK_SCREEN_CONSTANTS.STATE_STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          this.updateState(newState, false);
        } catch (error) {
          console.error('解析锁屏状态失败:', error);
        }
      }
    });
  }

  /**
   * 开始定期检查
   */
  private startPeriodicCheck(): void {
    setInterval(() => {
      // 检查配置变化
      const currentConfig = LockScreenUtils.getConfig();
      if (this.hasConfigChanged(currentConfig)) {
        this.updateConfig(currentConfig, false);
      }

      // 检查状态变化
      const currentState = LockScreenUtils.getState();
      if (this.hasStateChanged(currentState)) {
        this.updateState(currentState, false);
      }
    }, 500); // 每500ms检查一次
  }

  /**
   * 检查配置是否发生变化
   */
  private hasConfigChanged(newConfig: LockScreenConfig): boolean {
    return JSON.stringify(this.currentConfig) !== JSON.stringify(newConfig);
  }

  /**
   * 检查状态是否发生变化
   */
  private hasStateChanged(newState: LockScreenState): boolean {
    return JSON.stringify(this.currentState) !== JSON.stringify(newState);
  }

  /**
   * 更新配置并通知监听器
   */
  private updateConfig(
    newConfig: LockScreenConfig,
    saveToStorage = true,
  ): void {
    this.currentConfig = { ...newConfig };

    if (saveToStorage) {
      LockScreenUtils.saveConfig(newConfig);
    }

    // 通知所有配置监听器
    this.notifyConfigListeners(this.currentConfig);
  }

  /**
   * 更新状态并通知监听器
   */
  private updateState(newState: LockScreenState, saveToStorage = true): void {
    this.currentState = { ...newState };

    if (saveToStorage) {
      LockScreenUtils.saveState(newState);
    }

    // 通知所有状态监听器
    this.notifyStateListeners(this.currentState);
  }

  /**
   * 通知所有配置监听器
   */
  private notifyConfigListeners(config: LockScreenConfig): void {
    this.configListeners.forEach((listener) => {
      try {
        listener(config);
      } catch (error) {
        console.error('锁屏配置监听器执行失败:', error);
      }
    });
  }

  /**
   * 通知所有状态监听器
   */
  private notifyStateListeners(state: LockScreenState): void {
    this.stateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('锁屏状态监听器执行失败:', error);
      }
    });
  }

  // ============ 公共方法 ============

  /**
   * 获取当前配置
   */
  public getConfig(): LockScreenConfig {
    return { ...this.currentConfig };
  }

  /**
   * 获取当前状态
   */
  public getState(): LockScreenState {
    return { ...this.currentState };
  }

  /**
   * 设置锁屏配置
   */
  public setConfig(config: Partial<LockScreenConfig>): LockScreenResult {
    const newConfig = { ...this.currentConfig, ...config };
    const result = LockScreenUtils.saveConfig(newConfig);

    if (result.success) {
      this.updateConfig(newConfig, false);

      // 如果配置发生变化，重新初始化锁屏功能
      if (
        newConfig.isEnabled !== this.currentConfig.isEnabled ||
        newConfig.autoLockEnabled !== this.currentConfig.autoLockEnabled
      ) {
        if (newConfig.isEnabled && newConfig.autoLockEnabled) {
          LockScreenUtils.startTimeoutCheck();
        } else {
          LockScreenUtils.stopTimeoutCheck();
        }
      }
    }

    return result;
  }

  /**
   * 锁定屏幕
   */
  public lock(event: LockScreenEvent = 'manual'): LockScreenResult {
    const result = LockScreenUtils.lockScreen(event);

    if (result.success) {
      // 手动更新状态以触发监听器
      this.checkForUpdates();
    }

    return result;
  }

  /**
   * 解锁屏幕
   */
  public unlock(password: string): LockScreenResult {
    const result = LockScreenUtils.unlockScreen(password);

    if (result.success) {
      // 手动更新状态以触发监听器
      this.checkForUpdates();
    }

    return result;
  }

  /**
   * 强制解锁屏幕（不验证密码）
   */
  public forceUnlock(): LockScreenResult {
    const result = LockScreenUtils.forceUnlockScreen();

    if (result.success) {
      // 手动更新状态以触发监听器
      this.checkForUpdates();
    }

    return result;
  }

  /**
   * 重置配置
   */
  public resetConfig(): LockScreenResult {
    const result = LockScreenUtils.resetConfig();

    if (result.success) {
      this.updateConfig(DEFAULT_LOCK_CONFIG, false);
      this.updateState(DEFAULT_LOCK_STATE, false);
    }

    return result;
  }

  /**
   * 手动检查更新
   */
  public checkForUpdates(): void {
    const currentConfig = LockScreenUtils.getConfig();
    const currentState = LockScreenUtils.getState();

    if (this.hasConfigChanged(currentConfig)) {
      this.updateConfig(currentConfig, false);
    }

    if (this.hasStateChanged(currentState)) {
      this.updateState(currentState, false);
    }
  }

  /**
   * 添加配置监听器
   */
  public addConfigListener(listener: LockScreenConfigListener): void {
    this.configListeners.add(listener);
  }

  /**
   * 移除配置监听器
   */
  public removeConfigListener(listener: LockScreenConfigListener): void {
    this.configListeners.delete(listener);
  }

  /**
   * 添加状态监听器
   */
  public addStateListener(listener: LockScreenStateListener): void {
    this.stateListeners.add(listener);
  }

  /**
   * 移除状态监听器
   */
  public removeStateListener(listener: LockScreenStateListener): void {
    this.stateListeners.delete(listener);
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    LockScreenUtils.destroy();
    this.configListeners.clear();
    this.stateListeners.clear();
  }
}

// 导出单例实例
export const lockScreenManager = LockScreenManager.getInstance();

// ============ React Hook ============

/**
 * 锁屏配置 Hook
 */
export const useLockScreenConfig = () => {
  const [config, setConfigState] = useState<LockScreenConfig>(
    lockScreenManager.getConfig(),
  );

  useEffect(() => {
    const listener = (newConfig: LockScreenConfig) => {
      setConfigState(newConfig);
    };

    lockScreenManager.addConfigListener(listener);

    // 同步当前状态
    setConfigState(lockScreenManager.getConfig());

    return () => {
      lockScreenManager.removeConfigListener(listener);
    };
  }, []);

  const setConfig = useCallback(
    (newConfig: Partial<LockScreenConfig>): LockScreenResult => {
      return lockScreenManager.setConfig(newConfig);
    },
    [],
  );

  const resetConfig = useCallback((): LockScreenResult => {
    return lockScreenManager.resetConfig();
  }, []);

  return {
    config,
    setConfig,
    resetConfig,
  };
};

/**
 * 锁屏状态 Hook
 */
export const useLockScreenState = () => {
  const [state, setStateState] = useState<LockScreenState>(
    lockScreenManager.getState(),
  );

  useEffect(() => {
    const listener = (newState: LockScreenState) => {
      setStateState(newState);
    };

    lockScreenManager.addStateListener(listener);

    // 同步当前状态
    setStateState(lockScreenManager.getState());

    return () => {
      lockScreenManager.removeStateListener(listener);
    };
  }, []);

  return {
    state,
    isLocked: state.isLocked,
  };
};

/**
 * 锁屏操作 Hook
 */
export const useLockScreenActions = () => {
  const lock = useCallback(
    (event: LockScreenEvent = 'manual'): LockScreenResult => {
      return lockScreenManager.lock(event);
    },
    [],
  );

  const unlock = useCallback((password: string): LockScreenResult => {
    return lockScreenManager.unlock(password);
  }, []);

  const forceUnlock = useCallback((): LockScreenResult => {
    return lockScreenManager.forceUnlock();
  }, []);

  return {
    lock,
    unlock,
    forceUnlock,
  };
};

/**
 * 完整的锁屏 Hook
 * 包含配置、状态和操作
 */
const useLockScreen = () => {
  const { config, setConfig, resetConfig } = useLockScreenConfig();
  const { state, isLocked } = useLockScreenState();
  const { lock, unlock, forceUnlock } = useLockScreenActions();

  return {
    // 配置相关
    config,
    setConfig,
    resetConfig,

    // 状态相关
    state,
    isLocked,

    // 操作相关
    lock,
    unlock,
    forceUnlock,
  };
};

// 导出便捷的全局访问函数
export const getLockScreenConfig = () => lockScreenManager.getConfig();
export const getLockScreenState = () => lockScreenManager.getState();
export const setLockScreenConfig = (config: Partial<LockScreenConfig>) =>
  lockScreenManager.setConfig(config);
export const lockScreen = (event?: LockScreenEvent) =>
  lockScreenManager.lock(event);
export const unlockScreen = (password: string) =>
  lockScreenManager.unlock(password);
export const forceUnlockScreen = () => lockScreenManager.forceUnlock();

export default useLockScreen;
