import useUser from '@/models/useuser';
import type { HeadshotInfo } from '@/services';
import { getHeadshotList, uploadAvatar } from '@/services';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Modal, Upload, message } from 'antd';
import ImgCrop from 'antd-img-crop';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 裁剪模态框组件
interface CropModalProps {
  visible: boolean;
  imageSrc: string;
  onComplete: (croppedImageSrc: string) => void;
  onCancel: () => void;
}

const CropModal: FC<CropModalProps> = ({
  visible,
  imageSrc,
  onComplete,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // 只有在 imageSrc 变化时才重新加载图片
  useEffect(() => {
    if (visible && imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img') as HTMLImageElement;

      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;

        // 计算图片的初始缩放和位置
        const scale =
          Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        setImageScale(scale);
        setImagePosition({ x, y });
        setImageLoaded(true);

        // 设置初始裁剪区域在中心
        setCropArea({
          x: canvas.width / 2 - 100,
          y: canvas.height / 2 - 100,
          width: 200,
          height: 200,
        });

        if (imageRef.current) {
          imageRef.current.src = imageSrc;
        }
      };

      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
    }
  }, [imageSrc]); // 只依赖 imageSrc，避免 visible 变化时重新渲染

  // 绘制函数 - 使用 useCallback 缓存
  const draw = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (ctx) {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制图片
      ctx.drawImage(
        img,
        imagePosition.x,
        imagePosition.y,
        img.width * imageScale,
        img.height * imageScale,
      );

      // 绘制遮罩层
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 清除裁剪区域（显示原图）
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // 重置合成操作
      ctx.globalCompositeOperation = 'source-over';

      // 绘制裁剪框边框
      ctx.strokeStyle = '#1890ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // 绘制角落控制点（用于缩放）
      const handleSize = 10;
      ctx.fillStyle = '#1890ff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;

      // 左上角
      ctx.fillRect(
        cropArea.x - handleSize / 2,
        cropArea.y - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.strokeRect(
        cropArea.x - handleSize / 2,
        cropArea.y - handleSize / 2,
        handleSize,
        handleSize,
      );

      // 右上角
      ctx.fillRect(
        cropArea.x + cropArea.width - handleSize / 2,
        cropArea.y - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.strokeRect(
        cropArea.x + cropArea.width - handleSize / 2,
        cropArea.y - handleSize / 2,
        handleSize,
        handleSize,
      );

      // 左下角
      ctx.fillRect(
        cropArea.x - handleSize / 2,
        cropArea.y + cropArea.height - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.strokeRect(
        cropArea.x - handleSize / 2,
        cropArea.y + cropArea.height - handleSize / 2,
        handleSize,
        handleSize,
      );

      // 右下角
      ctx.fillRect(
        cropArea.x + cropArea.width - handleSize / 2,
        cropArea.y + cropArea.height - handleSize / 2,
        handleSize,
        handleSize,
      );
      ctx.strokeRect(
        cropArea.x + cropArea.width - handleSize / 2,
        cropArea.y + cropArea.height - handleSize / 2,
        handleSize,
        handleSize,
      );
    }
  }, [imageLoaded, cropArea, imagePosition, imageScale]);

  useEffect(() => {
    draw();
  }, [draw]);

  // 检测鼠标是否在控制点上 - 使用 useCallback 缓存
  const getResizeHandle = useCallback(
    (x: number, y: number) => {
      const handleSize = 10;
      const tolerance = handleSize / 2;

      // 右下角控制点（主要缩放点）
      if (
        Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance &&
        Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance
      ) {
        return 'se-resize';
      }

      // 左上角控制点
      if (
        Math.abs(x - cropArea.x) <= tolerance &&
        Math.abs(y - cropArea.y) <= tolerance
      ) {
        return 'nw-resize';
      }

      // 右上角控制点
      if (
        Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance &&
        Math.abs(y - cropArea.y) <= tolerance
      ) {
        return 'ne-resize';
      }

      // 左下角控制点
      if (
        Math.abs(x - cropArea.x) <= tolerance &&
        Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance
      ) {
        return 'sw-resize';
      }

      return null;
    },
    [cropArea],
  );

  // 鼠标事件处理 - 使用 useCallback 缓存
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否在控制点上（优先级更高）
      const handle = getResizeHandle(x, y);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStart({
          x,
          y,
          width: cropArea.width,
          height: cropArea.height,
        });
        return;
      }

      // 检查是否在裁剪区域内（用于拖拽）
      if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      }
    },
    [getResizeHandle, cropArea],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isResizing && resizeHandle) {
        // 缩放逻辑 - 以拖拽的角落为锚点进行等比例缩放
        const deltaX = x - resizeStart.x;
        const deltaY = y - resizeStart.y;

        // 计算缩放变化量（使用较大的变化量来保持等比例）
        const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));

        // 根据拖拽方向确定缩放方向
        let scaleDelta = 0;
        if (resizeHandle === 'se-resize') {
          // 右下角：向右下拖拽放大，向左上拖拽缩小
          scaleDelta = Math.max(deltaX, deltaY);
        } else if (resizeHandle === 'nw-resize') {
          // 左上角：向左上拖拽放大，向右下拖拽缩小
          scaleDelta = -Math.max(deltaX, deltaY);
        } else if (resizeHandle === 'ne-resize') {
          // 右上角：向右上拖拽放大
          scaleDelta = Math.max(-deltaY, deltaX);
        } else if (resizeHandle === 'sw-resize') {
          // 左下角：向左下拖拽放大
          scaleDelta = Math.max(deltaY, -deltaX);
        }

        // 计算新的尺寸
        let newSize = Math.max(50, resizeStart.width + scaleDelta);

        // 计算新的位置（根据锚点调整）
        let newX = cropArea.x;
        let newY = cropArea.y;

        if (resizeHandle === 'se-resize') {
          // 右下角固定，左上角不动
          newX = cropArea.x;
          newY = cropArea.y;
        } else if (resizeHandle === 'nw-resize') {
          // 左上角固定，右下角移动
          newX = cropArea.x + cropArea.width - newSize;
          newY = cropArea.y + cropArea.height - newSize;
        } else if (resizeHandle === 'ne-resize') {
          // 右上角固定
          newX = cropArea.x;
          newY = cropArea.y + cropArea.height - newSize;
        } else if (resizeHandle === 'sw-resize') {
          // 左下角固定
          newX = cropArea.x + cropArea.width - newSize;
          newY = cropArea.y;
        }

        // 确保不超出画布边界
        newX = Math.max(0, Math.min(canvas.width - newSize, newX));
        newY = Math.max(0, Math.min(canvas.height - newSize, newY));

        // 根据边界限制重新计算尺寸
        const maxWidth = canvas.width - newX;
        const maxHeight = canvas.height - newY;
        newSize = Math.min(newSize, maxWidth, maxHeight);

        setCropArea({
          x: newX,
          y: newY,
          width: newSize,
          height: newSize,
        });
      } else if (isDragging) {
        // 拖拽逻辑
        const newX = Math.max(
          0,
          Math.min(canvas.width - cropArea.width, x - dragStart.x),
        );
        const newY = Math.max(
          0,
          Math.min(canvas.height - cropArea.height, y - dragStart.y),
        );

        setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
      }
    },
    [isResizing, resizeHandle, resizeStart, cropArea, isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // 获取光标样式 - 使用 useCallback 缓存
  const getCursorStyle = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return 'grabbing';
      if (isResizing) return 'nw-resize';

      const canvas = canvasRef.current;
      if (!canvas) return 'default';

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const resizeHandle = getResizeHandle(x, y);
      if (resizeHandle) return resizeHandle;

      // 检查是否在裁剪区域内
      if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        return 'grab';
      }

      return 'default';
    },
    [isDragging, isResizing, getResizeHandle, cropArea],
  );

  const handleConfirm = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    // 创建新的canvas进行裁剪
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    const img = imageRef.current;

    if (cropCtx) {
      cropCanvas.width = cropArea.width;
      cropCanvas.height = cropArea.height;

      // 保持透明背景，不填充白色
      // cropCtx.fillStyle = '#ffffff';
      // cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

      // 计算在原图上的裁剪位置
      const scaleX = img.naturalWidth / (img.width * imageScale);
      const scaleY = img.naturalHeight / (img.height * imageScale);
      const sourceX = (cropArea.x - imagePosition.x) * scaleX;
      const sourceY = (cropArea.y - imagePosition.y) * scaleY;
      const sourceWidth = cropArea.width * scaleX;
      const sourceHeight = cropArea.height * scaleY;

      cropCtx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cropArea.width,
        cropArea.height,
      );

      // 使用PNG格式保持透明度
      const croppedImageSrc = cropCanvas.toDataURL('image/png');
      onComplete(croppedImageSrc);
    }
  }, [cropArea, imageScale, imagePosition, onComplete]);

  return (
    <Modal
      title="裁剪头像"
      open={visible}
      onCancel={onCancel}
      centered
      width={500}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确定
        </Button>,
      ]}
    >
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            cursor: 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            // 动态更新光标
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.style.cursor = getCursorStyle(e);
            }
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <img
          ref={imageRef}
          style={{ display: 'none' }}
          crossOrigin="anonymous"
        />
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: 10,
          color: '#666',
          fontSize: '12px',
        }}
      >
        拖拽蓝色框移动位置，拖拽角落控制点缩放大小
      </div>
    </Modal>
  );
};

