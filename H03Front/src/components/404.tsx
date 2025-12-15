import { navigateToMain } from "@/utils/navigate";
import { Button, Result } from "antd";

/**
 * 404页面
 */
const NotFound: React.FC = () => {
  // 调试信息
  console.log("[H03 404] 页面渲染，当前路径:", window.location.pathname);
  console.log("[H03 404] 完整URL:", window.location.href);

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigateToMain()}>
          返回主页
        </Button>
      }
    />
  );
};

export default NotFound;
