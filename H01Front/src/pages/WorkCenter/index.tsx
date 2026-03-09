//-----------------------------------------------
// 工作中台
// 使用 API 获取菜单栏、收藏列表、模块列表
//
// 功能:
// 1. 动态加载分类菜单
// 2. 根据选择的分类加载模块列表
// 3. 收藏功能管理
// 4. 响应式布局和状态管理
//-----------------------------------------------

import { FavoriteModuleCard } from '@/components/Card';
import type { SubModule } from '@/constants/workboard';
import useWorkBoard from '@/models/useworkboard';
import { Alert, Empty, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import WorkCenterSidebar from './components/Sidebar';

const WorkCenter: React.FC = () => {
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // 使用 WorkBoard Hook 获取数据和操作方法
  const {
    categories,
    currentModules,
    selectedCategory,
    loading,
    error,
    loadCategories,
    loadModules,
    addToFavorites,
    removeFromFavorites,
  } = useWorkBoard();

  // 初始化数据加载
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 加载分类列表
        await loadCategories();
      } catch (error) {
        console.error('初始化工作中心数据失败:', error);
        message.error('加载数据失败，请刷新页面重试');
      }
    };

    initializeData();
  }, [loadCategories]);

  // 处理菜单选择
  const handleMenuSelect = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    loadModules(categoryName);
  };

  // 处理收藏状态变化
  const handleFavoriteChange = async (
    module: SubModule,
    isFavorite: boolean,
  ) => {
    try {
      if (isFavorite) {
        await addToFavorites(module);
      } else {
        await removeFromFavorites(module.id);
      }
    } catch (error) {
      console.error('更新本地收藏状态失败:', error);
    }
  };

  // 错误状态渲染
  if (error.categories) {
    return (
      <div
        style={{
          height: 'calc(100vh - 88px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F6F9FF',
        }}
      >
        <Alert
          message="加载失败"
          description={error.categories}
          type="error"
          showIcon
          action={
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: '12px',
                padding: '4px 16px',
                border: '1px solid #ff4d4f',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#ff4d4f',
                cursor: 'pointer',
              }}
            >
              重新加载
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 88px)',
        display: 'flex',
        backgroundColor: '#F6F9FF',
      }}
    >
      {/* 左侧菜单栏 */}
      <div style={{ width: '280px', backgroundColor: '#fff', height: '100%' }}>
        <Spin spinning={loading.categories} tip="加载分类中...">
          <WorkCenterSidebar
            categories={categories}
            selectedCategoryName={selectedCategoryName}
            onSelect={handleMenuSelect}
          />
        </Spin>
      </div>

      {/* 右侧内容区 */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FAFBFF',
          padding: '20px',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Spin spinning={loading.modules} tip="加载模块中...">
          {error.modules ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
              }}
            >
              <Alert
                message="加载模块失败"
                description={error.modules}
                type="error"
                showIcon
                action={
                  <button
                    onClick={() =>
                      selectedCategoryName && loadModules(selectedCategoryName)
                    }
                    style={{
                      marginLeft: '12px',
                      padding: '4px 16px',
                      border: '1px solid #ff4d4f',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#ff4d4f',
                      cursor: 'pointer',
                    }}
                  >
                    重试
                  </button>
                }
              />
            </div>
          ) : currentModules.length === 0 ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
              }}
            >
              <Empty
                description={
                  selectedCategoryName
                    ? `${selectedCategoryName} 分类下暂无模块`
                    : '请选择分类查看模块'
                }
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignContent: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              {currentModules.map((module) => (
                <FavoriteModuleCard
                  key={module.id}
                  module={module}
                  showFavorite={true}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default WorkCenter;
