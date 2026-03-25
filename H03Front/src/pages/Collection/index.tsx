import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getOverdueList, addCollection, getCollections } from '@/services/repayment';

const { TextArea } = Input;

/**
 * 催收方式映射
 */
const methodMap: Record<string, string> = {
  phone: '电话',
  sms: '短信',
  email: '邮件',
  visit: '上门',
  letter: '信函',
};

/**
 * 催收结果映射
 */
const resultMap: Record<string, { color: string; text: string }> = {
  promised: { color: 'processing', text: '承诺还款' },
  refused: { color: 'error', text: '拒绝还款' },
  unreachable: { color: 'warning', text: '无法联系' },
  paid: { color: 'success', text: '已还款' },
  other: { color: 'default', text: '其他' },
};

/**
 * 逾期催收管理页面（审核员）
 */
const CollectionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [currentOverdue, setCurrentOverdue] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getOverdueList();
      if (res.code === 200) {
        setOverdueList(res.data);
      }
    } catch (error) {
      message.error('获取逾期数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开催收弹窗
   */
  const handleAddCollection = (record: any) => {
    setCurrentOverdue(record);
    form.resetFields();
    setCollectionModalVisible(true);
  };

  /**
   * 提交催收记录
   */
  const handleSubmitCollection = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        applicationId: currentOverdue.application?.id,
        scheduleId: currentOverdue.schedule?.id,
        userId: currentOverdue.user?.id,
        ...values,
      };
      const res = await addCollection(data);
      if (res.code === 200) {
        message.success('催收记录添加成功');
        setCollectionModalVisible(false);
        loadData();
      }
    } catch (error) {
      message.error('添加失败');
    }
  };

  /**
   * 查看催收记录
   */
  const handleViewRecords = async (record: any) => {
    try {
      const res = await getCollections(record.application?.id);
      if (res.code === 200) {
        setCollections(res.data);
        setCurrentOverdue(record);
        setRecordModalVisible(true);
      }
    } catch (error) {
      message.error('获取催收记录失败');
    }
  };

  const columns = [
    {
      title: '学生',
      key: 'user',
      render: (_: any, record: any) => record.user?.realName || record.user?.username || '-',
    },
    {
      title: '贷款编号',
      key: 'applicationNo',
      render: (_: any, record: any) => record.application?.applicationNo || '-',
    },
    {
      title: '期数',
      key: 'period',
      render: (_: any, record: any) => `第${record.schedule?.periodNumber}期`,
    },
    {
      title: '应还金额',
      key: 'amount',
      render: (_: any, record: any) => `¥${Number(record.schedule?.amount).toFixed(2)}`,
    },
    {
      title: '到期日',
      key: 'dueDate',
      render: (_: any, record: any) => record.schedule?.dueDate || '-',
    },
    {
      title: '逾期天数',
      key: 'overdueDays',
      render: (_: any, record: any) => {
        const dueDate = new Date(record.schedule?.dueDate);
        const today = new Date();
        const days = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return <Tag color={days > 30 ? 'red' : 'orange'}>{days}天</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddCollection(record)}>
            催收
          </Button>
          <Button type="link" size="small" onClick={() => handleViewRecords(record)}>
            催收记录
          </Button>
        </Space>
      ),
    },
  ];

  const collectionColumns = [
    {
      title: '催收方式',
      dataIndex: 'method',
      key: 'method',
      render: (val: string) => methodMap[val] || val,
    },
    {
      title: '催收内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '催收结果',
      dataIndex: 'result',
      key: 'result',
      render: (val: string) => {
        const r = resultMap[val] || { color: 'default', text: val };
        return <Tag color={r.color}>{r.text}</Tag>;
      },
    },
    {
      title: '催收人',
      dataIndex: 'collectorName',
      key: 'collectorName',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => val ? new Date(val).toLocaleString() : '-',
    },
  ];

  return (
    <div>
      <Card title="逾期催收管理">
        <Table
          rowKey={(_, index) => String(index)}
          loading={loading}
          dataSource={overdueList}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 添加催收记录弹窗 */}
      <Modal
        title="添加催收记录"
        open={collectionModalVisible}
        onOk={handleSubmitCollection}
        onCancel={() => setCollectionModalVisible(false)}
        okText="提交"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="method" label="催收方式" rules={[{ required: true, message: '请选择催收方式' }]}>
            <Select placeholder="请选择催收方式">
              <Select.Option value="phone">电话</Select.Option>
              <Select.Option value="sms">短信</Select.Option>
              <Select.Option value="email">邮件</Select.Option>
              <Select.Option value="visit">上门</Select.Option>
              <Select.Option value="letter">信函</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="催收内容" rules={[{ required: true, message: '请输入催收内容' }]}>
            <TextArea rows={4} placeholder="请输入催收内容" />
          </Form.Item>
          <Form.Item name="result" label="催收结果" rules={[{ required: true, message: '请选择催收结果' }]}>
            <Select placeholder="请选择催收结果">
              <Select.Option value="promised">承诺还款</Select.Option>
              <Select.Option value="refused">拒绝还款</Select.Option>
              <Select.Option value="unreachable">无法联系</Select.Option>
              <Select.Option value="paid">已还款</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 催收记录查看弹窗 */}
      <Modal
        title={`催收记录 - ${currentOverdue?.application?.applicationNo || ''}`}
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          rowKey="id"
          dataSource={collections}
          columns={collectionColumns}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default CollectionPage;
