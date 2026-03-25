import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Timeline, Spin, Button, Image, Space, message } from 'antd';
import { DownloadOutlined, EyeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from '@umijs/max';
import { getApplicationDetail } from '@/services/loan';
import { downloadAttachmentFile } from '@/utils/download';

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

  const { application, formFields, flowTasks, flowNodes } = detail;
  const status = statusMap[application?.status] || { color: 'default', text: application?.status };

  /**
   * 根据流程节点构建 Timeline 数据
   * 按节点顺序展示：开始 → 审核员审核 → 总审核审核 → 结束
   */
  const buildFlowTimeline = () => {
    if (!flowNodes || flowNodes.length === 0) return [];

    const nodeTypeMap: Record<string, string> = {
      start: '开始',
      end: '结束',
    };

    return flowNodes.map((node: any) => {
      // 找到该节点关联的有效 task（排除 cancelled）
      const nodeTasks = (flowTasks || []).filter(
        (t: any) => t.nodeId === node.id && t.status !== 'cancelled',
      );

      // 判断节点状态
      const currentNodeId = detail.flowInstance?.currentNodeId;
      const instanceStatus = detail.flowInstance?.status;
      const isCompleted =
        node.nodeType === 'start' ||
        (node.nodeType === 'end' && instanceStatus === 'completed') ||
        nodeTasks.some((t: any) => t.status === 'approved');
      const isRejected = nodeTasks.some((t: any) => t.status === 'rejected');
      const isCurrent = currentNodeId === node.id && instanceStatus === 'running';
      const isPending = !isCompleted && !isRejected && !isCurrent;

      // 节点颜色
      let color = 'gray';
      if (isCompleted) color = 'green';
      else if (isRejected) color = 'red';
      else if (isCurrent) color = 'blue';

      // 节点标题
      const title = node.nodeName || nodeTypeMap[node.nodeType] || node.nodeType;

      // 节点状态文字
      let statusText = '待流转';
      if (node.nodeType === 'start') statusText = '已提交';
      else if (node.nodeType === 'end') statusText = instanceStatus === 'completed' ? '已完成' : '待完成';
      else if (isCompleted) statusText = '已通过';
      else if (isRejected) statusText = '已驳回';
      else if (isCurrent) statusText = '处理中';

      return {
        color,
        children: (
          <div>
            <div>
              <strong>{title}</strong>
              <Tag color={color} style={{ marginLeft: 8 }}>{statusText}</Tag>
            </div>
            {/* 审核节点展示具体 task 信息 */}
            {node.nodeType === 'audit' && nodeTasks.length > 0 && (
              <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #f0f0f0' }}>
                {nodeTasks.map((task: any) => (
                  <div key={task.id} style={{ marginBottom: 4, fontSize: 13, color: '#666' }}>
                    {task.comment && <div>意见：{task.comment}</div>}
                    {task.handleTime && (
                      <div style={{ color: '#999', fontSize: 12 }}>
                        {new Date(task.handleTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      };
    });
  };

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
                  {field.fieldType === 'upload' ? (
                    (() => {
                      const files = application.formData[field.fieldName];
                      if (!Array.isArray(files) || files.length === 0) return '-';
                      return (
                        <Space direction="vertical" size={4}>
                          {files.map((file: any, idx: number) => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name || '');
                            return (
                              <Space key={file.uid || idx} size={8}>
                                <PaperClipOutlined />
                                <span>{file.name}</span>
                                {isImage && file.url && (
                                  <Image
                                    src={file.url}
                                    width={60}
                                    style={{ cursor: 'pointer' }}
                                    preview={{ mask: <EyeOutlined /> }}
                                  />
                                )}
                                {file.fileName && (
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => downloadAttachmentFile(file.fileName)}
                                  >
                                    下载
                                  </Button>
                                )}
                              </Space>
                            );
                          })}
                        </Space>
                      );
                    })()
                  ) : (
                    application.formData[field.fieldName] || '-'
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* 审批流程 */}
        {flowNodes && flowNodes.length > 0 && (
          <Card title="审批流程" style={{ marginTop: 24 }} size="small">
            <Timeline items={buildFlowTimeline()} />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ApplyDetail;
