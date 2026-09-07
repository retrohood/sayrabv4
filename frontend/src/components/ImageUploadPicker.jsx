import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, Check, AlertCircle, Folder } from 'lucide-react';
import api from '../api/client';

export default function ImageUploadPicker({
  value = '',
  onChange,
  uploads = [],
  label = 'Campaign Cover Picture',
  helperText = 'Upload a high-quality picture from your computer or paste an image link.',
  required = false,
  className = '',
}) {
  const [activeMode, setActiveMode] = useState(value ? (value.startsWith('http') && !value.includes('/uploads/') ? 'link' : 'file') : 'file');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadProgress(20);
    setFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
    });

    // 1. Instant local preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Immediately set preview
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);

    // 2. Upload file to backend server if possible
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'campaign_asset');

      setUploadProgress(60);
      const res = await api.post('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress(100);
      if (res.data?.url) {
        // Backend returns relative /uploads/filename
        onChange(res.data.url);
      }
    } catch (err) {
      console.warn('Backend upload skipped or failed, using local image data:', err);
      // FileReader data URL is already set in onChange!
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlApply = (e) => {
    e?.preventDefault();
    if (!urlInput.trim()) {
      setUploadError('Please enter a valid image URL');
      return;
    }
    setUploadError('');
    setFileDetails(null);
    onChange(urlInput.trim());
  };

  const handleSelectExisting = (assetUrl) => {
    setUploadError('');
    setFileDetails(null);
    onChange(assetUrl);
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setFileDetails(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasValue = Boolean(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hasValue && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            <Check size={12} /> Picture selected
          </span>
        )}
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveMode('file');
            setUploadError('');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'file'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UploadCloud size={14} /> Choose File from Computer
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('link');
            setUploadError('');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'link'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LinkIcon size={14} /> Picture Link / URL
        </button>
        {uploads && uploads.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveMode('uploads');
              setUploadError('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'uploads'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Folder size={14} /> My Uploads ({uploads.length})
          </button>
        )}
      </div>

      {/* Upload from Computer Mode */}
      {activeMode === 'file' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-slate-100/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shadow-inner">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse file from your computer or drag & drop here
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG, JPG, WebP, GIF up to 10MB
              </p>
            </div>
            <button
              type="button"
              className="mt-1 px-4 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-lg shadow-sm pointer-events-none"
            >
              Browse from PC
            </button>
          </div>

          {uploading && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>Uploading picture...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Picture Link Mode */}
      {activeMode === 'link' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon size={16} />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlApply();
                  }
                }}
                placeholder="https://example.com/images/campaign-cover.jpg"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Apply Link
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Paste any direct image link from the web or image hosting service.
          </p>
        </div>
      )}

      {/* My Uploads Library Mode */}
      {activeMode === 'uploads' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Choose an asset you previously uploaded:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
            {uploads.map((asset) => (
              <div
                key={asset._id || asset.url}
                onClick={() => handleSelectExisting(asset.url)}
                className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all aspect-video flex items-center justify-center bg-slate-100 ${
                  value === asset.url
                    ? 'border-primary-600 ring-2 ring-primary-400'
                    : 'border-slate-200 hover:border-primary-400'
                }`}
              >
                <img
                  src={asset.url}
                  alt={asset.name || 'Asset'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-1 text-[10px] text-white font-medium truncate">
                  {asset.name || 'Asset'}
                </div>
                {value === asset.url && (
                  <div className="absolute top-1 right-1 bg-primary-600 text-white rounded-full p-0.5">
                    <Check size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Preview Card */}
      {hasValue && (
        <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in">
          <div className="relative w-full sm:w-36 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
            <img
              src={value}
              alt="Campaign Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/seed/placeholder/300/200';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <ImageIcon size={14} className="text-primary-600" /> Selected Campaign Picture
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                Ready
              </span>
            </div>

            {fileDetails ? (
              <p className="text-xs text-slate-500 truncate">
                File: <span className="font-semibold text-slate-700">{fileDetails.name}</span> ({fileDetails.size})
              </p>
            ) : (
              <p className="text-xs text-slate-500 truncate">
                Source: <span className="font-semibold text-slate-700">{value.startsWith('data:') ? 'Local file uploaded' : value}</span>
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'file') {
                    fileInputRef.current?.click();
                  } else {
                    setActiveMode('file');
                    setTimeout(() => fileInputRef.current?.click(), 50);
                  }
                }}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
              >
                Change Picture
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X size={12} /> Remove Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
