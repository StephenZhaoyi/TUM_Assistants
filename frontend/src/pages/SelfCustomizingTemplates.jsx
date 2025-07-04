import React, { useEffect, useState } from 'react';
import { useTranslation } from '../translations'
import { Copy, Edit, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function extractTitleFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.innerText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0] || 'Untitled Template';
}

function extractFirstLine(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.innerText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0] || '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
}

const SelfCustomizingTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const { t } = useTranslation()
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('selfCustomizingTemplates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, []);

  // 复制富文本内容
  const handleCopy = async (html) => {
    try {
      // 优先使用 Clipboard API 富文本
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([(new DOMParser().parseFromString(html, 'text/html').body.innerText)], { type: 'text/plain' })
          })
        ]);
      } else {
        // fallback: 使用 execCommand 兼容旧浏览器
        const listener = (e) => {
          e.clipboardData.setData('text/html', html);
          e.clipboardData.setData('text/plain', (new DOMParser().parseFromString(html, 'text/html').body.innerText));
          e.preventDefault();
        };
        document.addEventListener('copy', listener);
        document.execCommand('copy');
        document.removeEventListener('copy', listener);
      }
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      // fallback: 只复制纯文本
      const div = document.createElement('div');
      div.innerHTML = html;
      await navigator.clipboard.writeText(div.innerText);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  }

  // 删除模板
  const handleDelete = (idx) => {
    const newTemplates = templates.filter((_, i) => i !== idx);
    setTemplates(newTemplates);
    localStorage.setItem('selfCustomizingTemplates', JSON.stringify(newTemplates));
    if (openIdx === idx) setOpenIdx(null);
  }

  // 编辑模板，跳转到 DraftEditor 并传递内容
  const handleEdit = (idx) => {
    const tpl = templates[idx];
    navigate('/draft/template-edit', { state: { templateIdx: idx, template: tpl } });
  }
  const handleEditSave = () => {
    if (!editTitle.trim()) return;
    const newTemplates = templates.map((tpl, i) => i === editIdx ? { ...tpl, title: editTitle.trim(), content: editContent } : tpl);
    setTemplates(newTemplates);
    localStorage.setItem('selfCustomizingTemplates', JSON.stringify(newTemplates));
    setEditIdx(null);
  }
  const handleEditCancel = () => {
    setEditIdx(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6 text-center flex-col">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('selfCustomizingTemplates.title')}</h1>
        <p className="text-lg text-neutral-600">{t('selfCustomizingTemplates.subtitle')}</p>
      </div>
      {templates.length === 0 ? (
        <p className="text-neutral-500">No templates saved yet.</p>
      ) : (
        <ul className="space-y-4">
          {templates.map((tpl, idx) => {
            const isOpen = openIdx === idx;
            const title = tpl.title || extractTitleFromHtml(tpl.content);
            const firstLine = extractFirstLine(tpl.content);
            return (
              <li key={idx} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <button
                    className="flex-1 flex flex-col items-start text-left focus:outline-none hover:bg-neutral-50"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >
                    <span className="font-medium text-neutral-900">{title}</span>
                    <span className="text-xs text-neutral-500 mt-1 line-clamp-1">{firstLine}</span>
                  </button>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handleCopy(tpl.content)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                      title={t('actions.copy')}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(idx)}
                      className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title={t('actions.edit')}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="p-4 border-t text-sm text-neutral-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tpl.content }} />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="h-4 w-4" />
          <span>{t('messages.copySuccess')}</span>
        </div>
      )}
      {/* 编辑弹窗 */}
      {editIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">{t('actions.editTemplate')}</h2>
            <p className="mb-2 text-sm text-neutral-600">{t('selfCustomizingTemplates.editTitle')}</p>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder={t('selfCustomizingTemplates.templateNamePlaceholder')}
            />
            <p className="mb-2 text-sm text-neutral-600">{t('selfCustomizingTemplates.editContent')}</p>
            <textarea
              className="w-full border rounded px-2 py-1 mb-2 min-h-[100px]"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn-outline" onClick={handleEditCancel}>{t('actions.cancel')}</button>
              <button className="btn-primary" onClick={handleEditSave}>{t('actions.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfCustomizingTemplates; 