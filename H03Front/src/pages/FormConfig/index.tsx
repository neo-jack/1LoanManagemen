import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Modal, Form, Input, Space, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { getAllFormConfigs, createFormConfig, updateFormConfig, getFormFields, saveFormFields } from '@/services/loan';

/**
 * 表单配置页面（总审核）
 */
const FormConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [editingFields, setEditingFields] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [fieldForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllFormConfigs();
      if (res.code === 200) {
        setData(res.data);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开新增/编辑弹窗
  const handleEdit = (record?: any) => {
    setEditingConfig(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      if (editingConfig) {
        await updateFormConfig(editingConfig.id, values);
        message.success('更新成功');
      } else {
        await createFormConfig(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 打开字段配置弹窗
  const handleEditFields = async (record: any) => {
    setEditingConfig(record);
    try {
      const res = await getFormFields(record.id);
      if (res.code === 200) {
        setEditingFields(res.data);
      }
    } catch (error) {
      setEditingFields([]);
    }
    setFieldModalVisible(true);
  };

  // 添加字段
  const handleAddField = () => {
    setEditingFields([
      ...editingFields,
      {
        fieldName: `field_${Date.now()}`,
        fieldLabel: '新字段',
        fieldType: 'input',
        isRequired: 0,
        sortOrder: editingFields.length,
      },
    ]);
  };

  // 更新字段
  const handleFieldChange = (index: number, key: string, value: any) => {
    const newFields = [...editingFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setEditingFields(newFields);
  };

  // 删除字段
  const handleRemoveField = (index: number) => {
    setEditingFields(editingFields.filter((_, i) => i !== index));
  };

  // 保存字段配置
  const handleSaveFields = async () => {
    try {
      await saveFormFields(editingConfig.id, editingFields);
      message.success('字段配置保存成功');
      setFieldModalVisible(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '配置名称', dataIndex: 'configName', key: 'configName' },
    { title: '贷款类型', dataIndex: 'loanType', key: 'loanType' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { 
      title: '状态', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (val: number) => (
        <Tag color={val === 1 ? 'success' : 'default'}>{val === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" icon={<SettingOutlined />} onClick={() => handleEditFields(record)}>
            字段配置
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="表单配置" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleEdit()}>
            新增配置
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={false}
        />
      </Card>

      {/* 配置编辑弹窗 */}
      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onOk={handleSaveConfig}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="configName" label="配置名称" rules={[{ required: true }]}>
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item name="loanType" label="贷款类型" rules={[{ required: true }]}>
            <Input placeholder="请输入贷款类型标识" disabled={!!editingConfig} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 字段配置弹窗 */}
      <Modal
        title="字段配置"
        open={fieldModalVisible}
        onOk={handleSaveFields}
        onCancel={() => setFieldModalVisible(false)}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" onClick={handleAddField} block icon={<PlusOutlined />}>
            添加字段
          </Button>
        </div>
        <Table
          dataSource={editingFields}
          rowKey={(_, index) => String(index)}
          pagination={false}
          size="small"
          columns={[
            {
              title: '字段名',
              dataIndex: 'fieldName',
              render: (val, _, index) => (
                <Input value={val} onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)} />
              ),
            },
            {
              title: '标签',
              dataIndex: 'fieldLabel',
              render: (val, _, index) => (
                <Input value={val} onChange={(e) => handleFieldChange(index, 'fieldLabel', e.target.value)} />
              ),
            },
            {
              title: '类型',
              dataIndex: 'fieldType',
              render: (val, _, index) => (
                <select value={val} onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}>
                  <option value="input">文本</option>
                  <option value="textarea">多行文本</option>
                  <option value="number">数字</option>
                  <option value="select">下拉</option>
                  <option value="date">日期</option>
                </select>
              ),
            },
            {
              title: '必填',
              dataIndex: 'isRequired',
              render: (val, _, index) => (
                <Switch checked={val === 1} onChange={(checked) => handleFieldChange(index, 'isRequired', checked ? 1 : 0)} />
              ),
            },
            {
              title: '操作',
              render: (_, __, index) => (
                <Button type="link" danger onClick={() => handleRemoveField(index)}>删除</Button>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default FormConfig;
