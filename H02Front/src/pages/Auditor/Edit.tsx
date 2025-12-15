import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Select } from 'antd';
import { useParams, useNavigate } from '@umijs/max';
import { getAuditorDetail, updateAuditor, createAuditor } from '@/services/hr';

/**
 * 审核员编辑/新增页
 */
const AuditorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;

  // 加载审核员信息
  useEffect(() => {
    if (isEdit) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAuditorDetail(Number(id));
      if (res.code === 200) {
        form.setFieldsValue(res.data);
      }
    } catch (error) {
      message.error('获取审核员信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const res = isEdit
        ? await updateAuditor(Number(id), values)
        : await createAuditor(values);
      
      if (res.code === 200) {
        message.success(isEdit ? '更新成功' : '创建成功');
        navigate('/hr/auditor/list');
      } else {
        message.error(res.message || (isEdit ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>{isEdit ? '编辑审核员' : '新增审核员'}</h2>
      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
            initialValues={{ loanRole: 'auditor' }}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" disabled={isEdit} />
            </Form.Item>
            <Form.Item
              label="姓名"
              name="userName"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              label={isEdit ? '新密码' : '密码'}
              name="password"
              rules={isEdit ? [] : [{ required: true, message: '请输入密码' }]}
              help={isEdit ? '留空则不修改密码' : undefined}
            >
              <Input.Password placeholder={isEdit ? '请输入新密码（留空则不修改）' : '请输入密码'} />
            </Form.Item>
            <Form.Item
              label="角色"
              name="loanRole"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select>
                <Select.Option value="auditor">审核员</Select.Option>
                <Select.Option value="superAuditor">总审核</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
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

export default AuditorEdit;
