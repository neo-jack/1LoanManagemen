//-----------------------------------------------
// 信息通知详情页面
//-----------------------------------------------

import type { NoticeItem } from '@/services';
import { getNoticeDetail, markNoticeAsRead } from '@/services';
import {
  ArrowLeftOutlined,
  BellOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Card, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// 通知类型配置
const NOTICE_TYPE_CONFIG: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统通知' },
  loan: { color: 'green', text: '贷款通知' },
  flow: { color: 'orange', text: '流程通知' },
};

const NoticeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    const loadNoticeDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const res = await getNoticeDetail(id);
        if (res.code === 200) {
          setNotice(res.data);
          // 自动标记为已读
          if (!res.data.isRead) {
            await markNoticeAsRead(id);
          }
        }
      } catch (error) {
        console.error('获取通知详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNoticeDetail();
  }, [id]);

  // 获取通知图标
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <FileTextOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'flow':
        return <SendOutlined style={{ color: '#fa8c16', fontSize: 24 }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff', fontSize: 24 }} />;
    }
  };

  const handleBack = () => {
    navigate('/xt/notice');
  };

  if (loading) {
    return (
      <div
        style={{ padding: 16, backgroundColor: '#f5f5f5', minHeight: '100%' }}
      >
        <Card variant="borderless">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  if (!notice) {
    return (
      <div
        style={{ padding: 16, backgroundColor: '#f5f5f5', minHeight: '100%' }}
      >
        <Card variant="borderless">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">通知不存在或已删除</Text>
            <br />
            <Button type="link" onClick={handleBack}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const typeConfig =
    NOTICE_TYPE_CONFIG[notice.noticeType] || NOTICE_TYPE_CONFIG.system;

  return (
    <div style={{ padding: 16, backgroundColor: '#f5f5f5', minHeight: '100%' }}>
      <Card variant="borderless">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16, padding: 0 }}
        >
          返回列表
        </Button>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            {getNoticeIcon(notice.noticeType)}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                {notice.title}
              </Title>
              <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
            </div>
            <Text type="secondary">
              发布者：{notice.publisherName} ·{' '}
              {dayjs(notice.publishTime).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </div>
        </div>

        <div
          style={{
            padding: 24,
            backgroundColor: '#fafafa',
            borderRadius: 8,
            minHeight: 200,
          }}
        >
          <Paragraph
            style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
          >
            {notice.content}
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default NoticeDetail;
