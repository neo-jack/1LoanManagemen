import { isLoggedIn, setAuth } from "@/utils/auth";
import { navigateToMain } from "@/utils/navigate";
import { useNavigate, useSearchParams } from "@umijs/max";
import { Spin } from "antd";
import { useEffect } from "react";

/**
 * 登录页 - 检查登录状态并跳转
 * 支持从 URL 参数接收 token 和 userInfo（跨端口认证）
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 从 URL 参数获取 token 和用户信息（H01 跳转过来时携带）
    const token = searchParams.get("token");
    const userInfo = searchParams.get("userInfo");

    console.log("[F04] token:", token);
    console.log("[F04] userInfo raw:", userInfo);

    if (token && userInfo) {
      try {
        // searchParams.get() 已自动解码，直接 JSON.parse
        const user = JSON.parse(userInfo);
        console.log("[F04] parsed user:", user);
        setAuth(token, user);
        console.log("[F04] auth saved, redirecting...");
        // 使用 window.location 确保跳转生效
        window.location.href = "/flow/audit/todo";
        return;
      } catch (e) {
        console.error("[F04 Login] 解析用户信息失败", e);
        console.error("[F04] userInfo was:", userInfo);
      }
    }

    console.log("[F04] isLoggedIn:", isLoggedIn());
    if (isLoggedIn()) {
      window.location.href = "/flow/audit/todo";
    } else {
      console.log("[F04] not logged in, redirect to main");
      navigateToMain();
    }
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" tip="正在验证登录状态..." />
    </div>
  );
};

export default Login;
