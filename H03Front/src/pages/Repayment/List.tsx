import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Badge, Alert, Space, message } from 'antd';
import { useNavigate } from '@umijs/max';
import { getRepaymentPlans, getRepaymentReminders } from '@/services/repayment';

/**
 * 还款计划状态映射
 */
const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: 'processing', text: '还款中' },
  completed: { color: 'success', text: '已还清' },
  overdue: { color: 'error', text: '逾期' },
  cancelled: { color: 'default', text: '已取消' },
};

/**
 * 还款计划列表页（学生）
 */
const RepaymentList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, remindersRes] = await Promise.all([
        getRepaymentPlans(),
        getRepaymentReminders(),
      ]);
      if (plansRes.code === 200) setPlans(plansRes.data);
      if (remindersRes.code === 200) setReminders(remindersRes.data);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '贷款编号',
      dataIndex: ['application', 'applicationNo'],
      key: 'applicationNo',
    },
    {
      title: '贷款金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => `¥${Number(val).toLocaleString()}`,
    },
    {
      title: '年利率',
      dataIndex: 'interestRate',
      key: 'interestRate',
      render: (val: number) => `${val}%`,
    },
    {
      title: '总期数',
      dataIndex: 'totalPeriods',
      key: 'totalPeriods',
      render: (val: number) => `${val}期`,
    },
    {
      title: '每期金额',
      dataIndex: 'periodAmount',
      key: 'periodAmount',
      render: (val: number) => `¥${Number(val).toFixed(2)}`,
    },
    {
      title: '还款进度',
      key: 'progress',
      render: (_: any, record: any) => `${record.paidPeriods}/${record.totalPeriods}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const s = statusMap[val] || { color: 'default', text: val };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/loan/repayment/detail/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 还款提醒 */}
      {reminders && (
        <>
          {reminders.overdue?.length > 0 && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message={`您有 ${reminders.overdue.length} 笔还款已逾期，请尽快还款！`}
              description={reminders.overdue.map((s: any) =>
                `第${s.periodNumber}期 ¥${Number(s.amount).toFixed(2)} 到期日: ${s.dueDate}`
              ).join('；')}
            />
          )}
          {reminders.upcoming?.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={`您有 ${reminders.upcoming.length} 笔还款即将到期`}
              description={reminders.upcoming.map((s: any) =>
                `第${s.periodNumber}期 ¥${Number(s.amount).toFixed(2)} 到期日: ${s.dueDate}`
              ).join('；')}
            />
          )}
        </>
      )}

      <Card title="我的还款计划">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={plans}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default RepaymentList;
