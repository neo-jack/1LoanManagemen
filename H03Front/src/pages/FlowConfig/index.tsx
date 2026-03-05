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
        </div>
      </div>

      {/* 主体区域 */}
      <div className={styles.content}>
        {/* 左侧辅助面板 */}
        <div className={styles.sidebar}>
          <Card title="帮助说明" size="small" className={styles.helpCard}>
            <ul className={styles.helpList}>
              <li>点击节点设置审核人员</li>
            </ul>
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
