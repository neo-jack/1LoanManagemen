import type { SubModule } from '@/constants/workboard';
import { addFavorite, removeFavorite } from '@/services/favorite';
import { message } from 'antd';
import React, { useState } from 'react';
import ModuleCard from './card';

interface FavoriteModuleCardProps {
  /** 模块数据 - 直接传入完整的模块信息 */
  module: SubModule;
  /** 点击事件处理 */
  onClick?: (module: SubModule) => void;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
  /** 收藏状态变化回调 */
  onFavoriteChange?: (module: SubModule, isFavorite: boolean) => void;
  /** 是否显示移除按钮 */
  showRemove?: boolean;
  /** 移除事件处理 */
  onRemove?: (module: SubModule) => void;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 带收藏功能的模块卡片组件
 * 在原有ModuleCard基础上集成了收藏API调用功能
 *
 * 功能特点：
 * 1. 自动处理添加/取消收藏的API调用
 * 2. 内置加载状态管理
 * 3. 自动显示操作结果消息
 * 4. 支持收藏状态变化回调
 * 5. 保持与原ModuleCard相同的UI和交互
 */
const FavoriteModuleCard: React.FC<FavoriteModuleCardProps> = ({
  module,
  onClick,
  showFavorite = false,
  onFavoriteChange,
  showRemove = false,
  onRemove,
  style,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState<SubModule>(module);

  // 当外部传入的 module 发生变化时，同步更新内部状态
  React.useEffect(() => {
    setCurrentModule(module);
  }, [module]);

  /**
   * 处理收藏状态切换
   * 根据当前收藏状态调用相应的API
   */
  const handleFavoriteToggle = async (moduleToToggle: SubModule) => {
    if (loading) return; // 防止重复点击

    setLoading(true);

    try {
      if (moduleToToggle.isFavorite) {
        // 取消收藏
        console.log('[FavoriteModuleCard] 开始取消收藏:', moduleToToggle.id);
        const result = await removeFavorite({ modulesid: moduleToToggle.id });

        if (result.success) {
          const updatedModule = { ...moduleToToggle, isFavorite: false };
          setCurrentModule(updatedModule);
          message.success(result.message || '取消收藏成功');
          onFavoriteChange?.(updatedModule, false);
        } else {
          message.error(result.message || '取消收藏失败');
        }
      } else {
        // 添加收藏 - 需要传递完整的模块信息
        console.log('[FavoriteModuleCard] 开始添加收藏:', moduleToToggle.id);
        const result = await addFavorite({
          modulesid: moduleToToggle.id,
          name: moduleToToggle.name,
          description: moduleToToggle.description,
          icon: moduleToToggle.icon || 'AppstoreOutlined',
          port: moduleToToggle.port || 3000,
          url:
            moduleToToggle.projectPath ||
            `http://localhost:${moduleToToggle.port || 3000}`,
        });

        if (result.success) {
          const updatedModule = { ...moduleToToggle, isFavorite: true };
          setCurrentModule(updatedModule);
          message.success(result.message || '添加收藏成功');
          onFavoriteChange?.(updatedModule, true);
        } else {
          message.error(result.message || '添加收藏失败');
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleCard
      module={currentModule}
      onClick={onClick}
      showFavorite={showFavorite}
      onFavoriteToggle={handleFavoriteToggle}
      showRemove={showRemove}
      onRemove={onRemove}
      style={style}
      className={className}
    />
  );
};

export default FavoriteModuleCard;
