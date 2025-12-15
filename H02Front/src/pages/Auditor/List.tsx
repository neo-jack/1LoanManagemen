import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message, Tag, Popconfirm } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { getAuditorList, deleteAuditor } from '@/services/hr';

/**
 * 审核员列表页
 */
const AuditorList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAuditorList({ page, pageSize, keyword });
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  // 搜索
  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  // 删除审核员
  const handleDelete = async (id: number) => {
    try {
      const res = await deleteAuditor(id);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表格列配置
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'userName', key: 'userName' },
    { 
      title: '角色', 
      dataIndex: 'loanRole', 
      key: 'loanRole',
      render: (role: string) => (
        <Tag color={role === 'superAuditor' ? 'gold' : 'green'}>
          {role === 'superAuditor' ? '总审核' : '审核员'}
        </Tag>
      ),
    },
    { title: '所属医院', dataIndex: 'hospitalCname', key: 'hospitalCname' },
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
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/hr/auditor/edit/${record.id}`)}
          >
            编辑
          </Button>
          {record.loanRole !== 'superAuditor' && (
            <Popconfirm
              title="确定要删除这个审核员吗？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>审核员管理</h2>
      
      {/* 搜索区域 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索用户名或姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/hr/auditor/add')}
        >
          新增审核员
        </Button>
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />
    </div>
  );
};

export default AuditorList;
