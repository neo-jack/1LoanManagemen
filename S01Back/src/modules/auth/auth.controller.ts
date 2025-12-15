import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResultDto } from '@/common/dto/result.dto';
import { LoginRequestDto, LoginResponseDto, UserInfoDto, RefreshTokenRequestDto, RefreshTokenResponseDto } from './dto/login.dto';

/**
 * 认证控制器
 */
@Controller('api/user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   */
  @Post('login')
  async login(@Body() loginRequest: LoginRequestDto): Promise<ResultDto<LoginResponseDto>> {
    const { username, password } = loginRequest;
    
    // 参数验证
    if (!username || !username.trim() || !password || !password.trim()) {
      return ResultDto.fail('用户名和密码不能为空');
    }
    
    // 登录验证
    const response = await this.authService.login(loginRequest);
    if (!response) {
      return ResultDto.fail('用户名或密码错误');
    }
    
    return ResultDto.success(response, '登录成功');
  }

  /**
   * 用户登出
   */
  @Post('logout')
  async logout(@Headers('authorization') token?: string): Promise<ResultDto<void>> {
    await this.authService.logout(token);
    return ResultDto.success(null, '登出成功');
  }

  /**
   * 获取当前用户信息
   */
  @Get('info')
  async getUserInfo(@Headers('authorization') token?: string): Promise<ResultDto<UserInfoDto>> {
    const userInfo = await this.authService.getUserInfo(token);
    
    if (!userInfo) {
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.fail('未登录');
      }
      return ResultDto.fail('登录已过期');
    }
    
    return ResultDto.success(userInfo, '获取用户信息成功');
  }

  /**
   * 刷新Token
   */
  @Post('refresh')
  async refreshToken(@Body() refreshRequest: RefreshTokenRequestDto): Promise<ResultDto<RefreshTokenResponseDto>> {
    const { refreshToken } = refreshRequest;
    
    if (!refreshToken || !refreshToken.trim()) {
      return ResultDto.fail('刷新令牌不能为空');
    }
    
    const response = await this.authService.refreshToken(refreshRequest);
    
    if (!response) {
      return ResultDto.fail('刷新令牌无效或已过期，请重新登录');
    }
    
    return ResultDto.success(response, 'Token刷新成功');
  }
}
