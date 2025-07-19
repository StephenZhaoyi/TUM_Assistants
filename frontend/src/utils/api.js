// 统一生成 API 地址，适配本地和云端
export function apiUrl(path) {
  const base = 'https://tum-assistants-back.onrender.com';
  return base.replace(/\/$/, '') + path;
} 