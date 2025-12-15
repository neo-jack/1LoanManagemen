import { Outlet } from "@umijs/max";

/**
 * 嵌入布局组件（用于被 qiankun 嵌入时，不显示侧边栏）
 */
const EmbedLayout: React.FC = () => {
  return (
    <div style={{ padding: "24px", background: "#fff", minHeight: "100%" }}>
      <Outlet />
    </div>
  );
};

export default EmbedLayout;
