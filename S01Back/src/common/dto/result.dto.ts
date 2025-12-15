/**
 * 统一响应格式
 */
export class ResultDto<T = any> {
  /**
   * 状态码: 0-成功, -1-失败, -2-错误
   */
  code: number;

  /**
   * 响应数据
   */
  data?: T;

  /**
   * 响应消息
   */
  msg: string;

  constructor(code: number, data?: T, msg?: string) {
    this.code = code;
    this.data = data;
    this.msg = msg || '';
  }

  /**
   * 成功响应
   */
  static success<T>(data?: T, msg: string = '操作成功'): ResultDto<T> {
    return new ResultDto(0, data, msg);
  }

  /**
   * 失败响应
   */
  static fail(msg: string = '操作失败'): ResultDto {
    return new ResultDto(-1, null, msg);
  }

  /**
   * 错误响应
   * 参数顺序与 Java 端 ResultVOUtil.error(code, msg) 一致
   */
  static error(code: number = -2, msg: string = '系统错误'): ResultDto {
    return new ResultDto(code, null, msg);
  }
}
