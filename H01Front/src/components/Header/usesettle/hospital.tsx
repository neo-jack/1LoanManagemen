import hospitalImage from '@/assets/picture/hospital.jpg';
import useUser from '@/models/useuser';
import { Space } from 'antd';
import { FC } from 'react';

interface HospitalInfoProps {
  style?: React.CSSProperties;
}

const HospitalInfo: FC<HospitalInfoProps> = ({ style }) => {
  const { userInfo } = useUser();

  return (
    <Space
      size={1}
      style={{
        alignItems: 'center',
        ...style,
      }}
    >
      <img
        src={hospitalImage}
        alt="医院图片"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          objectFit: 'cover',
        }}
      />
      <div style={{ color: '#000' }}>
        <div style={{ fontSize: 14, fontWeight: 400 }}>
          {userInfo?.HOSPITAL_CNAME || '学校'}
        </div>
      </div>
    </Space>
  );
};

export default HospitalInfo;
