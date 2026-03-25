import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Descriptions, Modal, Spin, Upload, Image, Space, message } from 'antd';
import { DownloadOutlined, EyeOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useParams, useNavigate } from '@umijs/max';
import { getRepaymentPlanDetail, repaySchedule } from '@/services/repayment';
import { deleteAttachment } from '@/services/loan';
import { downloadAttachmentFile } from '@/utils/download';

/**
 * 还款明细状态映射
 */
const scheduleStatusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '待还款' },
  paid: { color: 'success', text: '已还款' },
  overdue: { color: 'error', text: '逾期' },
  partial: { color: 'warning', text: '部分还款' },
};

/**
 * 判断文件是否为图片
 */
const isImageFile = (name: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);

/**
 * 还款计划详情页（学生）
 */
const RepaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  // 还款弹窗
  const [repayModalVisible, setRepayModalVisible] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // 图片预览
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getRepaymentPlanDetail(Number(id));
      if (res.code === 200) {
        setDetail(res.data);
      }
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开还款弹窗
   */
  const handleRepay = (schedule: any) => {
    setCurrentSchedule(schedule);
    setFileList([]);
    setRepayModalVisible(true);
  };

  /**
   * 提交还款（附带凭证）
   */
  const handleSubmitRepay = async () => {
    const doneFiles = fileList.filter((f) => f.status === 'done');
    if (doneFiles.length === 0) {
      message.warning('请上传还款凭证/发票');
      return;
    }

    const attachments = doneFiles.map((f: any) => ({
      uid: f.uid,
      name: f.name,
      fileName: f.fileName || f.response?.data?.filename,
      url: f.url || f.response?.data?.url,
      type: f.type || f.response?.data?.type,
    }));

    setSubmitting(true);
    try {
      const res = await repaySchedule(currentSchedule.id, attachments);
      if (res.code === 200) {
        message.success('还款成功');
        setRepayModalVisible(false);
        loadDetail();
      }
    } catch (error) {
      message.error('还款失败');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 上传组件配置
   */
  const getUploadProps = (): UploadProps => {
    const token = sessionStorage.getItem('accessToken');
    return {
      action: '/api/loan/attachment/upload',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      fileList,
      onChange(info) {
        const { file, fileList: newFileList } = info;
        setFileList(newFileList);
        if (file.status === 'done' && file.response?.code === 200) {
          const respData = file.response.data;
          const updated = newFileList.map((f) =>
            f.uid === file.uid
              ? { ...f, url: respData.url, fileName: respData.filename, name: respData.name }
              : f,
          );
          setFileList(updated);
          message.success(`${respData.name} 上传成功`);
        } else if (file.status === 'error') {
          message.error(`${file.name} 上传失败`);
        }
      },
      async onRemove(file) {
        const filename = (file as any).fileName || file.response?.data?.filename;
        if (filename) {
          try { await deleteAttachment(filename); } catch { /* 静默 */ }
        }
        return true;
      },
    };
  };

  /**
   * 渲染附件列表（已还款期数的凭证）
   */
  const renderAttachments = (attachments: any[]) => {
    if (!Array.isArray(attachments) || attachments.length === 0) return '-';
    return (
      <Space direction="vertical" size={2}>
        {attachments.map((file: any, idx: number) => (
          <Space key={file.uid || idx} size={4}>
            <PaperClipOutlined />
            <span style={{ fontSize: 12 }}>{file.name}</span>
            {isImageFile(file.name) && file.url && (
              <Image src={file.url} width={40} preview={{ mask: <EyeOutlined /> }} />
            )}
            {file.fileName && (
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadAttachmentFile(file.fileName)}
              />
            )}
          </Space>
        ))}
      </Space>
    );
  };

  if (loading || !detail) {
    return <Spin spinning={loading} style={{ display: 'block', margin: '100px auto' }} />;
  }

  const { plan, schedules, application } = detail;

  const columns = [
    {
      title: '期数',
      dataIndex: 'periodNumber',
      key: 'periodNumber',
      render: (val: number) => `第${val}期`,
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '应还本金',
      dataIndex: 'principal',
      key: 'principal',
      render: (val: number) => `¥${Number(val).toFixed(2)}`,
    },
    {
      title: '应还利息',
      dataIndex: 'interest',
      key: 'interest',
      render: (val: number) => `¥${Number(val).toFixed(2)}`,
    },
    {
      title: '应还总额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => `¥${Number(val).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const s = scheduleStatusMap[val] || { color: 'default', text: val };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '还款凭证',
      dataIndex: 'attachments',
      key: 'attachments',
      render: (val: any[]) => renderAttachments(val),
    },
    {
      title: '还款日期',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (val: string) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status === 'pending' || record.status === 'overdue') {
          return (
            <Button type="primary" size="small" onClick={() => handleRepay(record)}>
              立即还款
            </Button>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  return (
    <div>
      <Card title="还款计划详情" extra={<Button onClick={() => navigate(-1)}>返回</Button>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="贷款编号">{application?.applicationNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="贷款金额">¥{Number(plan?.totalAmount).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="年利率">{plan?.interestRate}%</Descriptions.Item>
          <Descriptions.Item label="总期数">{plan?.totalPeriods}期</Descriptions.Item>
          <Descriptions.Item label="每期金额">¥{Number(plan?.periodAmount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="还款进度">{plan?.paidPeriods}/{plan?.totalPeriods}</Descriptions.Item>
          <Descriptions.Item label="已还金额">¥{Number(plan?.paidAmount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="还款开始日期">{plan?.startDate}</Descriptions.Item>
        </Descriptions>

        <Card title="还款明细" style={{ marginTop: 24 }} size="small">
          <Table
            rowKey="id"
            dataSource={schedules}
            columns={columns}
            pagination={false}
            size="small"
          />
        </Card>
      </Card>

      {/* 还款弹窗：上传凭证 */}
      <Modal
        title={`还款 - 第${currentSchedule?.periodNumber}期 ¥${Number(currentSchedule?.amount).toFixed(2)}`}
        open={repayModalVisible}
        onOk={handleSubmitRepay}
        onCancel={() => setRepayModalVisible(false)}
        okText="确认还款"
        confirmLoading={submitting}
        okButtonProps={{ disabled: fileList.filter((f) => f.status === 'done').length === 0 }}
      >
        <div style={{ marginBottom: 16, color: '#666' }}>
          请上传还款凭证（发票、转账截图等），上传后点击"确认还款"完成操作。
        </div>
        <Upload {...getUploadProps()}>
          <Button icon={<UploadOutlined />}>上传还款凭证</Button>
        </Upload>
      </Modal>

      {/* 图片预览 */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewOpen(visible),
        }}
      />
    </div>
  );
};

export default RepaymentDetail;
