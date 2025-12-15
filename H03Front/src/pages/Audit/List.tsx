import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { request } from '@umijs/max';

/**
 * 待审核列表页（审核员/总审核）
 */
const AuditList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // 加载待办任务
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request('/api/flow/audit/todo', { method: 'GET' });
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

  // 表格列配置
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
        <Tag color="blue">{record.node?.nodeName || '-'}</Tag>
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
          onClick={() => navigate(`/loan/audit/detail/${record.id}`)}
        >
          审核
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="待审核列表">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default AuditList;
