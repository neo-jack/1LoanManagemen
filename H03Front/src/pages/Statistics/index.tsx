import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  WarningOutlined,
  SyncOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { getStatistics } from '@/services/repayment';

/**
 * 统计仪表盘页面（审核员）
 */
const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStatistics();
      if (res.code === 200) {
        setData(res.data);
      }
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <Spin spinning={loading} style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      {/* 贷款申请统计 */}
      <Card title="贷款申请统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总申请数"
                value={data.applications.total}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已通过"
                value={data.applications.approved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审核"
                value={data.applications.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已驳回"
                value={data.applications.rejected}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 金额统计 */}
      <Card title="金额统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="贷款总额"
                value={data.amount.totalLoan}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="元"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="已回收金额"
                value={data.amount.totalPaid}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 还款统计 */}
      <Card title="还款统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="还款计划总数"
                value={data.repayment.totalPlans}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="还款中"
                value={data.repayment.activePlans}
                prefix={<SyncOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已还清"
                value={data.repayment.completedPlans}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="逾期笔数"
                value={data.overdue.count}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 逾期统计 */}
      {data.overdue.count > 0 && (
        <Card title="逾期预警">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="逾期笔数"
                  value={data.overdue.count}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                  suffix="笔"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="逾期总金额"
                  value={data.overdue.amount}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                  suffix="元"
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