interface ChangeAvatarModalProps {
  //设置组件是否打开
  open: boolean;
  //设置组件取消
  onCancel: () => void;
  //头像
  avatarSrc?: string;
  //上传头像成功回调
  onOk?: (dataUrl: string) => void;
  //用户ID
  userId: string;
}

const ChangeAvatarModal: FC<ChangeAvatarModalProps> = ({
  open,
  onCancel,
  avatarSrc,
  onOk,
  userId,
}) => {
  const { userInfo, setUserInfo } = useUser();
  const [imageSrc, setImageSrc] = useState<string | undefined>(avatarSrc);

  // 只在 avatarSrc 变化时更新 imageSrc
  useEffect(() => {
    setImageSrc(avatarSrc);
  }, [avatarSrc]);
  const [headshotList, setHeadshotList] = useState<HeadshotInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');

  // 调用获取用户头像列表 - 使用 useCallback 缓存
  const fetchHeadshotList = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getHeadshotList({});

      if (response.code === 0) {
        // 后端已根据token过滤，直接使用返回数据，按ID倒序排序（最新的在前）
        const userAvatars = response.data.sort(
          (a: HeadshotInfo, b: HeadshotInfo) => b.id - a.id,
        );
        setHeadshotList(userAvatars);
        console.log(`头像列表: 显示${userAvatars.length}个头像`);
      } else {
        message.error(response.msg || '获取头像列表失败');
      }
    } catch (error) {
      message.error('获取头像列表失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchHeadshotList();
    }
  }, [open, fetchHeadshotList]);

  // 处理历史头像点击，打开裁剪模态框 - 使用 useCallback 缓存
  const handleHistoryAvatarClick = useCallback(async (imageUrl: string) => {
    try {
      setCropImageSrc(imageUrl);
      setCropModalVisible(true);
    } catch (error) {
      console.error('选择历史头像失败:', error);
      message.error('选择头像失败');
    }
  }, []);

  // 处理裁剪完成 - 使用 useCallback 缓存
  const handleCropComplete = useCallback((croppedImageSrc: string) => {
    setImageSrc(croppedImageSrc);
    setCropModalVisible(false);
    message.success('头像裁剪成功');
  }, []);

  // 取消裁剪 - 使用 useCallback 缓存
  const handleCropCancel = useCallback(() => {
    setCropModalVisible(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc) {
      message.warning('请先选择一张图片');
      return;
    }

    if (!userId) {
      message.error('用户ID不能为空');
      return;
    }

    setUploading(true);
    try {
      // 调用头像上传服务
      const response = await uploadAvatar({
        avatar: imageSrc,
      });

      if (response.code === 0) {
        console.log('头像上传成功，响应数据:', response.data);
        message.success('头像上传成功');

        // 更新用户信息中的头像
        if (userInfo && setUserInfo) {
          const updatedUserInfo = {
            ...userInfo,
            USER_AVATAR: response.data.url,
          };

          console.log('更新用户信息:', {
            old: userInfo.USER_AVATAR,
            new: response.data.url,
            userId: response.data.userId || parseInt(userId),
          });

          // 使用setUserInfo更新，这会触发监控系统通知所有组件
          setUserInfo(updatedUserInfo);

          // 给一点时间让状态更新传播
          setTimeout(() => {
            console.log('头像更新已传播到所有组件');
          }, 100);
        }

        // 刷新头像列表，显示新上传的头像
        try {
          await fetchHeadshotList();
          console.log('头像列表已刷新，新头像应该已添加到列表中');
        } catch (error) {
          console.warn('刷新头像列表失败:', error);
        }

        // 调用父组件的回调
        if (onOk) onOk(response.data.url); // 传递服务器返回的URL而不是本地imageSrc

        // 关闭模态框
        onCancel();
      } else {
        message.error(response.msg || '头像上传失败');
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [
    imageSrc,
    userId,
    userInfo,
    setUserInfo,
    fetchHeadshotList,
    onOk,
    onCancel,
  ]);

  return (
    <>
      <Modal
        title="上传头像"
        open={open}
        onCancel={onCancel}
        centered
        width={720}
        footer={[
          <Button key="cancel" onClick={onCancel} disabled={uploading}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleConfirm}
            loading={uploading}
            disabled={!imageSrc}
          >
            {uploading ? '上传中...' : '确定'}
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ImgCrop
                rotationSlider
                quality={1}
                showReset
                modalTitle="裁剪头像"
                modalWidth={600}
                modalOk="确定"
                modalCancel="取消"
                aspect={1}
                minZoom={0.5}
                maxZoom={3}
                fillColor="transparent"
                onModalOk={(file) => {
                  if (file && file instanceof File) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageSrc(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                    message.success('头像裁剪成功');
                  }
                }}
                onModalCancel={() => {
                  // 用户取消裁剪
                }}
              >
                <Upload accept="image/*" showUploadList={false}>
                  <Button type="primary" icon={<CameraOutlined />}>
                    上传照片
                  </Button>
                </Upload>
              </ImgCrop>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                width: 300,
                height: 300,
                border: '1px solid #e5e5e5',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt="avatar"
                  width={280}
                  height={280}
                  style={{
                    objectFit: 'cover',
                  }}
                  preview={false}
                />
              ) : (
                <div style={{ color: '#ccc' }}>
                  <UserOutlined style={{ fontSize: 200 }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
                我的头像
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {/* 头像列表 - 第一个是当前使用的头像（ID最大），其余按倒序排列 */}
                {useMemo(
                  () =>
                    headshotList.map((headshot, index) => {
                      // 优先使用 data 字段（base64 数据），如果没有则使用 fileUrl
                      const hasValidData =
                        headshot.data && headshot.data.startsWith('data:');
                      const avatarSrc = hasValidData
                        ? headshot.data
                        : headshot.fileUrl;
                      console.log(
                        `[Avatar ${
                          headshot.id
                        }] hasData=${!!headshot.data}, hasValidData=${hasValidData}, dataLen=${
                          headshot.data?.length || 0
                        }`,
                      );
                      return (
                        <Avatar
                          key={headshot.id}
                          src={avatarSrc}
                          icon={<UserOutlined />}
                          size={60}
                          style={{
                            cursor: 'pointer',
                            border:
                              index === 0
                                ? '3px solid #52c41a'
                                : '2px solid #1890ff',
                            borderRadius: '50%',
                          }}
                          onClick={() =>
                            avatarSrc && handleHistoryAvatarClick(avatarSrc)
                          }
                        />
                      );
                    }),
                  [headshotList, handleHistoryAvatarClick],
                )}
              </div>

              {/* 加载状态 */}
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#999',
                  }}
                >
                  加载中...
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* 独立的裁剪模态框 */}
      <CropModal
        visible={cropModalVisible}
        imageSrc={cropImageSrc}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </>
  );
};

export default ChangeAvatarModal;
