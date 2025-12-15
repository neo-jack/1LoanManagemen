import { getUser, isLoggedIn, setAuth } from "@/utils/auth";
import { navigateToMain } from "@/utils/navigate";
import { useNavigate, useSearchParams } from "@umijs/max";
import { Spin } from "antd";
import { useEffect } from "react";

/**
 * 根据角色获取默认跳转路径
 */
const getDefaultPath = (role: string): string => {
  switch (role) {
    case "student":
      return "/loan/apply/list";
    case "auditor":
      return "/loan/audit/list";
    case "superAuditor":
      return "/loan/audit/list"; // 暂时跳转到审核列表，F04 开发完成后改回 /flow/audit/todo
    default:
      return "/loan/apply/list";
  }
};

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

    console.log("[H03 Login] 收到参数:", {
      token: !!token,
      userInfo: !!userInfo,
    });

    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log("[H03 Login] 解析用户信息:", user);
        setAuth(token, user);
        const targetPath = getDefaultPath(user.LOAN_ROLE);
        console.log("[H03 Login] 跳转到:", targetPath);
        navigate(targetPath, { replace: true });
        return;
      } catch (e) {
        console.error("[H03 Login] 解析用户信息失败", e);
      }
    }

    // 检查本地登录状态
    if (isLoggedIn()) {
      const user = getUser();
      const targetPath = getDefaultPath(user?.LOAN_ROLE || "");
      console.log("[H03 Login] 已登录，跳转到:", targetPath);
      navigate(targetPath, { replace: true });
    } else {
      console.log("[H03 Login] 未登录，跳转到主应用");
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
