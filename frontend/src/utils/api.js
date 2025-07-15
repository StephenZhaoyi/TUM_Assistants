// 统一生成 API 地址，适配本地和云端
export function apiUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  return base.replace(/\/$/, '') + path;
} 