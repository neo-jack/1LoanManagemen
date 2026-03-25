/**
 * 携带 token 下载文件（解决 window.open 不带 Authorization 头的问题）
 * @param filename - 后端存储的文件名
 */
export function downloadAttachmentFile(filename: string) {
  const token = sessionStorage.getItem('accessToken');
  fetch(`/api/loan/attachment/download/${filename}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })
    .then((res) => {
      if (!res.ok) throw new Error('下载失败');
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      // 静默处理
    });
}
