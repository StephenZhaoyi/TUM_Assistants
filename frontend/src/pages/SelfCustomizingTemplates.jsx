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

// Helper: Format date with minutes (imitate DraftHistory)
const formatDateWithMinutes = (dateString) => {
  if (!dateString || isNaN(Date.parse(dateString))) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 30) {
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  }
  // Otherwise, display date and time in day/month/year hour:minute format
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SelfCustomizingTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation()
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const filteredTemplates = templates.filter(tpl => {
    if (!searchTerm.trim()) return true;
    const title = tpl.title || extractTitleFromHtml(tpl.content);
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);
  const pagedTemplates = filteredTemplates.slice((currentPage-1)*pageSize, currentPage*pageSize);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        // Adapt to the template structure returned by the backend
        const withDefaults = data.map(tpl => ({
          ...tpl,
          title: tpl.title || tpl.name || extractTitleFromHtml(tpl.content),
          date: tpl.date || tpl.createdAt || new Date().toISOString(),
          id: tpl.id || undefined,
          content: tpl.content || ''
        }));
        setTemplates(withDefaults);
      });
  }, []);

  // Copy rich text content
  const handleCopy = async (html) => {
    try {
      // Prefer Clipboard API for rich text
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([(new DOMParser().parseFromString(html, 'text/html').body.innerText)], { type: 'text/plain' })
          })
        ]);
      } else {
        // fallback: use execCommand for old browsers
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
      // fallback: only copy plain text
      const div = document.createElement('div');
      div.innerHTML = html;
      await navigator.clipboard.writeText(div.innerText);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  }

  // Delete template
  const handleDelete = async (idx) => {
    const tpl = templates[idx]
    if (!tpl.id) return
    await fetch(`/api/templates/${tpl.id}`, { method: 'DELETE' })
    setTemplates(templates.filter((_, i) => i !== idx))
    if (openIdx === idx) setOpenIdx(null)
  }

  // Edit template, jump to DraftEditor and pass content
  const handleEdit = (idx) => {
    const tpl = templates[idx]
    navigate('/draft/template-edit', { state: { templateIdx: idx, template: tpl } })
  }
  const handleEditSave = async () => {
    if (!editTitle.trim()) return
    const tpl = templates[editIdx]
    const updated = { ...tpl, title: editTitle.trim(), content: editContent }
    await fetch(`/api/templates/${tpl.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    const newTemplates = templates.map((tpl, i) => i === editIdx ? updated : tpl)
    setTemplates(newTemplates)
    setEditIdx(null)
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
      
      {/* Search box */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="input w-full pl-10"
            placeholder={t('selfCustomizingTemplates.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      {pagedTemplates.length === 0 ? (
        <p className="text-neutral-500">
          {searchTerm.trim() ? t('selfCustomizingTemplates.noSearchResults') : t('selfCustomizingTemplates.noTemplates')}
        </p>
      ) : (
        <ul className="space-y-4">
          {pagedTemplates.map((tpl, idx) => {
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
                    <span className="text-xs text-neutral-400 mt-1">
                      {formatDateWithMinutes(tpl.date)}
                    </span>
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
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 items-center">
          <button className="btn-outline px-3" disabled={currentPage===1} onClick={()=>{setCurrentPage(p=>p-1); window.scrollTo({top:0,behavior:'smooth'});}}>{t('common.prev')}</button>
          <span className="mx-2">{currentPage} / {totalPages}</span>
          <button className="btn-outline px-3" disabled={currentPage===totalPages} onClick={()=>{setCurrentPage(p=>p+1); window.scrollTo({top:0,behavior:'smooth'});}}>{t('common.next')}</button>
        </div>
      )}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="h-4 w-4" />
          <span>{t('messages.copySuccess')}</span>
        </div>
      )}
      {/* Edit modal */}
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