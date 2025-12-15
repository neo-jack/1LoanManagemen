import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtUtil } from '@/common/utils/jwt.util';
import { LoginRequestDto, LoginResponseDto, UserInfoDto, RefreshTokenRequestDto, RefreshTokenResponseDto } from './dto/login.dto';
import { User } from '@/entities/user.entity';

/**
 * 认证服务
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * 用户登录
   */
  async login(loginRequest: LoginRequestDto): Promise<LoginResponseDto | null> {
    this.logger.log('=== 登录请求开始 ===');
    
    const { username, password } = loginRequest;
    
    this.logger.log(`接收到登录请求 - 用户名: ${username}, 密码长度: ${password?.length || 0}`);
    
    // 用户登录验证
    const user = await this.userService.login(username, password);
    if (!user) {
      this.logger.warn(`登录失败 - 用户名或密码错误，用户名: ${username}`);
      return null;
    }
    
    this.logger.log(`用户登录成功 - 用户ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.userRole}`);
    
    // 生成访问令牌和刷新令牌
    const accessToken = JwtUtil.generateToken(user.username, user.userRole, user.id);
    const refreshToken = JwtUtil.generateRefreshToken(user.username, user.userRole, user.id);
    
    this.logger.log(`JWT Token生成成功 - AccessToken长度: ${accessToken?.length || 0}, RefreshToken长度: ${refreshToken?.length || 0}`);
    
    // 更新用户登录信息
    const clientIp = '0.0.0.0'; // 简化处理
    await this.userService.updateLoginInfo(user.id, clientIp, accessToken);
    
    // 构造响应数据
    const userInfo: UserInfoDto = {
      USER_ID: user.id,
      USER_NAME: user.userName,
      USER_AVATAR: user.userAvatar,
      USER_ROLE: user.userRole,
      HOSPITAL_CNAME: user.hospitalCname,
      HOSPITAL_ID: user.hospitalId,
      LOAN_ROLE: user.loanRole || 'student', // 贷款系统角色，默认为学生
    };
    
    const response: LoginResponseDto = {
      AccessToken: accessToken,
      RefreshToken: refreshToken,
      ExpiresIn: 3600, // 1小时
      USER: userInfo,
    };
    
    this.logger.log('=== 登录请求处理完成，返回成功响应 ===');
    
    return response;
  }

  /**
   * 用户登出
   */
  async logout(token: string | null): Promise<boolean> {
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
      
      if (JwtUtil.validateToken(token)) {
        const userId = JwtUtil.getUserIdFromToken(token);
        if (userId) {
          await this.userService.updateLoginInfo(userId, null, null);
        }
      }
    }
    return true;
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(token: string | null): Promise<UserInfoDto | null> {
    if (!token || !token.startsWith('Bearer ')) {
      return null;
    }
    
    token = token.substring(7);
    
    if (!JwtUtil.validateToken(token)) {
      return null;
    }
    
    const userId = JwtUtil.getUserIdFromToken(token);
    const user = await this.userService.getById(userId);
    
    if (!user) {
      return null;
    }
    
    return {
      USER_ID: user.id,
      USER_NAME: user.userName,
      USER_AVATAR: user.userAvatar,
      USER_ROLE: user.userRole,
      HOSPITAL_CNAME: user.hospitalCname,
      HOSPITAL_ID: user.hospitalId,
      LOAN_ROLE: user.loanRole || 'student',
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshRequest: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto | null> {
    let refreshToken = refreshRequest.refreshToken;
    
    // 移除Bearer前缀（如果存在）
    if (refreshToken.startsWith('Bearer ')) {
      refreshToken = refreshToken.substring(7);
    }
    
    // 验证refresh token
    if (!JwtUtil.validateToken(refreshToken)) {
      return null;
    }
    
    // 检查token是否过期
    if (JwtUtil.isTokenExpired(refreshToken)) {
      return null;
    }
    
    // 从token中获取用户信息
    const username = JwtUtil.getUsernameFromToken(refreshToken);
    const role = JwtUtil.getRoleFromToken(refreshToken);
    const userId = JwtUtil.getUserIdFromToken(refreshToken);
    
    if (!userId || userId <= 0) {
      return null;
    }
    
    // 验证用户是否仍然存在
    const user = await this.userService.findById(userId);
    if (!user) {
      return null;
    }
    
    // 生成新的token
    const newAccessToken = JwtUtil.generateToken(username, role, userId);
    const newRefreshToken = JwtUtil.generateRefreshToken(username, role, userId);
    
    return {
      AccessToken: newAccessToken,
      RefreshToken: newRefreshToken,
      ExpiresIn: 3600,
    };
  }
}
