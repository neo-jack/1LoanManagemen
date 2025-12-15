import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 登录请求DTO
 */
export class LoginRequestDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

/**
 * 用户信息DTO
 */
export class UserInfoDto {
  USER_ID: number;
  USER_NAME: string;
  USER_AVATAR: string;
  USER_ROLE: string;
  HOSPITAL_CNAME: string;
  HOSPITAL_ID: number;
  LOAN_ROLE: string; // 贷款系统角色: student, auditor, superAuditor
}

/**
 * 登录响应DTO
 */
export class LoginResponseDto {
  AccessToken: string;
  RefreshToken: string;
  ExpiresIn: number;
  USER: UserInfoDto;
}

/**
 * 刷新Token请求DTO
 */
export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}

/**
 * 刷新Token响应DTO
 */
export class RefreshTokenResponseDto {
  AccessToken: string;
  RefreshToken: string;
  ExpiresIn: number;
}
