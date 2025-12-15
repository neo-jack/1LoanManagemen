import * as crypto from 'crypto';

/**
 * MD5加密工具类
 */
export class MD5Util {
  /**
   * MD5加密
   */
  static encrypt(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * 验证密码
   */
  static verify(plainText: string, encrypted: string): boolean {
    return this.encrypt(plainText) === encrypted;
  }
}
