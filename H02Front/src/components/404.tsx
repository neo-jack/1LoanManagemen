import { Button, Result } from 'antd';
import { navigateToMain } from '@/utils/navigate';

/**
 * 404页面
 */
const NotFound: React.FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => navigateToMain()}>
          返回主页
        </Button>
      }
    />
  );
};

export default NotFound;
