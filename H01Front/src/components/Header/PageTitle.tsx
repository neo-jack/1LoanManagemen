// 页面标题组件 - 获取当前页面的标题（面包屑最后一级）
import { FC } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle: FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  // 路径映射表
  const pathNameMap: Record<string, string> = {
    xt: '系统',
    workboard: '工作看板',
    workcenter: '工作中台',
    quickwork: '快速工作入口',
    report: '需求直报',
    ai: '杏和智答',
    'quick-qc': '智能质控',
    'risk-item-management': '风险项管理',
    'risk-even-registration': '风险事件登记',
    'not-xt-page': '功能开发中',
  };

  // 根据localStorage中记录的最后点击菜单来确定not-xt-page的实际标题
  function getNotXtPageTitle(): string {
    const lastClickedMenu = localStorage.getItem('lastClickedMenu');

    // 直接返回存储的菜单名称，如果没有则返回默认标题
    if (lastClickedMenu) {
      return lastClickedMenu;
    }

    return '功能开发中'; // 默认标题
  }

  // 获取最后一级路径对应的标题
  const getPageTitle = () => {
    if (pathSnippets.length === 0) {
      return '首页';
    }

    // 检查是否是not-xt-page路径
    const fullPath = location.pathname;
    if (fullPath === '/xt/not-xt-page') {
      return getNotXtPageTitle();
    }

    // 获取最后一个路径片段（跳过 'xt' 前缀）
    const lastSnippet = pathSnippets[pathSnippets.length - 1];

    if (lastSnippet === 'xt' || pathSnippets.length === 1) {
      return '首页';
    }

    return pathNameMap[lastSnippet] || lastSnippet;
  };

  return (
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{getPageTitle()}</div>
  );
};

export default PageTitle;
