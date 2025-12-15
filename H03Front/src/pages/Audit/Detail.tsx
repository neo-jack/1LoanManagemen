import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Input, message, Spin, Space, Modal } from 'antd';
import { useParams, useNavigate } from '@umijs/max';
import { request } from '@umijs/max';

const { TextArea } = Input;

/**
 * 审核详情页
 */
const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await request(`/api/flow/audit/task/${id}`, { method: 'GET' });
      if (res.code === 200) {
        setDetail(res.data);
      }
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 审批通过
  const handleApprove = async () => {
    Modal.confirm({
      title: '确认通过',
      content: '确定要通过这个申请吗？',
      onOk: async () => {
        setSubmitting(true);
        try {
          const res = await request(`/api/flow/audit/${id}/approve`, {
            method: 'POST',
            data: { comment },
          });
          if (res.code === 200) {
            message.success('审批通过');
            navigate('/loan/audit/list');
          }
        } catch (error) {
          message.error('操作失败');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // 审批驳回
  const handleReject = async () => {
    if (!comment.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    Modal.confirm({
      title: '确认驳回',
      content: '确定要驳回这个申请吗？',
      onOk: async () => {
        setSubmitting(true);
        try {
          const res = await request(`/api/flow/audit/${id}/reject`, {
            method: 'POST',
            data: { comment },
          });
          if (res.code === 200) {
            message.success('已驳回');
            navigate('/loan/audit/list');
          }
        } catch (error) {
          message.error('操作失败');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  if (loading || !detail) {
    return <Spin spinning={loading} style={{ display: 'block', margin: '100px auto' }} />;
  }

  const { task, businessData } = detail;

  return (
    <div>
      <Card title="审核详情" extra={<Button onClick={() => navigate(-1)}>返回</Button>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="申请编号">{businessData?.applicationNo}</Descriptions.Item>
          <Descriptions.Item label="贷款类型">{businessData?.loanType}</Descriptions.Item>
          <Descriptions.Item label="申请金额">¥{businessData?.amount?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="贷款用途">{businessData?.purpose || '-'}</Descriptions.Item>
          <Descriptions.Item label="提交时间" span={2}>
            {businessData?.submitTime ? new Date(businessData.submitTime).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* 表单数据 */}
        {businessData?.formData && (
          <Card title="申请表单信息" style={{ marginTop: 24 }} size="small">
            <Descriptions bordered column={2}>
              {Object.entries(businessData.formData).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {String(value) || '-'}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* 审批操作 */}
        {task?.status === 'pending' && (
          <Card title="审批操作" style={{ marginTop: 24 }} size="small">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>审批意见：</div>
              <TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请输入审批意见（驳回时必填）"
              />
            </div>
            <Space>
              <Button type="primary" onClick={handleApprove} loading={submitting}>
                通过
              </Button>
              <Button danger onClick={handleReject} loading={submitting}>
                驳回
              </Button>
            </Space>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default AuditDetail;
