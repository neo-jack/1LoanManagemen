import { Controller, Post, Body, Headers } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultDto } from '@/common/dto/result.dto';
import { JwtUtil } from '@/common/utils/jwt.util';
import { User } from '@/entities/user.entity';

/**
 * 修改密码请求DTO
 */
class SetPasswordRequest {
  OLD_PWD: string; // 当前密码（MD5格式）
  NEW_PWD: string; // 新密码（MD5格式）
}

// MD5格式验证正则表达式（32位十六进制）
const MD5_PATTERN = /^[a-f0-9]{32}$/i;

/**
 * 修改密码控制器
 * 兼容 Java 端 SetpasswordController 的接口
 * 路径：/api/user/setpassword
 */
@Controller('api/user')
export class SetPasswordController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 修改密码接口
   * POST /api/user/setpassword
   */
  @Post('setpassword')
  async setPassword(
    @Body() body: any,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    console.log('=== 密码修改请求开始 ===');

    try {
      // 直接从 body 读取字段
      const oldPassword = body.OLD_PWD;
      const newPassword = body.NEW_PWD;

      console.log('接收到密码修改请求');
      console.log(`- OLD_PWD: ${oldPassword ? oldPassword.substring(0, Math.min(10, oldPassword.length)) + '...' : 'null'}`);
      console.log(`- NEW_PWD: ${newPassword ? newPassword.substring(0, Math.min(10, newPassword.length)) + '...' : 'null'}`);

      // 验证请求参数
      if (!oldPassword || oldPassword.trim() === '' || !newPassword || newPassword.trim() === '') {
        console.warn('密码修改失败 - 参数验证失败：密码不能为空');
        return ResultDto.error(400, '当前密码和新密码不能为空');
      }

      // 获取token并验证用户身份
      if (!token || !token.startsWith('Bearer ')) {
        console.warn('密码修改失败 - 未提供有效token');
        return ResultDto.error(401, '用户未登录或token已过期');
      }

      const jwtToken = token.substring(7);
      const username = JwtUtil.getUsernameFromToken(jwtToken);

      if (!username || !JwtUtil.validateToken(jwtToken)) {
        console.warn('密码修改失败 - token验证失败');
        return ResultDto.error(401, '用户未登录或token已过期');
      }

      console.log(`Token验证成功，用户名: ${username}`);

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { username },
      });

      if (!user) {
        console.warn(`密码修改失败 - 用户不存在: ${username}`);
        return ResultDto.error(404, '用户不存在');
      }

      console.log(`找到用户: ${user.userName} (ID: ${user.id})`);

      // 验证新密码MD5格式
      if (!MD5_PATTERN.test(newPassword)) {
        console.warn('密码修改失败 - 新密码格式验证失败，不是有效的MD5格式');
        return ResultDto.error(400, '新密码格式错误，必须是MD5格式');
      }

      // 验证当前密码（MD5直接比对）
      const storedPassword = user.password;
      if (oldPassword !== storedPassword) {
        console.warn('密码修改失败 - 当前密码验证失败');
        console.log(`输入密码: ${oldPassword.substring(0, Math.min(8, oldPassword.length))}...`);
        console.log(`存储密码: ${storedPassword ? storedPassword.substring(0, Math.min(8, storedPassword.length)) + '...' : 'null'}`);
        return ResultDto.error(400, '当前密码错误');
      }

      console.log('当前密码验证成功');

      // 检查新密码是否与当前密码相同
      if (newPassword === storedPassword) {
        console.warn('密码修改失败 - 新密码与当前密码相同');
        return ResultDto.error(400, '新密码不能与当前密码相同');
      }

      console.log('新密码验证通过，开始更新密码');

      // 更新用户密码
      const oldPwd = user.password;
      const updateResult = await this.userRepository.update({ id: user.id }, { password: newPassword });

      if (updateResult.affected === 0) {
        console.error('密码修改失败 - 数据库更新失败');
        return ResultDto.error(500, '密码修改失败，请重试');
      }

      console.log('===== 密码修改完成 =====');
      console.log(`用户: ${user.userName} (ID: ${user.id})`);
      console.log(`旧MD5: ${oldPwd ? oldPwd.substring(0, Math.min(8, oldPwd.length)) + '...' : 'null'}`);
      console.log(`新MD5: ${newPassword.substring(0, Math.min(8, newPassword.length))}...`);
      console.log('数据库已更新');

      return ResultDto.success('密码修改成功');
    } catch (e) {
      console.error('密码修改失败 - 未知异常:', e);
      return ResultDto.error(500, '服务器内部错误');
    }
  }
}
