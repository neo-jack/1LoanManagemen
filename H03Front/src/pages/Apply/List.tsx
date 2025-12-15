import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Card } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { getApplicationList } from '@/services/loan';
import { getUser } from '@/utils/auth';

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
 * 学生申请列表页
 */
const ApplyList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const user = getUser();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getApplicationList();
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
    { title: '申请编号', dataIndex: 'applicationNo', key: 'applicationNo' },
    { title: '贷款类型', dataIndex: 'loanType', key: 'loanType' },
    { 
      title: '申请金额', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (val: number) => `¥${val?.toLocaleString() || 0}`,
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const item = statusMap[status] || { color: 'default', text: status };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    { 
      title: '提交时间', 
      dataIndex: 'submitTime', 
      key: 'submitTime',
      render: (val: string) => val ? new Date(val).toLocaleString() : '-',
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
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/loan/apply/detail/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="我的贷款申请" 
        extra={
          user?.LOAN_ROLE === 'student' && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/loan/apply/form')}
            >
              新建申请
            </Button>
          )
        }
      >
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

export default ApplyList;
