import { createStudent, deleteStudent, getStudentList } from "@/services/hr";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@umijs/max";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";

/**
 * 学生列表页
 */
const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentList({ page, pageSize, keyword });
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error("获取数据失败");
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

  // 打开新增弹窗
  const handleCreate = () => {
    form.resetFields();
    setModalVisible(true);
  };

  // 提交新增
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      const res = await createStudent(values);
      if (res.code === 200) {
        message.success("创建成功");
        setModalVisible(false);
        loadData();
      } else {
        message.error(res.message || "创建失败");
      }
    } catch (error: any) {
      message.error(error?.message || "操作失败");
    } finally {
      setModalLoading(false);
    }
  };

  // 删除学生
  const handleDelete = async (id: number) => {
    try {
      const res = await deleteStudent(id);
      if (res.code === 200) {
        message.success("删除成功");
        loadData();
      } else {
        message.error(res.message || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 表格列配置
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "姓名", dataIndex: "userName", key: "userName" },
    {
      title: "角色",
      dataIndex: "loanRole",
      key: "loanRole",
      render: (role: string) => <Tag color="blue">学生</Tag>,
    },
    { title: "所属医院", dataIndex: "hospitalCname", key: "hospitalCname" },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/hr/student/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该学生吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>学生管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增学生
        </Button>
      </div>

      {/* 搜索区域 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索用户名或姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
        </Space>
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

      {/* 新增弹窗 */}
      <Modal
        title="新增学生"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="userName"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="hospitalCname" label="所属医院">
            <Input placeholder="请输入所属医院" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;
