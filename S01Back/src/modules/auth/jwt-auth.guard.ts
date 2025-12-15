import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtUtil } from '../../common/utils/jwt.util';

/**
 * JWT认证守卫
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const token = JwtUtil.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('认证令牌格式错误');
    }

    if (!JwtUtil.validateToken(token)) {
      throw new UnauthorizedException('认证令牌无效或已过期');
    }

    // 将用户信息附加到请求对象
    const decoded = JwtUtil.decodeToken(token);
    request.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    return true;
  }
}
