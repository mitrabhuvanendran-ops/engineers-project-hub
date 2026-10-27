import React, { useState } from 'react';
import { 
  Paperclip, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Calendar,
  X
} from 'lucide-react';
import { FileUploadModal } from './FileUploadModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';

export function FilesTab({ files, projectId }) {
  const { uploadFile, deleteFile, actionLoading } = useProjects();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleUpload = async (file) => {
    return await uploadFile(projectId, file);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFile) return;
    await deleteFile(deletingFile.id, deletingFile.file_path);
    setDeletingFile(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImageFile = (file) => {
    return (
      file.type?.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
    );
  };

  const getFileIcon = (file) => {
    if (isImageFile(file)) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (file.name.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (file.name.match(/\.(js|py|cpp|c|h|json|html|css|ts)$/i)) {
      return <FileCode className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Project Files & Documents</h3>
          <p className="text-xs text-slate-500">
            {files.length} {files.length === 1 ? 'file' : 'files'} attached
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all shadow-brand-500/20 inline-flex items-center gap-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Files Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const isImg = isImageFile(file);

            return (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Thumbnail preview if image */}
                  {isImg && file.public_url && (
                    <div
                      onClick={() => setPreviewImage(file)}
                      className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden mb-3 cursor-pointer relative group/img"
                    >
                      <img
                        src={file.public_url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                  )}

                  {/* Header info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        title={file.name}
                        className="font-semibold text-slate-800 text-sm truncate group-hover:text-brand-600 transition-colors"
                      >
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(file.created_at)}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {file.public_url && (
                      <a
                        href={file.public_url}
                        target="_blank"
                        rel="noreferrer"
                        download={file.name}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded transition-colors"
                        title="Download or view file"
                        aria-label="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setDeletingFile(file)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete file"
                      aria-label="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Paperclip className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mb-1">No Files Attached Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Upload CAD drawings, PCB schematic diagrams, testing photos, or specification documents.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First File</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <FileUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUpload}
          loading={actionLoading}
        />
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          title={previewImage.name}
          maxWidth="max-w-3xl"
        >
          <div className="flex flex-col items-center">
            <img
              src={previewImage.public_url}
              alt={previewImage.name}
              className="max-h-[70vh] w-auto rounded-lg object-contain shadow"
            />
            <div className="w-full flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              <span>Size: {formatSize(previewImage.size)}</span>
              <a
                href={previewImage.public_url}
                target="_blank"
                rel="noreferrer"
                download={previewImage.name}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingFile && (
        <ConfirmDialog
          isOpen={Boolean(deletingFile)}
          onClose={() => setDeletingFile(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Attached File?"
          message={`Are you sure you want to delete "${deletingFile.name}"?`}
          confirmText="Delete File"
          danger={true}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
