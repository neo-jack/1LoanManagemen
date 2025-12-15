//-----------------------------------------------
// 信息通知列表页面
//-----------------------------------------------

import type { NoticeItem, NoticeType } from '@/services';
import {
  getNoticeList,
  markAllNoticeAsRead,
  markNoticeAsRead,
} from '@/services';
import {
  BellOutlined,
  CheckOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Empty,
  List,
  message,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

// 通知类型配置
const NOTICE_TYPE_CONFIG: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统通知' },
  loan: { color: 'green', text: '贷款通知' },
  flow: { color: 'orange', text: '流程通知' },
};

const NoticeList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('all');

  // 加载通知列表
  const loadNoticeList = useCallback(
    async (page: number = 1, type?: NoticeType) => {
      setLoading(true);
      try {
        const params: {
          page: number;
          pageSize: number;
          noticeType?: NoticeType;
        } = {
          page,
          pageSize: 10,
        };
        if (type && type !== ('all' as string)) {
          params.noticeType = type as NoticeType;
        }

        const res = await getNoticeList(params);
        if (res.code === 200) {
          setNoticeList(res.data.list);
          setTotal(res.data.total);
        }
      } catch (error) {
        console.error('获取通知列表失败:', error);
        message.error('获取通知列表失败');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadNoticeList(currentPage, activeTab as NoticeType);
  }, [currentPage, activeTab, loadNoticeList]);

  // 点击通知
  const handleClickNotice = async (item: NoticeItem) => {
    if (!item.isRead) {
      try {
        await markNoticeAsRead(item.id);
        setNoticeList((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
    navigate(`/xt/notice/${item.id}`);
  };

  // 全部标记已读
  const handleMarkAllRead = async () => {
    try {
      await markAllNoticeAsRead();
      setNoticeList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      message.success('已全部标记为已读');
    } catch (error) {
      console.error('标记全部已读失败:', error);
      message.error('操作失败');
    }
  };

  // 获取通知图标
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <FileTextOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
      case 'flow':
        return <SendOutlined style={{ color: '#fa8c16', fontSize: 20 }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
    }
  };

  // Tab 切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'system', label: '系统通知' },
    { key: 'loan', label: '贷款通知' },
    { key: 'flow', label: '流程通知' },
  ];

  return (
    <div style={{ padding: 16, backgroundColor: '#f5f5f5', minHeight: '100%' }}>
      <Card
        variant="borderless"
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            信息通知
          </div>
        }
        extra={
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
          >
            全部已读
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />

        <Spin spinning={loading}>
          {noticeList.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无通知"
              style={{ margin: '40px 0' }}
            />
          ) : (
            <List
              dataSource={noticeList}
              pagination={{
                current: currentPage,
                total,
                pageSize: 10,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
              }}
              renderItem={(item) => {
                const typeConfig =
                  NOTICE_TYPE_CONFIG[item.noticeType] ||
                  NOTICE_TYPE_CONFIG.system;
                return (
                  <List.Item
                    onClick={() => handleClickNotice(item)}
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      borderRadius: 8,
                      marginBottom: 8,
                      backgroundColor: item.isRead ? '#fff' : '#f6ffed',
                      border: item.isRead
                        ? '1px solid #f0f0f0'
                        : '1px solid #d9f7be',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!item.isRead} offset={[-2, 2]}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: item.isRead
                                ? '#f5f5f5'
                                : '#e6f7ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getNoticeIcon(item.noticeType)}
                          </div>
                        </Badge>
                      }
                      title={
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Text strong={!item.isRead} style={{ fontSize: 15 }}>
                            {item.title}
                          </Text>
                          <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 4, color: '#666' }}
                          >
                            {item.content}
                          </Paragraph>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.publishTime).format('YYYY-MM-DD HH:mm')}{' '}
                            · {item.publisherName}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default NoticeList;
