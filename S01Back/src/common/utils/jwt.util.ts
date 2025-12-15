import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

/**
 * JWT工具类
 */
export class JwtUtil {
  private static readonly SECRET = process.env.JWT_SECRET || 'your_secret_key_here_for_development_environment_only_replace_in_production';
  private static readonly ACCESS_TOKEN_EXPIRE_TIME = parseInt(process.env.JWT_EXPIRES_IN) || 3600; // 1小时
  private static readonly REFRESH_TOKEN_EXPIRE_TIME = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 86400; // 24小时

  /**
   * 生成密钥（确保长度足够）
   */
  private static getSecretKey(): string {
    if (this.SECRET.length < 32) {
      return crypto.createHash('sha256').update(this.SECRET).digest('hex');
    }
    return this.SECRET;
  }

  /**
   * 生成access token
   */
  static generateToken(username: string, role: string, userId: number): string {
    const payload = {
      username,
      role,
      userId,
      type: 'access',
    };

    return jwt.sign(payload, this.getSecretKey(), {
      expiresIn: this.ACCESS_TOKEN_EXPIRE_TIME,
    });
  }

  /**
   * 生成refresh token
   */
  static generateRefreshToken(username: string, role: string, userId: number): string {
    const payload = {
      username,
      role,
      userId,
      type: 'refresh',
    };

    return jwt.sign(payload, this.getSecretKey(), {
      expiresIn: this.REFRESH_TOKEN_EXPIRE_TIME,
    });
  }

  /**
   * 验证token
   */
  static validateToken(token: string): boolean {
    try {
      const decoded = jwt.verify(token, this.getSecretKey()) as any;
      
      if (!decoded || !decoded.userId) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 解析token
   */
  static decodeToken(token: string): any {
    try {
      return jwt.verify(token, this.getSecretKey());
    } catch (error) {
      return null;
    }
  }

  /**
   * 从token中获取用户名
   */
  static getUsernameFromToken(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.username : null;
  }

  /**
   * 从token中获取角色
   */
  static getRoleFromToken(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.role : null;
  }

  /**
   * 从token中获取用户ID
   */
  static getUserIdFromToken(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded ? parseInt(decoded.userId) : null;
  }

  /**
   * 检查token是否过期
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * 从Authorization header中提取token
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
