import ModuleCard from '@/components/Card';
import type { SubModule } from '@/constants/workboard';
import { getFavoriteList, type FavoriteItem } from '@/services/favorite/get';
import { removeFavorite } from '@/services/favorite/remove';
import { sortFavorite } from '@/services/favorite/sorts';
import {
  CloseOutlined,
  SaveOutlined,
  SortAscendingOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, message, Space, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';
import NoticePanel from './components/NoticePanel';
import './index.less';

/**
 * 将FavoriteItem转换为SubModule格式
 * @param favoriteItem - 收藏项数据
 * @returns SubModule - 模块数据
 */
const convertFavoriteToModule = (favoriteItem: FavoriteItem): SubModule => {
  return {
    id: favoriteItem.id,
    name: favoriteItem.name,
    description: favoriteItem.description,
    icon: favoriteItem.icon,
    port: favoriteItem.port,
    projectPath: favoriteItem.url, // 使用url作为projectPath
    isFavorite: true, // 收藏列表中的项目都是已收藏的
  };
};

/**
 * 工作看板页面组件
 * 功能：
 * 1. 展示用户收藏的模块
 * 2. 支持快速启动模块
 * 3. 支持取消收藏操作
 * 4. 响应式布局设计
 */
const WorkBoard: FC = () => {
  // 状态管理
  const [favoriteModules, setFavoriteModules] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 排序模式状态
  const [sortMode, setSortMode] = useState(false);
  const [sortSaving, setSortSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /**
   * 获取收藏模块列表
   * 页面加载时调用，获取用户的所有收藏模块
   */
  const fetchFavoriteModules = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[WorkBoard] 开始获取收藏列表');
      const result = await getFavoriteList();

      if (result.success && result.data) {
        // 转换API数据格式为组件需要的格式
        const modules: SubModule[] = result.data.map(convertFavoriteToModule);
        setFavoriteModules(modules);
        console.log('[WorkBoard] 成功获取收藏列表，共', modules.length, '项');
      } else {
        setError(result.message || '获取收藏列表失败');
        console.error('[WorkBoard] 获取收藏列表失败:', result.message);
      }
    } catch (err) {
      console.error('[WorkBoard] 获取收藏列表错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理取消收藏
   * @param module - 要取消收藏的模块
   */
  const handleRemoveFavorite = async (module: SubModule) => {
    try {
      console.log('[WorkBoard] 开始取消收藏:', module.id);
      const result = await removeFavorite({ modulesid: module.id });

      if (result.success) {
        // 从本地状态中移除该模块
        setFavoriteModules((prev) =>
          prev.filter((item) => item.id !== module.id),
        );
        message.success(result.message || '已取消收藏');
        console.log('[WorkBoard] 取消收藏成功:', module.id);
      } else {
        message.error(result.message || '取消收藏失败');
        console.error('[WorkBoard] 取消收藏失败:', result.message);
      }
    } catch (error) {
      console.error('[WorkBoard] 取消收藏错误:', error);
      message.error('取消收藏时发生错误，请稍后重试');
    }
  };

  /**
   * 开启排序模式
   */
  const handleStartSort = () => {
    setSortMode(true);
    message.info('已开启排序模式，拖拽卡片进行排序');
  };

  /**
   * 取消排序模式
   */
  const handleCancelSort = () => {
    setSortMode(false);
    // 重新获取数据，恢复原始顺序
    fetchFavoriteModules();
  };

  /**
   * 保存排序
   */
  const handleSaveSort = async () => {
    try {
      setSortSaving(true);
      const moduleIds = favoriteModules.map((module) => module.id);
      console.log('[WorkBoard] 保存排序:', moduleIds);

      const result = await sortFavorite({ sortOrder: moduleIds });

      if (result.success) {
        message.success(result.message || '排序保存成功');
        setSortMode(false);
      } else {
        message.error(result.message || '保存排序失败');
      }
    } catch (error) {
      console.error('[WorkBoard] 保存排序错误:', error);
      message.error('保存排序时发生错误，请稍后重试');
    } finally {
      setSortSaving(false);
    }
  };

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  /**
   * 处理拖拽放置
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newModules = [...favoriteModules];
    const draggedModule = newModules[draggedIndex];

    // 移除拖拽的元素
    newModules.splice(draggedIndex, 1);
    // 在新位置插入
    newModules.splice(dropIndex, 0, draggedModule);

    setFavoriteModules(newModules);
    setDraggedIndex(null);
  };

  // 页面加载时获取收藏列表，但要确保 token 已经存在
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10; // 最多重试10次

    const checkTokenAndFetchFavorites = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('[WorkBoard] Token 已存在，开始获取收藏列表');
        fetchFavoriteModules();
      } else if (retryCount < maxRetries) {
        console.log(`[WorkBoard] Token 不存在，第${retryCount + 1}次重试...`);
        retryCount++;
        setTimeout(checkTokenAndFetchFavorites, 200); // 200ms后重试
      } else {
        console.log('[WorkBoard] 重试次数超限，停止获取收藏列表');
        setError('未找到有效的访问令牌，请重新登录');
        setLoading(false);
      }
    };

    // 稍微延迟一下，给登录流程保存 token 的时间
    setTimeout(checkTokenAndFetchFavorites, 100);
  }, []);

  /**
   * 渲染页面内容
   */
  const renderContent = () => {
    // 加载状态
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>正在加载收藏模块...</p>
        </div>
      );
    }

    // 错误状态
    if (error) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p>加载失败</p>
              <p style={{ color: '#999', fontSize: '14px' }}>{error}</p>
              <a onClick={fetchFavoriteModules} style={{ color: '#1890ff' }}>
                重新加载
              </a>
            </div>
          }
        />
      );
    }

    // 空状态
    if (favoriteModules.length === 0) {
      return (
        <Empty
          image={<StarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <div>
              <p>暂无收藏模块</p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                前往工作中台收藏常用模块，在此处快速访问
              </p>
            </div>
          }
        />
      );
    }

    // 模块列表
    return (
      <div
        className={sortMode && draggedIndex !== null ? 'dragging-active' : ''}
      >
        {sortMode && (
          <div className="sort-tip">
            <span className="tip-icon">💡</span>
            拖拽模式已开启：按住卡片拖动到目标位置进行排序，完成后点击"保存"按钮
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {favoriteModules.map((module, index) => (
            <div
              key={module.id}
              className={`draggable-card ${sortMode ? 'sort-mode' : ''} ${
                sortMode && draggedIndex === index ? 'dragging' : ''
              } ${sortMode && dragOverIndex === index ? 'drag-over' : ''}`}
              draggable={sortMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <ModuleCard
                key={module.id}
                module={module}
                showFavorite={false}
                showRemove={!sortMode}
                onRemove={() => handleRemoveFavorite(module)}
                className="module-card"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f5f5f5',
        height: '100%',
        display: 'flex',
        gap: '16px',
      }}
    >
      {/* 左侧：收藏模块展示区域 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card
          variant="borderless"
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StarOutlined style={{ marginRight: 8, color: '#faad14' }} />
                常用模块
                {!loading && favoriteModules.length > 0 && (
                  <span
                    style={{
                      color: '#999',
                      fontSize: '14px',
                      marginLeft: 8,
                    }}
                  >
                    ({favoriteModules.length}个模块)
                  </span>
                )}
              </div>
              {!loading && favoriteModules.length > 0 && (
                <div>
                  {!sortMode ? (
                    <Button
                      type="text"
                      icon={<SortAscendingOutlined />}
                      onClick={handleStartSort}
                      size="small"
                    >
                      排序
                    </Button>
                  ) : (
                    <Space size="small" className="sort-buttons">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveSort}
                        loading={sortSaving}
                        size="small"
                        className="save-btn"
                      >
                        保存
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={handleCancelSort}
                        size="small"
                      >
                        取消
                      </Button>
                    </Space>
                  )}
                </div>
              )}
            </div>
          }
          styles={{
            body: {
              padding: 24,
              paddingBottom: 40,
              height: 'calc(100vh - 176px)',
              overflow: 'auto',
            },
          }}
        >
          {renderContent()}
        </Card>
      </div>

      {/* 右侧：信息通知面板 */}
      <div style={{ width: 360, flexShrink: 0 }}>
        <NoticePanel />
      </div>
    </div>
  );
};

export default WorkBoard;
