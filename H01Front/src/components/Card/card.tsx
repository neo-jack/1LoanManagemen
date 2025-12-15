import type { SubModule } from '@/constants/workboard';
import * as Icons from '@ant-design/icons';
import { CloseOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import React from 'react';
import './card.less';
import { COLOR_THEMES, getIconComponent, ICON_COLOR_MAP } from './iconMap';

interface ModuleCardProps {
  /** 模块数据 - 直接传入完整的模块信息 */
  module: SubModule;
  /** 点击事件处理 */
  onClick?: (module: SubModule) => void;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
  /** 收藏状态切换事件 */
  onFavoriteToggle?: (module: SubModule) => void;
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
 * 获取图标背景颜色主题
 * @param iconName 图标名称
 * @returns 颜色主题对象
 */
const getIconTheme = (iconName: string) => {
  const themeName = ICON_COLOR_MAP[iconName] || ICON_COLOR_MAP.default;
  return COLOR_THEMES[themeName] || COLOR_THEMES.purple;
};

/**
 * 通用模块卡片组件
 * 统一的模块卡片样式，支持收藏和启动功能
 *
 * 功能特点：
 * 1. 直接接收完整的模块数据，无需硬编码查找
 * 2. 支持收藏功能（可选）
 * 3. 支持启动功能（可选）
 * 4. 支持动态图标渲染和主题色彩
 * 5. 支持自定义样式和类名
 * 6. 简洁的卡片设计，突出图标和名称
 */
const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onClick,
  showFavorite = false,
  onFavoriteToggle,
  showRemove = false,
  onRemove,
  style,
  className,
}) => {
  if (!module) {
    return (
      <Card
        style={{
          width: 200,
          height: 160,
          margin: '8px',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: '#F6F9FF',
          ...style,
        }}
        styles={{
          body: { padding: '16px' },
        }}
        className={className}
      >
        <div style={{ textAlign: 'center' }}>
          <Icons.QuestionCircleOutlined
            style={{ fontSize: 32, color: '#999' }}
          />
          <div style={{ marginTop: 8, color: '#999' }}>模块信息缺失</div>
        </div>
      </Card>
    );
  }

  // 获取图标主题
  const iconTheme = getIconTheme(module.icon || 'AppstoreOutlined');

  // 动态获取图标组件
  const getIcon = () => {
    if (!module.icon) {
      return getIconComponent('AppstoreOutlined', {
        fontSize: 24,
        color: '#fff',
      });
    }

    // 处理自定义图标（以#开头）
    if (module.icon.startsWith('#')) {
      return (
        <i
          className={`iconfont ${module.icon}`}
          style={{ fontSize: 24, color: '#fff' }}
        />
      );
    }

    // 使用统一的图标映射函数
    return getIconComponent(module.icon, { fontSize: 24, color: '#fff' });
  };

  /**
   * 生成带认证参数的子应用 URL
   * 用于解决跨端口 localStorage 隔离问题
   */
  const buildAuthUrl = (baseUrl: string): string => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      // 直接拼接 URL，避免 URLSearchParams 的编码问题
      const encodedUserInfo = encodeURIComponent(userInfo);
      return `${baseUrl}/login?token=${token}&userInfo=${encodedUserInfo}`;
    }
    return baseUrl;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(module);
    } else {
      // 默认行为：根据端口或URL打开新窗口，携带认证信息
      let targetUrl = '';
      if (module.projectPath) {
        targetUrl = buildAuthUrl(module.projectPath);
      } else if (module.port) {
        const baseUrl = process.env.UMI_APP_BASE_URL || 'http://localhost';
        targetUrl = buildAuthUrl(`${baseUrl}:${module.port}`);
      }
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(module);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(module);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        width: 200,
        height: 160,
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#F6F9FF',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        cursor: 'pointer',
        flexShrink: 0, // 防止在 flex 容器中收缩
        ...style,
      }}
      styles={{
        body: {
          padding: '16px',
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      className={className}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 30px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 4px 20px rgba(0,0,0,0.08)';
      }}
    >
      {/* 右上角按钮区域 */}
      {(showFavorite || showRemove) && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1,
            display: 'flex',
            gap: '4px',
          }}
        >
          {showFavorite && (
            <Tooltip title={module.isFavorite ? '取消收藏' : '添加收藏'}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={
                  module.isFavorite ? (
                    <StarFilled style={{ color: '#faad14' }} />
                  ) : (
                    <StarOutlined style={{ color: '#bbb' }} />
                  )
                }
                onClick={handleFavoriteClick}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </Tooltip>
          )}
          {showRemove && (
            <Tooltip title="移除">
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                onClick={handleRemoveClick}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </Tooltip>
          )}
        </div>
      )}

      {/* 模块图标 */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: iconTheme.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: iconTheme.shadow,
          alignSelf: 'center',
        }}
      >
        {getIconComponent(module.icon || 'AppstoreOutlined', {
          fontSize: 28,
          color: '#fff',
        })}
      </div>

      {/* 模块信息 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: '0',
            color: '#333',
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {module.name}
        </h3>
      </div>
    </Card>
  );
};

export default ModuleCard;
