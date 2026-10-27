import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Tag as TagIcon,
  Calendar
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useProjects } from '../../context/ProjectContext';

export function NotesTab({ notes, projectId }) {
  const { createNote, updateNote, deleteNote, actionLoading, showToast } = useProjects();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
      const matchTag = selectedTag === 'All' || n.tag === selectedTag;
      return matchSearch && matchTag;
    });
  }, [notes, search, selectedTag]);

  // Unique tags
  const tags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => {
      if (n.tag) set.add(n.tag);
    });
    return ['All', ...Array.from(set)];
  }, [notes]);

  const handleSaveNote = async (data) => {
    if (editingNote) {
      const res = await updateNote(editingNote.id, data);
      if (res?.success) setEditingNote(null);
      return res;
    } else {
      const res = await createNote({ projectId, ...data });
      if (res?.success) setIsModalOpen(false);
      return res;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    await deleteNote(deletingNote.id);
    setDeletingNote(null);
  };

  const handleCopyNote = (note) => {
    const text = `${note.title}\n[${note.tag || 'General'}]\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    showToast('Note copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
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
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Tag Filters & New Note Button */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {tags.length > 2 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium cursor-pointer"
            >
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Tags' : t}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all shadow-brand-500/20 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Notes List / Empty State */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <TagIcon className="w-3 h-3 text-slate-400" />
                    <span>{note.tag || 'General'}</span>
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyNote(note)}
                      title="Copy note text"
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      aria-label="Copy note"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingNote(note)}
                      title="Edit note"
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      aria-label="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingNote(note)}
                      title="Delete note"
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-sans line-clamp-6">
                  {note.content || 'No text content.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(note.created_at)}</span>
                </span>
                {note.updated_at && note.updated_at !== note.created_at && (
                  <span>Edited</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mb-1">No Notes Saved Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Record design requirements, component research, test setups, or bug tracking notes for this project.
          </p>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No notes matched your search query. Try typing another search term.
        </div>
      )}

      {/* Note Modal */}
      {(isModalOpen || editingNote) && (
        <NoteModal
          isOpen={isModalOpen || Boolean(editingNote)}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNote(null);
          }}
          onSubmit={handleSaveNote}
          initialData={editingNote}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deletingNote && (
        <ConfirmDialog
          isOpen={Boolean(deletingNote)}
          onClose={() => setDeletingNote(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Engineering Note?"
          message={`Are you sure you want to delete "${deletingNote.title}"?`}
          confirmText="Delete Note"
          danger={true}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
