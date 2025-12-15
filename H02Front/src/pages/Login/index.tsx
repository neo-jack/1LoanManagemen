import { hasHrAccess, isLoggedIn, setAuth } from "@/utils/auth";
import { navigateToMain } from "@/utils/navigate";
import { useNavigate, useSearchParams } from "@umijs/max";
import { Spin, message } from "antd";
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

    if (token && userInfo) {
      try {
        // searchParams.get() 已自动解码，直接 JSON.parse
        const user = JSON.parse(userInfo);
        setAuth(token, user);
        // 检查权限后跳转
        if (user.LOAN_ROLE === "superAuditor") {
          navigate("/hr/student/list");
        } else {
          message.error("您没有权限访问人事管理模块");
          navigateToMain();
        }
        return;
      } catch (e) {
        console.error("解析用户信息失败", e);
      }
    }

    if (isLoggedIn()) {
      if (hasHrAccess()) {
        navigate("/hr/student/list");
      } else {
        message.error("您没有权限访问人事管理模块");
        navigateToMain();
      }
    } else {
      navigateToMain();
    }
  }, [navigate, searchParams]);

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
