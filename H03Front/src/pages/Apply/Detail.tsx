import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Timeline, Spin, Button, message } from 'antd';
import { useParams, useNavigate } from '@umijs/max';
import { getApplicationDetail } from '@/services/loan';

/**
 * 申请状态标签映射
 */
const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  auditing: { color: 'warning', text: '审核中' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已驳回' },
  completed: { color: 'default', text: '已完成' },
};

/**
 * 申请详情页
 */
const ApplyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getApplicationDetail(Number(id));
      if (res.code === 200) {
        setDetail(res.data);
      }
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !detail) {
    return <Spin spinning={loading} style={{ display: 'block', margin: '100px auto' }} />;
  }

  const { application, formFields, flowTasks } = detail;
  const status = statusMap[application?.status] || { color: 'default', text: application?.status };

  return (
    <div>
      <Card title="申请详情" extra={<Button onClick={() => navigate(-1)}>返回</Button>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="申请编号">{application?.applicationNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={status.color}>{status.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="贷款类型">{application?.loanType}</Descriptions.Item>
          <Descriptions.Item label="申请金额">¥{application?.amount?.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="贷款用途" span={2}>{application?.purpose || '-'}</Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {application?.submitTime ? new Date(application.submitTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {application?.createdAt ? new Date(application.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* 表单数据 */}
        {application?.formData && Object.keys(application.formData).length > 0 && (
          <Card title="表单信息" style={{ marginTop: 24 }} size="small">
            <Descriptions bordered column={2}>
              {formFields?.map((field: any) => (
                <Descriptions.Item key={field.fieldName} label={field.fieldLabel}>
                  {application.formData[field.fieldName] || '-'}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* 审批流程 */}
        {flowTasks && flowTasks.length > 0 && (
          <Card title="审批流程" style={{ marginTop: 24 }} size="small">
            <Timeline
              items={flowTasks.map((task: any) => ({
                color: task.status === 'approved' ? 'green' : task.status === 'rejected' ? 'red' : 'blue',
                children: (
                  <div>
                    <div><strong>{task.status === 'pending' ? '待处理' : task.status === 'approved' ? '已通过' : '已驳回'}</strong></div>
                    {task.comment && <div style={{ color: '#666' }}>意见：{task.comment}</div>}
                    {task.handleTime && <div style={{ color: '#999', fontSize: 12 }}>{new Date(task.handleTime).toLocaleString()}</div>}
                  </div>
                ),
              }))}
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ApplyDetail;
