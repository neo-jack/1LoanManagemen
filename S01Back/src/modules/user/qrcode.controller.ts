import { Controller, Post, Headers } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultDto } from '@/common/dto/result.dto';
import { JwtUtil } from '@/common/utils/jwt.util';
import { User } from '@/entities/user.entity';
import * as crypto from 'crypto';

/**
 * MD5 加密工具函数
 */
function md5Encrypt(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * 二维码控制器
 * 兼容 Java 端 QRCodeController 的接口
 * 路径：/api/user/getdemandurl
 */
@Controller('api/user')
export class QRCodeController {
  // 系统域名配置
  private readonly serverDomain = process.env.SERVER_DOMAIN || 'localhost:8080';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取二维码URL接口
   * POST /api/user/getdemandurl
   */
  @Post('getdemandurl')
  async getDemandUrl(
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<Array<{ url: string }>>> {
    console.log('=== 二维码URL获取请求开始 ===');

    try {
      // 获取token并验证用户身份
      if (!token || !token.startsWith('Bearer ')) {
        console.warn('二维码URL获取失败 - 未提供有效token');
        return ResultDto.error(401, '未提供认证token');
      }

      const jwtToken = token.substring(7);
      const username = JwtUtil.getUsernameFromToken(jwtToken);

      if (!username || !JwtUtil.validateToken(jwtToken)) {
        console.warn('二维码URL获取失败 - token验证失败');
        return ResultDto.error(401, 'token解析失败');
      }

      // 获取用户信息
      const user = await this.userRepository.findOne({
        where: { username },
      });

      if (!user) {
        console.warn(`二维码URL获取失败 - 用户不存在: ${username}`);
        return ResultDto.error(404, '用户不存在');
      }

      console.log(`用户 ${username} 请求生成二维码URL`);

      // 生成二维码URL
      const qrCodeUrl = this.generateQRCodeUrl(user);

      // 构造响应数据
      const responseData = [{ url: qrCodeUrl }];

      console.log(`二维码URL生成成功 - 用户: ${username}`);

      return ResultDto.success(responseData, '二维码URL获取成功');
    } catch (e) {
      console.error('二维码URL获取失败 - 异常:', e);
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 生成二维码URL
   * 根据用户角色、医院名称、医院ID生成加密的URL
   */
  private generateQRCodeUrl(user: User): string {
    try {
      // 获取用户信息
      const userRole = user.userRole || 'user';
      const hospitalName = user.hospitalCname || 'default';
      const hospitalId = user.hospitalId || 0;

      // 对参数进行MD5加密
      const encryptedRole = md5Encrypt(userRole);
      const encryptedHospitalName = md5Encrypt(hospitalName);
      const encryptedHospitalId = md5Encrypt(hospitalId.toString());

      // 构建URL
      const baseUrl = `http://${this.serverDomain}`;
      const url = `${baseUrl}/req-list?hospital_id=${encryptedHospitalId}&hospital_name=${encryptedHospitalName}&log_id=${encryptedRole}&`;

      console.log(
        `生成二维码URL: 用户角色=${userRole}, 医院名称=${hospitalName}, 医院ID=${hospitalId}`,
      );

      return url;
    } catch (e) {
      console.error('生成二维码URL失败:', e);
      // 返回默认URL
      return `http://${this.serverDomain}/req-list?error=generation_failed`;
    }
  }
}
