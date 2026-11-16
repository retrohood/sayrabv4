import { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Check,
  Search,
  Filter,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import api from '../../../api/client';
import { formatDate } from '../../../utils/format';

export default function FundraiserUploadsView({ uploads = [], setUploads }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileUrl = event.target?.result;
        const category = activeCategory === 'merchandise' ? 'merchandise' : 'campaign';
        const payload = {
          name: file.name,
          url: fileUrl,
          type: file.type || 'image/jpeg',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          category,
        };

        const res = await api.post('/uploads', payload);
        const newUpload = res.data;
        setUploads((prev) => [newUpload, ...prev]);
      } catch (err) {
        setUploadError(err.response?.data?.message || 'Failed to save upload. Please try again.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) return;
    try {
      await api.delete(`/uploads/${id}`);
      setUploads((prev) => prev.filter((u) => u._id !== id));
      if (previewItem?._id === id) setPreviewItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = uploads.filter((item) => {
    const matchesCat =
      activeCategory === 'all'
        ? true
        : item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">My Uploads (Media Library)</h2>
          <p className="text-xs text-[#64748b]">
            Centralized media for fundraising campaigns, stories, and merchandise graphics
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <UploadCloud size={16} />
            <span>{isUploading ? 'Uploading...' : 'Upload Media File'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e9e3] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Media' },
            { id: 'campaign', label: 'Campaign Media' },
            { id: 'merchandise', label: 'Merchandise Media' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#89ca2e] text-white'
                  : 'bg-[#f7f9f5] text-[#64748b] hover:text-[#10182b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-[#e5e9e3] hover:border-[#89ca2e] bg-[#f7f9f5] hover:bg-[#89ca2e]/5 rounded-2xl text-center cursor-pointer transition-all"
      >
        <UploadCloud size={32} className="mx-auto text-[#367c35] mb-2" />
        <p className="text-xs font-bold text-[#10182b]">
          Click or drag & drop files here to upload
        </p>
        <p className="text-[11px] text-[#64748b] mt-1">
          Supports JPG, PNG, WEBP, and SVG up to 5MB
        </p>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <ImageIcon size={36} className="mx-auto text-[#64748b] mb-3" />
          <h3 className="text-sm font-bold text-[#10182b]">No media found in this category</h3>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            Upload images to use them in your campaigns and merchandise store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-[#e5e9e3] overflow-hidden group shadow-xs hover:border-[#89ca2e]/50 transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => setPreviewItem(item)}
                className="h-32 bg-[#f7f9f5] relative overflow-hidden cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#10182b]/80 backdrop-blur-md text-white">
                  {item.category || 'media'}
                </span>
              </div>

              {/* Media Details */}
              <div className="p-3">
                <p className="text-xs font-bold text-[#10182b] truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-[#64748b] mt-0.5">
                  {item.size || 'Image'} • {formatDate(item.createdAt)}
                </p>

                {/* Quick Action Bar */}
                <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-[#e5e9e3]">
                  <button
                    type="button"
                    onClick={() => handleCopy(item._id, item.url)}
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-[#367c35] hover:bg-[#89ca2e]/10 transition-colors cursor-pointer"
                    title="Copy Image URL"
                  >
                    {copiedId === item._id ? <Check size={13} className="text-[#367c35]" /> : <Copy size={13} />}
                  </button>
                  <a
                    href={item.url}
                    download={item.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
                    title="Download Media"
                  >
                    <Download size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Media"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e5e9e3] animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#10182b] truncate max-w-md">
                  {previewItem.name}
                </h3>
                <span className="text-[10px] text-[#64748b] capitalize">
                  Category: {previewItem.category} • {previewItem.size}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f7f9f5] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-[#f7f9f5] flex items-center justify-center p-2 mb-4">
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[55vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCopy(previewItem._id, previewItem.url)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#f7f9f5] hover:bg-[#e5e9e3] text-[#10182b] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === previewItem._id ? <Check size={14} className="text-[#367c35]" /> : <Copy size={14} />}
                <span>{copiedId === previewItem._id ? 'Copied to Clipboard' : 'Copy Image Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(previewItem._id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
