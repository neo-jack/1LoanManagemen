// 侧边栏导航组件
import { getIconComponent } from '@/components/Card/iconMap';
import { MenuItem as ApiMenuItem, MENU_STATUS } from '@/constants/meus';
import { useMenu } from '@/constants/usemeus';
import { workBoardManager } from '@/models/useworkboard';
import { Alert, Menu, Spin } from 'antd';
import { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.less';

interface AntdMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: AntdMenuItem[];
  url?: string | null; // 菜单项的URL
  menuNo?: string; // 菜单编号
}

const SideBar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 直接使用 useMenu hook，让请求拦截器处理 token 验证
  const { menuList, status, error, refreshMenus } = useMenu();

  // 将 API 菜单数据转换为 Antd Menu 组件所需的格式
  const convertApiMenuToAntdMenu = (
    apiMenuItems: ApiMenuItem[],
  ): AntdMenuItem[] => {
    return apiMenuItems.map((item) => {
      const menuItem: AntdMenuItem = {
        key: item.MENU_NO, // 使用MENU_NO作为唯一标识符，避免重复
        label: item.MENU_NAME,
        icon: item.MENU_ICON
          ? getIconComponent(item.MENU_ICON, {
              fontSize: '16px',
              color: 'currentColor',
            })
          : undefined,
        // 添加原始数据用于后续查找
        url: item.MENU_URL,
        menuNo: item.MENU_NO,
      };

      // 递归处理子菜单
      if (item.SUB_MENU && item.SUB_MENU.length > 0) {
        menuItem.children = convertApiMenuToAntdMenu(item.SUB_MENU);
      }

      return menuItem;
    });
  };

  // 获取菜单项配置
  const menuItems: AntdMenuItem[] = useMemo(() => {
    if (status === MENU_STATUS.SUCCESS && menuList.length > 0) {
      return convertApiMenuToAntdMenu(menuList);
    }

    // 如果没有 token 或者菜单加载失败，返回空数组
    return [];
  }, [menuList, status]);

  // 获取当前应该选中的菜单key（使用MENU_NO避免重复）
  const getSelectedKeys = (): string[] => {
    const currentPath = location.pathname;

    // 特殊处理：如果是 not-xt-page 页面，尝试从 localStorage 获取最后点击的菜单项
    if (currentPath === '/xt/not-xt-page') {
      const lastClickedMenuNo = sessionStorage.getItem('lastClickedMenuNo');
      if (lastClickedMenuNo) {
        return [lastClickedMenuNo];
      }
    }

    // 递归查找匹配的菜单项，返回MENU_NO
    const findMatchingMenuNo = (
      items: AntdMenuItem[],
      path: string,
    ): string | null => {
      for (const item of items) {
        // 检查菜单项的URL是否匹配当前路径
        if (item?.url === path) {
          return item.menuNo || null;
        }
        if (item?.children) {
          const found = findMatchingMenuNo(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const matchedMenuNo = findMatchingMenuNo(menuItems, currentPath);
    return matchedMenuNo ? [matchedMenuNo] : [];
  };

  const handleMenuClick = (info: any) => {
    const { key } = info;

    // 根据key查找对应的MENU_NO、菜单名称和URL
    const findMenuInfo = (
      items: AntdMenuItem[],
      targetKey: string,
    ): {
      menuNo: string | null;
      menuName: string | null;
      url: string | null;
    } => {
      for (const item of items) {
        if (item?.key === targetKey) {
          return {
            menuNo: item.menuNo || null,
            menuName: item.label as string,
            url: item.url || null,
          };
        }
        if (item?.children) {
          const found = findMenuInfo(item.children, targetKey);
          if (found.menuNo) return found;
        }
      }
      return { menuNo: null, menuName: null, url: null };
    };

    const { menuNo, menuName, url } = findMenuInfo(menuItems, key);

    if (url === '/xt/workboard' || url === '/xt/workcenter') {
      workBoardManager.clearData();
    }

    // 检测是否为网页地址（包含 http:// 或 https://）
    if (url && (url.includes('http://') || url.includes('https://'))) {
      // 如果是网页地址，导航到 /xt/not-xt-page，并存储MENU_NO和菜单名称
      if (menuNo) {
        sessionStorage.setItem('lastClickedMenuNo', menuNo);
      }
      if (menuName) {
        sessionStorage.setItem('lastClickedMenu', menuName);
      }
      navigate('/xt/not-xt-page');
    } else if (url && url.startsWith('/')) {
      // 对于有效的菜单项，直接导航，并存储MENU_NO和菜单名称
      if (menuNo) {
        sessionStorage.setItem('lastClickedMenuNo', menuNo);
      }
      if (menuName) {
        sessionStorage.setItem('lastClickedMenu', menuName);
      }
      navigate(url);
    } else {
      // 对于其他类型的URL，可能需要特殊处理
      console.warn('未识别的菜单项URL:', url);
    }
  };

  // 渲染加载中状态
  if (status === MENU_STATUS.LOADING) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#A5EAFF',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 渲染错误状态
  if (status === MENU_STATUS.ERROR || error) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: '#001529',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Alert
          message="菜单加载失败"
          description={error || '无法获取菜单数据，请刷新页面重试'}
          type="error"
          showIcon
          action={
            <button
              onClick={refreshMenus}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#ff4d4f',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              重试
            </button>
          }
        />
      </div>
    );
  }

  // 渲染正常菜单
  return (
    <Menu
      mode="inline"
      selectedKeys={getSelectedKeys()}
      items={menuItems as any[]}
      onClick={handleMenuClick}
      theme="dark"
      style={{
        height: '100%',
        borderRight: 0,
        backgroundColor: '#001529',
        color: '#A5EAFF',
        fontSize: '16px',
        flex: 1,
      }}
      className="sidebar-menu"
    />
  );
};

export default SideBar;
