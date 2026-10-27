import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  INITIAL_DEMO_PROJECTS,
  INITIAL_DEMO_NOTES,
  INITIAL_DEMO_CALCULATIONS,
  INITIAL_DEMO_FILES
} from '../lib/demoData';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'alphabetical'

  // Show Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all user projects
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Local/Demo Mode Persistence
      const isDemo = Boolean(user.isDemo || user.id === 'demo-user-001');
      const stored = localStorage.getItem(`hub_projects_${user.id}`);
      if (stored) {
        try {
          setProjects(JSON.parse(stored));
        } catch (e) {
          const fallback = isDemo ? INITIAL_DEMO_PROJECTS : [];
          setProjects(fallback);
          localStorage.setItem(`hub_projects_${user.id}`, JSON.stringify(fallback));
        }
      } else {
        // If a new person logs in or creates an account, start fresh with an empty project list
        // Only the 1-click evaluation demo account receives pre-populated demo projects
        const initial = isDemo ? INITIAL_DEMO_PROJECTS : [];
        setProjects(initial);
        localStorage.setItem(`hub_projects_${user.id}`, JSON.stringify(initial));
      }
      setLoading(false);
      return;
    }

    // Live Supabase Mode
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      showToast(err.message || 'Failed to load projects from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Fetch project workspace data (notes, calculations, files)
  const fetchWorkspaceData = useCallback(async (projectId) => {
    if (!projectId || !user) {
      setNotes([]);
      setCalculations([]);
      setFiles([]);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Load from local storage
      const storedNotes = localStorage.getItem(`hub_notes_${user.id}`);
      const storedCalcs = localStorage.getItem(`hub_calcs_${user.id}`);
      const storedFiles = localStorage.getItem(`hub_files_${user.id}`);

      const isDemo = Boolean(user.isDemo || user.id === 'demo-user-001');
      const allNotes = storedNotes ? JSON.parse(storedNotes) : (isDemo ? INITIAL_DEMO_NOTES : []);
      const allCalcs = storedCalcs ? JSON.parse(storedCalcs) : (isDemo ? INITIAL_DEMO_CALCULATIONS : []);
      const allFiles = storedFiles ? JSON.parse(storedFiles) : (isDemo ? INITIAL_DEMO_FILES : []);

      setNotes(allNotes.filter(n => n.project_id === projectId));
      setCalculations(allCalcs.filter(c => c.project_id === projectId));
      setFiles(allFiles.filter(f => f.project_id === projectId));
      return;
    }

    // Supabase Mode
    try {
      const [notesRes, calcsRes, filesRes] = await Promise.all([
        supabase.from('notes').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }),
        supabase.from('calculations').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }),
        supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      ]);

      if (notesRes.error) throw notesRes.error;
      if (calcsRes.error) throw calcsRes.error;
      if (filesRes.error) throw filesRes.error;

      setNotes(notesRes.data || []);
      setCalculations(calcsRes.data || []);
      setFiles(filesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch workspace items:', err);
      showToast(err.message || 'Failed to load project workspace data', 'error');
    }
  }, [user, showToast]);

  // Initial load
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load workspace data when active project changes
  useEffect(() => {
    if (activeProjectId) {
      fetchWorkspaceData(activeProjectId);
    }
  }, [activeProjectId, fetchWorkspaceData]);

  // Active Project object
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [projects, searchTerm, categoryFilter, statusFilter, sortBy]);

  // Project Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const inProgress = projects.filter(p => p.status === 'In Progress').length;
    const notStarted = projects.filter(p => p.status === 'Not Started').length;
    
    // Category counts
    const categoryCounts = {};
    projects.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    return {
      total,
      completed,
      inProgress,
      notStarted,
      categoryCounts
    };
  }, [projects]);

  // =========================================================================
  // PROJECT CRUD
  // =========================================================================

  const createProject = async ({ title, description, category, status }) => {
    if (!user) {
      showToast('Please sign in or register to create projects', 'error');
      return { success: false, error: 'Authentication required' };
    }

    if (!title || !title.trim()) {
      showToast('Project title is required', 'error');
      return { success: false, error: 'Title required' };
    }

    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Local/Demo Mode
      const newProj = {
        id: 'proj-' + Date.now(),
        user_id: user?.id || 'demo-user-001',
        title: title.trim(),
        description: description?.trim() || '',
        category: category || 'Robotics',
        status: status || 'Not Started',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [newProj, ...projects];
      setProjects(updated);
      localStorage.setItem(`hub_projects_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));
      showToast('Project created successfully!');
      setActionLoading(false);
      return { success: true, data: newProj };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description?.trim() || '',
            category: category || 'Robotics',
            status: status || 'Not Started'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      showToast('Project created successfully!');
      return { success: true, data };
    } catch (err) {
      console.error('Error creating project:', err);
      showToast(err.message || 'Failed to create project', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const updateProject = async (id, { title, description, category, status }) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const updated = projects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            title: title !== undefined ? title.trim() : p.title,
            description: description !== undefined ? description.trim() : p.description,
            category: category || p.category,
            status: status || p.status,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      setProjects(updated);
      localStorage.setItem(`hub_projects_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));
      showToast('Project updated successfully!');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const updates = {
        updated_at: new Date().toISOString()
      };
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (category !== undefined) updates.category = category;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(p => (p.id === id ? data : p)));
      showToast('Project updated successfully!');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating project:', err);
      showToast(err.message || 'Failed to update project', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem(`hub_projects_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));
      
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }

      showToast('Project deleted successfully!');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
      showToast('Project deleted successfully!');
      return { success: true };
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast(err.message || 'Failed to delete project', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================================
  // NOTES CRUD
  // =========================================================================

  const createNote = async ({ projectId, title, content, tag }) => {
    if (!user) {
      showToast('Please sign in to save notes', 'error');
      return { success: false, error: 'Authentication required' };
    }

    if (!title || !title.trim()) {
      showToast('Note title is required', 'error');
      return { success: false };
    }

    const pId = projectId || activeProjectId;
    if (!pId) return { success: false };

    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const newNote = {
        id: 'note-' + Date.now(),
        project_id: pId,
        user_id: user?.id || 'demo-user-001',
        title: title.trim(),
        content: content || '',
        tag: tag || 'General',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const storedNotes = localStorage.getItem(`hub_notes_${user?.id || 'demo-user-001'}`);
      const allNotes = storedNotes ? JSON.parse(storedNotes) : INITIAL_DEMO_NOTES;
      const updated = [newNote, ...allNotes];
      localStorage.setItem(`hub_notes_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setNotes(prev => [newNote, ...prev]);
      showToast('Note saved!');
      setActionLoading(false);
      return { success: true, data: newNote };
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            project_id: pId,
            user_id: user.id,
            title: title.trim(),
            content: content || '',
            tag: tag || 'General'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      showToast('Note saved!');
      return { success: true, data };
    } catch (err) {
      console.error('Error creating note:', err);
      showToast(err.message || 'Failed to save note', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const updateNote = async (noteId, { title, content, tag }) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const storedNotes = localStorage.getItem(`hub_notes_${user?.id || 'demo-user-001'}`);
      const allNotes = storedNotes ? JSON.parse(storedNotes) : INITIAL_DEMO_NOTES;
      const updated = allNotes.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            title: title !== undefined ? title.trim() : n.title,
            content: content !== undefined ? content : n.content,
            tag: tag || n.tag,
            updated_at: new Date().toISOString()
          };
        }
        return n;
      });

      localStorage.setItem(`hub_notes_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title, content, tag, updated_at: new Date().toISOString() } : n));
      showToast('Note updated!');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content || '',
          tag: tag || 'General',
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === noteId ? data : n));
      showToast('Note updated!');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating note:', err);
      showToast(err.message || 'Failed to update note', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const storedNotes = localStorage.getItem(`hub_notes_${user?.id || 'demo-user-001'}`);
      const allNotes = storedNotes ? JSON.parse(storedNotes) : INITIAL_DEMO_NOTES;
      const updated = allNotes.filter(n => n.id !== noteId);
      localStorage.setItem(`hub_notes_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setNotes(prev => prev.filter(n => n.id !== noteId));
      showToast('Note deleted');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      showToast('Note deleted');
      return { success: true };
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast(err.message || 'Failed to delete note', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================================
  // CALCULATIONS CRUD
  // =========================================================================

  const createCalculation = async ({ projectId, title, formula, inputs, result, unit, notes }) => {
    if (!user) {
      showToast('Please sign in to save calculations', 'error');
      return { success: false, error: 'Authentication required' };
    }

    if (!title || !title.trim()) {
      showToast('Calculation title is required', 'error');
      return { success: false };
    }

    const pId = projectId || activeProjectId;
    if (!pId) return { success: false };

    setActionLoading(true);
    const inputsStr = typeof inputs === 'string' ? inputs : JSON.stringify(inputs || []);

    if (!isSupabaseConfigured || !supabase) {
      const newCalc = {
        id: 'calc-' + Date.now(),
        project_id: pId,
        user_id: user?.id || 'demo-user-001',
        title: title.trim(),
        formula: formula || '',
        inputs: inputsStr,
        result: result || '',
        unit: unit || '',
        notes: notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const storedCalcs = localStorage.getItem(`hub_calcs_${user?.id || 'demo-user-001'}`);
      const allCalcs = storedCalcs ? JSON.parse(storedCalcs) : INITIAL_DEMO_CALCULATIONS;
      const updated = [newCalc, ...allCalcs];
      localStorage.setItem(`hub_calcs_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setCalculations(prev => [newCalc, ...prev]);
      showToast('Calculation saved!');
      setActionLoading(false);
      return { success: true, data: newCalc };
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .insert([
          {
            project_id: pId,
            user_id: user.id,
            title: title.trim(),
            formula: formula || '',
            inputs: inputsStr,
            result: result || '',
            unit: unit || '',
            notes: notes || ''
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCalculations(prev => [data, ...prev]);
      showToast('Calculation saved!');
      return { success: true, data };
    } catch (err) {
      console.error('Error saving calculation:', err);
      showToast(err.message || 'Failed to save calculation', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const updateCalculation = async (calcId, { title, formula, inputs, result, unit, notes }) => {
    setActionLoading(true);
    const inputsStr = typeof inputs === 'string' ? inputs : JSON.stringify(inputs || []);

    if (!isSupabaseConfigured || !supabase) {
      const storedCalcs = localStorage.getItem(`hub_calcs_${user?.id || 'demo-user-001'}`);
      const allCalcs = storedCalcs ? JSON.parse(storedCalcs) : INITIAL_DEMO_CALCULATIONS;
      const updated = allCalcs.map(c => {
        if (c.id === calcId) {
          return {
            ...c,
            title: title.trim(),
            formula: formula || '',
            inputs: inputsStr,
            result: result || '',
            unit: unit || '',
            notes: notes || '',
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });

      localStorage.setItem(`hub_calcs_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));
      setCalculations(prev => prev.map(c => c.id === calcId ? { ...c, title, formula, inputs: inputsStr, result, unit, notes, updated_at: new Date().toISOString() } : c));
      showToast('Calculation updated!');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .update({
          title: title.trim(),
          formula: formula || '',
          inputs: inputsStr,
          result: result || '',
          unit: unit || '',
          notes: notes || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', calcId)
        .select()
        .single();

      if (error) throw error;

      setCalculations(prev => prev.map(c => c.id === calcId ? data : c));
      showToast('Calculation updated!');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating calculation:', err);
      showToast(err.message || 'Failed to update calculation', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCalculation = async (calcId) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const storedCalcs = localStorage.getItem(`hub_calcs_${user?.id || 'demo-user-001'}`);
      const allCalcs = storedCalcs ? JSON.parse(storedCalcs) : INITIAL_DEMO_CALCULATIONS;
      const updated = allCalcs.filter(c => c.id !== calcId);
      localStorage.setItem(`hub_calcs_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setCalculations(prev => prev.filter(c => c.id !== calcId));
      showToast('Calculation deleted');
      setActionLoading(false);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('calculations').delete().eq('id', calcId);
      if (error) throw error;

      setCalculations(prev => prev.filter(c => c.id !== calcId));
      showToast('Calculation deleted');
      return { success: true };
    } catch (err) {
      console.error('Error deleting calculation:', err);
      showToast(err.message || 'Failed to delete calculation', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================================
  // FILES & STORAGE CRUD
  // =========================================================================

  const uploadFile = async (projectId, file) => {
    if (!user) {
      showToast('Please sign in to upload files', 'error');
      return { success: false, error: 'Authentication required' };
    }
    if (!file) return { success: false, error: 'No file provided' };
    const pId = projectId || activeProjectId;
    if (!pId) return { success: false, error: 'No active project' };

    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Local/Demo mock upload with object URL
      const mockFileObj = {
        id: 'file-' + Date.now(),
        project_id: pId,
        user_id: user?.id || 'demo-user-001',
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        file_path: `mock/${file.name}`,
        public_url: URL.createObjectURL(file),
        created_at: new Date().toISOString()
      };

      const storedFiles = localStorage.getItem(`hub_files_${user?.id || 'demo-user-001'}`);
      const allFiles = storedFiles ? JSON.parse(storedFiles) : INITIAL_DEMO_FILES;
      const updated = [mockFileObj, ...allFiles];
      localStorage.setItem(`hub_files_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setFiles(prev => [mockFileObj, ...prev]);
      showToast(`Uploaded ${file.name}!`);
      setActionLoading(false);
      return { success: true, data: mockFileObj };
    }

    try {
      // Upload to Supabase Storage bucket 'project-files'
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${user.id}/${pId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Record in metadata table
      const { data: fileRecord, error: dbError } = await supabase
        .from('project_files')
        .insert([
          {
            project_id: pId,
            user_id: user.id,
            name: file.name,
            size: file.size,
            type: file.type,
            file_path: filePath,
            public_url: publicUrl
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setFiles(prev => [fileRecord, ...prev]);
      showToast(`Uploaded ${file.name}!`);
      return { success: true, data: fileRecord };
    } catch (err) {
      console.error('Error uploading file:', err);
      showToast(err.message || 'File upload failed', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFile = async (fileId, filePath) => {
    setActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const storedFiles = localStorage.getItem(`hub_files_${user?.id || 'demo-user-001'}`);
      const allFiles = storedFiles ? JSON.parse(storedFiles) : INITIAL_DEMO_FILES;
      const updated = allFiles.filter(f => f.id !== fileId);
      localStorage.setItem(`hub_files_${user?.id || 'demo-user-001'}`, JSON.stringify(updated));

      setFiles(prev => prev.filter(f => f.id !== fileId));
      showToast('File removed');
      setActionLoading(false);
      return { success: true };
    }

    try {
      // Delete from storage if filePath exists
      if (filePath) {
        await supabase.storage.from('project-files').remove([filePath]);
      }

      // Delete from DB
      const { error } = await supabase.from('project_files').delete().eq('id', fileId);
      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      showToast('File deleted');
      return { success: true };
    } catch (err) {
      console.error('Error deleting file:', err);
      showToast(err.message || 'Failed to delete file', 'error');
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const value = {
    projects,
    filteredProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    notes,
    calculations,
    files,
    loading,
    actionLoading,
    stats,
    toast,
    showToast,
    closeToast,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    fetchProjects,
    fetchWorkspaceData,
    createProject,
    updateProject,
    deleteProject,
    createNote,
    updateNote,
    deleteNote,
    createCalculation,
    updateCalculation,
    deleteCalculation,
    uploadFile,
    deleteFile
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

