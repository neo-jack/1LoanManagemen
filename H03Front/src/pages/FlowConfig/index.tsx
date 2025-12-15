import { ImportOutlined, SaveOutlined } from "@ant-design/icons";
import { MicroApp } from "@umijs/max";
import { Button, Card, Space } from "antd";
import styles from "./index.less";

/**
 * 流程设置页面
 * 使用组件级嵌入 F04 流程配置子应用
 */
const FlowConfigPage = () => {
  /** 保存配置 */
  const handleSave = () => {
    // TODO: 实现保存逻辑
    console.log("保存配置");
  };

  /** 导入模板 */
  const handleImport = () => {
    // TODO: 实现导入逻辑
    console.log("导入模板");
  };

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.title}>
          <h2>流程设置</h2>
          <span className={styles.desc}>配置贷款审批流程节点和审核人员</span>
        </div>
        <Space>
          <Button icon={<ImportOutlined />} onClick={handleImport}>
            导入模板
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存配置
          </Button>
        </Space>
      </div>

      {/* 主体区域 */}
      <div className={styles.content}>
        {/* 左侧辅助面板 */}
        <div className={styles.sidebar}>
          <Card title="帮助说明" size="small" className={styles.helpCard}>
            <ul className={styles.helpList}>
              <li>拖拽节点配置审批流程</li>
              <li>点击节点设置审核人员</li>
              <li>连接节点定义流转规则</li>
            </ul>
          </Card>
          <Card title="快捷操作" size="small" className={styles.actionCard}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block size="small">
                添加审批节点
              </Button>
              <Button block size="small">
                添加条件分支
              </Button>
              <Button block size="small" danger>
                清空画布
              </Button>
            </Space>
          </Card>
        </div>

        {/* qiankun 子应用容器 */}
        <div className={styles.microAppWrapper}>
          <MicroApp
            name="flow-app"
            memoryHistory={{ initialEntries: ["/flow/config"] }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowConfigPage;
