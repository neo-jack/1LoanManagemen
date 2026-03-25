import {
  createApplication,
  deleteAttachment,
  getFormConfigs,
  getFormConfigWithFields,
  submitApplication,
} from "@/services/loan";
import {
  DownloadOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@umijs/max";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import React, { useEffect, useState } from "react";

const { TextArea } = Input;

/**
 * 判断文件是否为图片类型
 */
const isImageFile = (file: UploadFile) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
  return imageTypes.includes(file.type || "") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
};

/**
 * 贷款申请表单页
 */
const ApplyForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formConfigs, setFormConfigs] = useState<any[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // 加载表单配置列表
  useEffect(() => {
    loadFormConfigs();
  }, []);

  const loadFormConfigs = async () => {
    try {
      const res = await getFormConfigs();
      if (res.code === 200) {
        setFormConfigs(res.data);
        // 默认选择第一个
        if (res.data.length > 0) {
          handleConfigChange(res.data[0].loanType);
        }
      }
    } catch (error) {
      message.error("获取表单配置失败");
    }
  };

  // 选择贷款类型时加载对应表单字段
  const handleConfigChange = async (loanType: string) => {
    setLoading(true);
    try {
      const res = await getFormConfigWithFields(loanType);
      if (res.code === 200) {
        setSelectedConfig(res.data.config);
        setFormFields(res.data.fields);
      }
    } catch (error) {
      message.error("获取表单字段失败");
    } finally {
      setLoading(false);
    }
  };

  // 渲染动态表单字段
  const renderField = (field: any) => {
    const commonProps = {
      key: field.fieldName,
      name: field.fieldName,
      label: field.fieldLabel,
      rules: field.isRequired
        ? [{ required: true, message: `请输入${field.fieldLabel}` }]
        : [],
    };

    switch (field.fieldType) {
      case "input":
        return (
          <Form.Item {...commonProps}>
            <Input placeholder={`请输入${field.fieldLabel}`} />
          </Form.Item>
        );
      case "textarea":
        return (
          <Form.Item {...commonProps}>
            <TextArea rows={4} placeholder={`请输入${field.fieldLabel}`} />
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item {...commonProps}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`请输入${field.fieldLabel}`}
            />
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item {...commonProps}>
            <Select placeholder={`请选择${field.fieldLabel}`}>
              {field.fieldOptions?.map((opt: any) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case "date":
        return (
          <Form.Item {...commonProps}>
            <DatePicker
              style={{ width: "100%" }}
              placeholder={`请选择${field.fieldLabel}`}
            />
          </Form.Item>
        );
      case "upload": {
        const token = sessionStorage.getItem("accessToken");
        const uploadProps: UploadProps = {
          action: "/api/loan/attachment/upload",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          onChange(info) {
            const { file, fileList } = info;
            if (file.status === "done" && file.response?.code === 200) {
              // 上传成功，用后端返回的数据更新文件信息
              const respData = file.response.data;
              const updatedList = fileList.map((f) =>
                f.uid === file.uid
                  ? { ...f, url: respData.url, fileName: respData.filename, name: respData.name }
                  : f,
              );
              form.setFieldValue(field.fieldName, updatedList);
              message.success(`${respData.name} 上传成功`);
            } else if (file.status === "error") {
              message.error(`${file.name} 上传失败`);
            }
            // 同步文件列表到表单
            form.setFieldValue(field.fieldName, fileList);
          },
          async onRemove(file) {
            const filename = (file as any).fileName || file.response?.data?.filename;
            if (filename) {
              try {
                await deleteAttachment(filename);
              } catch {
                // 静默处理
              }
            }
            return true;
          },
          onPreview(file) {
            if (isImageFile(file)) {
              const url = file.url || file.response?.data?.url || "";
              setPreviewImage(url);
              setPreviewOpen(true);
            } else {
              // 非图片文件直接下载
              const filename = (file as any).fileName || file.response?.data?.filename;
              if (filename) {
                window.open(`/api/loan/attachment/download/${filename}`);
              }
            }
          },
          showUploadList: {
            showPreviewIcon: true,
            showDownloadIcon: true,
            showRemoveIcon: true,
          },
          onDownload(file) {
            const filename = (file as any).fileName || file.response?.data?.filename;
            if (filename) {
              window.open(`/api/loan/attachment/download/${filename}`);
            }
          },
        };
        return (
          <Form.Item
            {...commonProps}
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
        );
      }
      default:
        return (
          <Form.Item {...commonProps}>
            <Input placeholder={`请输入${field.fieldLabel}`} />
          </Form.Item>
        );
    }
  };

  /**
   * 序列化表单数据，将 upload 字段的 fileList 转为可存储格式
   */
  const serializeFormData = (values: Record<string, any>) => {
    const uploadFieldNames = formFields
      .filter((f: any) => f.fieldType === "upload")
      .map((f: any) => f.fieldName);

    const serialized = { ...values };
    for (const name of uploadFieldNames) {
      const fileList = values[name];
      if (Array.isArray(fileList)) {
        serialized[name] = fileList
          .filter((f: any) => f.status === "done")
          .map((f: any) => ({
            uid: f.uid,
            name: f.name,
            fileName: (f as any).fileName || f.response?.data?.filename,
            url: f.url || f.response?.data?.url,
            type: f.type || f.response?.data?.type,
          }));
      }
    }
    return serialized;
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = form.getFieldsValue();
      setSubmitting(true);
      const res = await createApplication({
        loanType: selectedConfig?.loanType,
        amount: values.loan_amount || 0,
        purpose: values.loan_purpose,
        formData: serializeFormData(values),
      });
      if (res.code === 200) {
        message.success("草稿保存成功");
        navigate("/loan/apply/list");
      }
    } catch (error) {
      message.error("保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 提交申请
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 先创建申请
      const createRes = await createApplication({
        loanType: selectedConfig?.loanType,
        amount: values.loan_amount || 0,
        purpose: values.loan_purpose,
        formData: serializeFormData(values),
      });

      if (createRes.code === 200) {
        // 再提交申请
        const submitRes = await submitApplication(createRes.data.id);
        if (submitRes.code === 200) {
          message.success("申请提交成功");
          navigate("/loan/apply/list");
        }
      }
    } catch (error) {
      message.error("提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Card title="贷款申请">
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
            <Form.Item label="贷款类型" required>
              <Select
                value={selectedConfig?.loanType}
                onChange={handleConfigChange}
                placeholder="请选择贷款类型"
              >
                {formConfigs.map((config) => (
                  <Select.Option key={config.loanType} value={config.loanType}>
                    {config.configName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {formFields.map(renderField)}

            <Form.Item>
              <Space>
                <Button onClick={handleSaveDraft} loading={submitting}>
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  提交申请
                </Button>
                <Button onClick={() => navigate(-1)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      {/* 图片预览 */}
      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewOpen(visible),
        }}
      />
    </div>
  );
};

export default ApplyForm;
