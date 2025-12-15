import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { useParams, useNavigate } from '@umijs/max';
import { getStudentDetail, updateStudent } from '@/services/hr';

/**
 * 学生编辑页
 */
const StudentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 加载学生信息
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentDetail(Number(id));
      if (res.code === 200) {
        form.setFieldsValue(res.data);
      }
    } catch (error) {
      message.error('获取学生信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await updateStudent(Number(id), values);
      if (res.code === 200) {
        message.success('更新成功');
        navigate('/hr/student/list');
      } else {
        message.error(res.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>编辑学生信息</h2>
      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
          >
            <Form.Item label="用户名" name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="姓名"
              name="userName"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="password"
              help="留空则不修改密码"
            >
              <Input.Password placeholder="请输入新密码（留空则不修改）" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                保存
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
                返回
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default StudentEdit;
