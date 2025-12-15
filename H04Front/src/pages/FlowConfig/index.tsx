import {
  approveFlowConfig,
  createFlowConfig,
  getAllFlowConfigs,
  getFlowConfigWithNodes,
  saveFlowNodes,
  updateFlowConfig,
} from "@/services/flow";
import {
  CheckOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: "default", text: "草稿" },
  pending: { color: "processing", text: "待审核" },
  active: { color: "success", text: "已启用" },
  inactive: { color: "default", text: "已停用" },
};

/**
 * 流程配置页面
 */
const FlowConfig: React.FC = () => {
  // 调试信息
  console.log("[F04 FlowConfig] 页面渲染");
  console.log("[F04 FlowConfig] 当前路径:", window.location.pathname);
  console.log("[F04 FlowConfig] 完整URL:", window.location.href);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [editingNodes, setEditingNodes] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllFlowConfigs();
      if (res.code === 200) {
        setData(res.data);
      }
    } catch (error) {
      message.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record?: any) => {
    setEditingConfig(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      if (editingConfig) {
        await updateFlowConfig(editingConfig.id, values);
        message.success("更新成功");
      } else {
        await createFlowConfig(values);
        message.success("创建成功");
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error("保存失败");
    }
  };

  const handleEditNodes = async (record: any) => {
    setEditingConfig(record);
    try {
      const res = await getFlowConfigWithNodes(record.id);
      if (res.code === 200) {
        setEditingNodes(res.data.nodes || []);
      }
    } catch (error) {
      setEditingNodes([]);
    }
    setNodeModalVisible(true);
  };

  const handleAddNode = () => {
    setEditingNodes([
      ...editingNodes,
      {
        nodeName: "新节点",
        nodeType: "audit",
        auditorRole: "auditor",
        sortOrder: editingNodes.length,
      },
    ]);
  };

  const handleNodeChange = (index: number, key: string, value: any) => {
    const newNodes = [...editingNodes];
    newNodes[index] = { ...newNodes[index], [key]: value };
    setEditingNodes(newNodes);
  };

  const handleRemoveNode = (index: number) => {
    setEditingNodes(editingNodes.filter((_, i) => i !== index));
  };

  const handleSaveNodes = async () => {
    try {
      await saveFlowNodes(editingConfig.id, editingNodes);
      message.success("节点配置保存成功");
      setNodeModalVisible(false);
    } catch (error) {
      message.error("保存失败");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveFlowConfig(id);
      message.success("审核通过，流程已启用");
      loadData();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "流程名称", dataIndex: "flowName", key: "flowName" },
    { title: "业务类型", dataIndex: "businessType", key: "businessType" },
    { title: "描述", dataIndex: "description", key: "description" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const item = statusMap[status] || { color: "default", text: status };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => handleEditNodes(record)}
          >
            节点配置
          </Button>
          {record.status === "pending" && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              审核通过
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="流程配置"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleEdit()}
          >
            新增流程
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

      <Modal
        title={editingConfig ? "编辑流程" : "新增流程"}
        open={modalVisible}
        onOk={handleSaveConfig}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="flowName"
            label="流程名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入流程名称" />
          </Form.Item>
          <Form.Item
            name="businessType"
            label="业务类型"
            rules={[{ required: true }]}
          >
            <Select placeholder="请选择业务类型">
              <Select.Option value="loan_application">贷款申请</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="节点配置"
        open={nodeModalVisible}
        onOk={handleSaveNodes}
        onCancel={() => setNodeModalVisible(false)}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="dashed"
            onClick={handleAddNode}
            block
            icon={<PlusOutlined />}
          >
            添加节点
          </Button>
        </div>
        <Table
          dataSource={editingNodes}
          rowKey={(_, index) => String(index)}
          pagination={false}
          size="small"
          columns={[
            {
              title: "节点名称",
              dataIndex: "nodeName",
              render: (val, _, index) => (
                <Input
                  value={val}
                  onChange={(e) =>
                    handleNodeChange(index, "nodeName", e.target.value)
                  }
                />
              ),
            },
            {
              title: "节点类型",
              dataIndex: "nodeType",
              render: (val, _, index) => (
                <Select
                  value={val}
                  onChange={(v) => handleNodeChange(index, "nodeType", v)}
                  style={{ width: 100 }}
                >
                  <Select.Option value="start">开始</Select.Option>
                  <Select.Option value="audit">审核</Select.Option>
                  <Select.Option value="end">结束</Select.Option>
                </Select>
              ),
            },
            {
              title: "审核角色",
              dataIndex: "auditorRole",
              render: (val, _, index) => (
                <Select
                  value={val}
                  onChange={(v) => handleNodeChange(index, "auditorRole", v)}
                  style={{ width: 100 }}
                >
                  <Select.Option value="auditor">审核员</Select.Option>
                  <Select.Option value="superAuditor">总审核</Select.Option>
                </Select>
              ),
            },
            {
              title: "操作",
              render: (_, __, index) => (
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveNode(index)}
                >
                  删除
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default FlowConfig;
