import {
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BookOutlined,
  BugOutlined,
  CalendarOutlined,
  CarOutlined,
  CrownOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FileOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InboxOutlined,
  MedicineBoxOutlined,
  MobileOutlined,
  MonitorOutlined,
  RadarChartOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SendOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import React from 'react';

/**
 * 图标映射配置
 * 支持动态图标渲染，统一图标样式管理
 */
export interface IconMapProps {
  fontSize?: string | number;
  color?: string;
}

/**
 * 颜色主题配置
 */
export interface ColorTheme {
  gradient: string;
  shadow: string;
}

/**
 * 预定义的颜色主题映射
 */
export const COLOR_THEMES: Record<string, ColorTheme> = {
  purple: {
    gradient: 'linear-gradient(135deg, #D8AFFF 0%, #E8D1FF 100%)',
    shadow: '0 4px 8px rgba(216, 175, 255, 0.3)',
  },
  green: {
    gradient: 'linear-gradient(135deg, #87E8DE 0%, #B5F5EC 100%)',
    shadow: '0 4px 8px rgba(135, 232, 222, 0.3)',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #91D5FF 0%, #BAE7FF 100%)',
    shadow: '0 4px 8px rgba(145, 213, 255, 0.3)',
  },
  cyan: {
    gradient: 'linear-gradient(135deg, #87E8DE 0%, #B5F5EC 100%)',
    shadow: '0 4px 8px rgba(135, 232, 222, 0.3)',
  },
  orange: {
    gradient: 'linear-gradient(135deg, #FFD591 0%, #FFE7BA 100%)',
    shadow: '0 4px 8px rgba(255, 213, 145, 0.3)',
  },
  pink: {
    gradient: 'linear-gradient(135deg, #FFADD2 0%, #FFC9D8 100%)',
    shadow: '0 4px 8px rgba(255, 173, 210, 0.3)',
  },
  lightBlue: {
    gradient: 'linear-gradient(135deg, #91D5FF 0%, #BAE7FF 100%)',
    shadow: '0 4px 8px rgba(145, 213, 255, 0.3)',
  },
  yellow: {
    gradient: 'linear-gradient(135deg, #FFF566 0%, #FFFB8F 100%)',
    shadow: '0 4px 8px rgba(255, 245, 102, 0.3)',
  },
  lightPurple: {
    gradient: 'linear-gradient(135deg, #D3ADF7 0%, #EFDBFF 100%)',
    shadow: '0 4px 8px rgba(211, 173, 247, 0.3)',
  },
  red: {
    gradient: 'linear-gradient(135deg, #FF7875 0%, #FFA39E 100%)',
    shadow: '0 4px 8px rgba(255, 120, 117, 0.3)',
  },
  gold: {
    gradient: 'linear-gradient(135deg, #FADB14 0%, #FFEC3D 100%)',
    shadow: '0 4px 8px rgba(250, 219, 20, 0.3)',
  },
};

/**
 * 图标名称到颜色主题的映射
 */
export const ICON_COLOR_MAP: Record<string, string> = {
  // 主体业务相关
  AppstoreOutlined: 'pink', // 主体业务/智慧报表平台
  FileSearchOutlined: 'purple', // 报告查询
  DollarOutlined: 'yellow', // 结算管理
  ShopOutlined: 'lightPurple', // 经销商结算
  MobileOutlined: 'cyan', // 核酸移动/移动平均PBRT质控
  SendOutlined: 'pink', // 转运中心
  CarOutlined: 'orange', // 移动转运/外勤管理
  ExperimentOutlined: 'cyan', // 预处理工作站/样本管理/实验室管理
  MedicineBoxOutlined: 'lightBlue', // 常规检验工作站/血糖比对工作站
  RadarChartOutlined: 'cyan', // ELISA管理/智能质控管理
  BugOutlined: 'purple', // 特检工作站/微生物检验工作站
  DatabaseOutlined: 'green', // 样本管理工作站/样本库
  EnvironmentOutlined: 'blue', // 环境卫生
  SettingOutlined: 'lightBlue', // 微生物规则/性能验证/POCT管理中心

  // 质量控制相关
  SafetyOutlined: 'blue', // 质量控制/生物安全
  SafetyCertificateOutlined: 'blue', // 生物安全

  // BI分析相关
  BarChartOutlined: 'purple', // BI分析
  FileOutlined: 'lightBlue', // 智能文档/质量指标统计报告归档
  RobotOutlined: 'orange', // 自动化指导系统

  // 知识库相关
  BookOutlined: 'green', // 知识库

  // 第三方相关
  ApiOutlined: 'orange', // 第三方

  // 维护管理相关
  ToolOutlined: 'lightBlue', // 维护管理

  // 设计器相关
  DesktopOutlined: 'cyan', // 设计器

  // POCT管理相关
  MonitorOutlined: 'lightPurple', // POCT管理

  // 实验室管理相关
  UserOutlined: 'blue', // 人员管理

  // 生物安全相关
  AuditOutlined: 'orange', // 检查管理

  // 实验室管理相关
  CalendarOutlined: 'blue', // 智能排班
  FileTextOutlined: 'lightBlue', // 考试管理
  EditOutlined: 'green', // 阅卷管理
  ExclamationCircleOutlined: 'red', // 错题管理/不良事件管理
  HistoryOutlined: 'purple', // 事务历史记录
  DashboardOutlined: 'cyan', // 温湿度管理
  InboxOutlined: 'orange', // 物料管理
  TeamOutlined: 'blue', // 会议管理
  CrownOutlined: 'gold', // 专家评估

  // 自定义图标 (使用默认颜色主题)
  'icon-zidongzhikong1': 'cyan', // 智能质控
  'icon-tixiwendang': 'blue', // 体系文件
  'icon-feitixiwendang': 'orange', // 非体系文件
  'icon-ziliaoku11': 'green', // 资料库
  'icon-fengxianshijiandengji': 'red', // 风险事件登记
  'icon-renshi1': 'blue', // 人事档案
  'icon-renyuanpinggu': 'purple', // 人员评估
  'icon-paiban': 'cyan', // 智能排班
  'icon-a-wodeziliao3': 'lightBlue', // 我的资料
  'icon-kaoshiguanli1': 'orange', // 考试管理

  // 子菜单图标
  'icon-jilubiaoge': 'lightBlue', // 记录表格
  'icon-zuoyezhidaoshu': 'green', // 作业指导书
  'icon-chengxuwenjian': 'purple', // 程序文件
  'icon-zhiliangmubiao': 'gold', // 质量目标
  'icon-zhiliangshouce': 'blue', // 质量手册
  'icon-shengan': 'orange', // 生安管理
  'icon-xitongyonghushouce': 'lightBlue', // 系统用户手册
  'icon-anquanshouce': 'red', // 安全手册
  'icon-jianyicaozuoka': 'green', // 简易操作卡
  'icon-wenzhangwenxian': 'purple', // 文章文献
  'icon-peixunziliao': 'cyan', // 培训资料
  'icon-yuangongziping': 'blue', // 员工自评
  'icon-zhuanjiakaoping': 'gold', // 专家考评
  'icon-wodedangwen': 'lightBlue', // 我的文档
  'icon-zuijindangwen': 'green', // 最近文档
  'icon-wodeshoucang': 'yellow', // 我的收藏
  'icon-huishouzhan': 'red', // 回收站
  'icon-kaoshiguanli': 'orange', // 考试管理
  'icon-pingjuanguanli': 'blue', // 评卷管理
  'icon-cuotiguanli': 'red', // 错题管理

  // 默认颜色
  default: 'purple',
};

/**
 * 获取图标组件的映射函数
 * @param iconName 图标名称
 * @param props 图标属性配置
 * @returns React.ReactNode
 */
export const getIconComponent = (
  iconName: string,
  props: IconMapProps = { fontSize: '24px', color: '#fff' },
): React.ReactNode => {
  const { fontSize, color } = props;
  const iconStyle = { fontSize, color };

  // Ant Design 图标映射
  const iconMap: Record<string, React.ReactNode> = {
    // 主体业务相关图标
    AppstoreOutlined: <AppstoreOutlined style={iconStyle} />,
    FileSearchOutlined: <FileSearchOutlined style={iconStyle} />,
    DollarOutlined: <DollarOutlined style={iconStyle} />,
    ShopOutlined: <ShopOutlined style={iconStyle} />,
    MobileOutlined: <MobileOutlined style={iconStyle} />,
    SendOutlined: <SendOutlined style={iconStyle} />,
    CarOutlined: <CarOutlined style={iconStyle} />,
    ExperimentOutlined: <ExperimentOutlined style={iconStyle} />,
    MedicineBoxOutlined: <MedicineBoxOutlined style={iconStyle} />,
    RadarChartOutlined: <RadarChartOutlined style={iconStyle} />,
    BugOutlined: <BugOutlined style={iconStyle} />,
    DatabaseOutlined: <DatabaseOutlined style={iconStyle} />,
    EnvironmentOutlined: <EnvironmentOutlined style={iconStyle} />,
    SettingOutlined: <SettingOutlined style={iconStyle} />,

    // 质量控制和安全相关图标
    SafetyOutlined: <SafetyOutlined style={iconStyle} />,
    SafetyCertificateOutlined: <SafetyCertificateOutlined style={iconStyle} />,

    // BI分析相关图标
    BarChartOutlined: <BarChartOutlined style={iconStyle} />,
    FileOutlined: <FileOutlined style={iconStyle} />,
    RobotOutlined: <RobotOutlined style={iconStyle} />,

    // 知识库相关图标
    BookOutlined: <BookOutlined style={iconStyle} />,

    // 第三方相关图标
    ApiOutlined: <ApiOutlined style={iconStyle} />,

    // 维护管理相关图标
    ToolOutlined: <ToolOutlined style={iconStyle} />,

    // 设计器相关图标
    DesktopOutlined: <DesktopOutlined style={iconStyle} />,

    // POCT管理相关图标
    MonitorOutlined: <MonitorOutlined style={iconStyle} />,

    // 实验室管理相关图标
    UserOutlined: <UserOutlined style={iconStyle} />,

    // 生物安全相关图标
    AuditOutlined: <AuditOutlined style={iconStyle} />,

    // 实验室管理相关图标
    CalendarOutlined: <CalendarOutlined style={iconStyle} />,
    FileTextOutlined: <FileTextOutlined style={iconStyle} />,
    EditOutlined: <EditOutlined style={iconStyle} />,
    ExclamationCircleOutlined: <ExclamationCircleOutlined style={iconStyle} />,
    HistoryOutlined: <HistoryOutlined style={iconStyle} />,
    DashboardOutlined: <DashboardOutlined style={iconStyle} />,
    InboxOutlined: <InboxOutlined style={iconStyle} />,
    TeamOutlined: <TeamOutlined style={iconStyle} />,
    CrownOutlined: <CrownOutlined style={iconStyle} />,

    // 自定义图标 (使用占位符图标，后续可替换为实际图标组件)
    'icon-zidongzhikong1': <AppstoreOutlined style={iconStyle} />, // 智能质控
    'icon-tixiwendang': <FileTextOutlined style={iconStyle} />, // 体系文件
    'icon-feitixiwendang': <FileOutlined style={iconStyle} />, // 非体系文件
    'icon-ziliaoku11': <BookOutlined style={iconStyle} />, // 资料库
    'icon-fengxianshijiandengji': (
      <ExclamationCircleOutlined style={iconStyle} />
    ), // 风险事件登记
    'icon-renshi1': <UserOutlined style={iconStyle} />, // 人事档案
    'icon-renyuanpinggu': <TeamOutlined style={iconStyle} />, // 人员评估
    'icon-paiban': <CalendarOutlined style={iconStyle} />, // 智能排班
    'icon-a-wodeziliao3': <InboxOutlined style={iconStyle} />, // 我的资料
    'icon-kaoshiguanli1': <FileTextOutlined style={iconStyle} />, // 考试管理

    // 子菜单图标
    'icon-jilubiaoge': <FileTextOutlined style={iconStyle} />, // 记录表格
    'icon-zuoyezhidaoshu': <BookOutlined style={iconStyle} />, // 作业指导书
    'icon-chengxuwenjian': <FileOutlined style={iconStyle} />, // 程序文件
    'icon-zhiliangmubiao': <CrownOutlined style={iconStyle} />, // 质量目标
    'icon-zhiliangshouce': <FileTextOutlined style={iconStyle} />, // 质量手册
    'icon-shengan': <SafetyOutlined style={iconStyle} />, // 生安管理
    'icon-xitongyonghushouce': <BookOutlined style={iconStyle} />, // 系统用户手册
    'icon-anquanshouce': <SafetyCertificateOutlined style={iconStyle} />, // 安全手册
    'icon-jianyicaozuoka': <FileTextOutlined style={iconStyle} />, // 简易操作卡
    'icon-wenzhangwenxian': <BookOutlined style={iconStyle} />, // 文章文献
    'icon-peixunziliao': <BookOutlined style={iconStyle} />, // 培训资料
    'icon-yuangongziping': <UserOutlined style={iconStyle} />, // 员工自评
    'icon-zhuanjiakaoping': <CrownOutlined style={iconStyle} />, // 专家考评
    'icon-wodedangwen': <FileOutlined style={iconStyle} />, // 我的文档
    'icon-zuijindangwen': <HistoryOutlined style={iconStyle} />, // 最近文档
    'icon-wodeshoucang': <InboxOutlined style={iconStyle} />, // 我的收藏
    'icon-huishouzhan': <ExclamationCircleOutlined style={iconStyle} />, // 回收站
    'icon-kaoshiguanli': <FileTextOutlined style={iconStyle} />, // 考试管理
    'icon-pingjuanguanli': <EditOutlined style={iconStyle} />, // 评卷管理
    'icon-cuotiguanli': <ExclamationCircleOutlined style={iconStyle} />, // 错题管理
  };

  return iconMap[iconName] || <AppstoreOutlined style={iconStyle} />;
};

/**
 * 获取所有可用的图标名称列表
 * @returns string[] 图标名称数组
 */
export const getAvailableIconNames = (): string[] => {
  return [
    // 主体业务相关图标
    'AppstoreOutlined',
    'FileSearchOutlined',
    'DollarOutlined',
    'ShopOutlined',
    'MobileOutlined',
    'SendOutlined',
    'CarOutlined',
    'ExperimentOutlined',
    'MedicineBoxOutlined',
    'RadarChartOutlined',
    'BugOutlined',
    'DatabaseOutlined',
    'EnvironmentOutlined',
    'SettingOutlined',

    // 质量控制和安全相关图标
    'SafetyOutlined',
    'SafetyCertificateOutlined',

    // BI分析相关图标
    'BarChartOutlined',
    'FileOutlined',
    'RobotOutlined',

    // 知识库相关图标
    'BookOutlined',

    // 第三方相关图标
    'ApiOutlined',

    // 维护管理相关图标
    'ToolOutlined',

    // 设计器相关图标
    'DesktopOutlined',

    // POCT管理相关图标
    'MonitorOutlined',

    // 实验室管理相关图标
    'UserOutlined',

    // 生物安全相关图标
    'AuditOutlined',

    // 实验室管理相关图标
    'CalendarOutlined',
    'FileTextOutlined',
    'EditOutlined',
    'ExclamationCircleOutlined',
    'HistoryOutlined',
    'DashboardOutlined',
    'InboxOutlined',
    'TeamOutlined',
    'CrownOutlined',

    // 自定义图标
    'icon-zidongzhikong1',
    'icon-tixiwendang',
    'icon-feitixiwendang',
    'icon-ziliaoku11',
    'icon-fengxianshijiandengji',
    'icon-renshi1',
    'icon-renyuanpinggu',
    'icon-paiban',
    'icon-a-wodeziliao3',
    'icon-kaoshiguanli1',

    // 子菜单图标
    'icon-jilubiaoge',
    'icon-zuoyezhidaoshu',
    'icon-chengxuwenjian',
    'icon-zhiliangmubiao',
    'icon-zhiliangshouce',
    'icon-shengan',
    'icon-xitongyonghushouce',
    'icon-anquanshouce',
    'icon-jianyicaozuoka',
    'icon-wenzhangwenxian',
    'icon-peixunziliao',
    'icon-yuangongziping',
    'icon-zhuanjiakaoping',
    'icon-wodedangwen',
    'icon-zuijindangwen',
    'icon-wodeshoucang',
    'icon-huishouzhan',
    'icon-kaoshiguanli',
    'icon-pingjuanguanli',
    'icon-cuotiguanli',
  ];
};
