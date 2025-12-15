import {
  createApplication,
  getFormConfigs,
  getFormConfigWithFields,
  submitApplication,
} from "@/services/loan";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "@umijs/max";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";

const { TextArea } = Input;

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
      case "upload":
        return (
          <Form.Item {...commonProps}>
            <Upload>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
        );
      default:
        return (
          <Form.Item {...commonProps}>
            <Input placeholder={`请输入${field.fieldLabel}`} />
          </Form.Item>
        );
    }
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
        formData: values,
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
        formData: values,
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
    </div>
  );
};

export default ApplyForm;
