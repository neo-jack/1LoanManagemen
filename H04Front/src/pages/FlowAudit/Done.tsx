import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { getDoneTasks } from '@/services/flow';

/**
 * 已办任务列表
 */
const DoneList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDoneTasks();
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
      title: '审批结果', 
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'success' : 'error'}>
          {status === 'approved' ? '已通过' : '已驳回'}
        </Tag>
      ),
    },
    { title: '审批意见', dataIndex: 'comment', key: 'comment' },
    { 
      title: '处理时间', 
      dataIndex: 'handleTime', 
      key: 'handleTime',
      render: (val: string) => val ? new Date(val).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/flow/audit/detail/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <Card title="已办任务">
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

export default DoneList;
