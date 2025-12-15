import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { getTodoTasks } from '@/services/flow';

/**
 * 待办任务列表
 */
const TodoList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTodoTasks();
      if (res.code === 200) {
        setData(res.data);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { 
      title: '申请编号', 
      key: 'applicationNo',
      render: (_: any, record: any) => record.businessData?.applicationNo || '-',
    },
    { 
      title: '贷款类型', 
      key: 'loanType',
      render: (_: any, record: any) => record.businessData?.loanType || '-',
    },
    { 
      title: '申请金额', 
      key: 'amount',
      render: (_: any, record: any) => `¥${record.businessData?.amount?.toLocaleString() || 0}`,
    },
    { 
      title: '当前节点', 
      key: 'nodeName',
      render: (_: any, record: any) => (
        <Tag color="processing">{record.node?.nodeName || '-'}</Tag>
      ),
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (val: string) => val ? new Date(val).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/flow/audit/detail/${record.id}`)}
        >
          处理
        </Button>
      ),
    },
  ];

  return (
    <Card title="待办任务">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }}
      />
    </Card>
  );
};

export default TodoList;
