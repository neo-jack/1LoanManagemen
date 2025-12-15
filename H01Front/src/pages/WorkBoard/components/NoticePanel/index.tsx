//-----------------------------------------------
// 工作看板 - 信息通知面板组件
// 嵌入在常用模块旁边，显示最新通知
//-----------------------------------------------

import type { NoticeItem } from '@/services';
import { getNoticeList, getUnreadCount, markNoticeAsRead } from '@/services';
import {
  BellOutlined,
  FileTextOutlined,
  RightOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Badge, Card, Empty, List, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

// 通知类型配置
const NOTICE_TYPE_CONFIG: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统' },
  loan: { color: 'green', text: '贷款' },
  flow: { color: 'orange', text: '流程' },
};

const NoticePanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载通知列表（只加载前5条）
  const loadNoticeList = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        getNoticeList({ page: 1, pageSize: 5 }),
        getUnreadCount(),
      ]);

      if (listRes.code === 200) {
        setNoticeList(listRes.data.list);
      }
      if (countRes.code === 200) {
        setUnreadCount(countRes.data.count);
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 延迟加载，等待 token
    const timer = setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        loadNoticeList();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loadNoticeList]);

  // 点击通知
  const handleClickNotice = async (item: NoticeItem) => {
    if (!item.isRead) {
      try {
        await markNoticeAsRead(item.id);
        setNoticeList((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
    navigate(`/xt/notice/${item.id}`);
  };

  // 查看全部
  const handleViewAll = () => {
    navigate('/xt/notice');
  };

  // 获取通知图标
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'flow':
        return <SendOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <Card
      variant="borderless"
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          信息通知
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ marginLeft: 8 }} size="small" />
          )}
        </div>
      }
      extra={
        <a onClick={handleViewAll} style={{ fontSize: 13 }}>
          查看全部 <RightOutlined />
        </a>
      }
      styles={{
        body: {
          padding: '12px 24px',
          maxHeight: 320,
          overflow: 'auto',
        },
      }}
    >
      <Spin spinning={loading}>
        {noticeList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
            style={{ margin: '20px 0' }}
          />
        ) : (
          <List
            dataSource={noticeList}
            renderItem={(item) => {
              const typeConfig =
                NOTICE_TYPE_CONFIG[item.noticeType] ||
                NOTICE_TYPE_CONFIG.system;
              return (
                <List.Item
                  onClick={() => handleClickNotice(item)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 6,
                    marginBottom: 4,
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
                            width: 32,
                            height: 32,
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
                          gap: 6,
                        }}
                      >
                        <Text
                          strong={!item.isRead}
                          ellipsis
                          style={{ fontSize: 13, maxWidth: 180 }}
                        >
                          {item.title}
                        </Text>
                        <Tag
                          color={typeConfig.color}
                          style={{
                            fontSize: 10,
                            lineHeight: '16px',
                            padding: '0 4px',
                          }}
                        >
                          {typeConfig.text}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.publishTime).fromNow()}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Spin>
    </Card>
  );
};

export default NoticePanel;
