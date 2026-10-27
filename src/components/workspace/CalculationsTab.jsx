import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { CalculationModal } from './CalculationModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useProjects } from '../../context/ProjectContext';

export function CalculationsTab({ calculations, projectId }) {
  const { createCalculation, updateCalculation, deleteCalculation, actionLoading, showToast } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalc, setEditingCalc] = useState(null);
  const [deletingCalc, setDeletingCalc] = useState(null);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Filter calculations
  const filteredCalcs = useMemo(() => {
    return calculations.filter((c) => {
      return (
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.formula && c.formula.toLowerCase().includes(search.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [calculations, search]);

  const handleSaveCalc = async (data) => {
    if (editingCalc) {
      const res = await updateCalculation(editingCalc.id, data);
      if (res?.success) setEditingCalc(null);
      return res;
    } else {
      const res = await createCalculation({ projectId, ...data });
      if (res?.success) setIsModalOpen(false);
      return res;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCalc) return;
    await deleteCalculation(deletingCalc.id);
    setDeletingCalc(null);
  };

  const parseInputs = (inputsData) => {
    if (!inputsData) return [];
    if (Array.isArray(inputsData)) return inputsData;
    try {
      return JSON.parse(inputsData);
    } catch (e) {
      return [];
    }
  };

  const handleCopyCalc = (c) => {
    const inputList = parseInputs(c.inputs)
      .map(i => `  • ${i.name} = ${i.value} ${i.unit || ''} (${i.description || ''})`)
      .join('\n');

    const text = `Engineering Calculation: ${c.title}
Formula: ${c.formula || 'N/A'}
Inputs:
${inputList || '  None'}
Result: ${c.result} ${c.unit || ''}
Notes: ${c.notes || 'None'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    showToast('Calculation summary copied!');
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
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search calculations by title or formula..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        <button
          onClick={() => {
            setEditingCalc(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all shadow-emerald-500/20 inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Calculation</span>
        </button>
      </div>

      {/* Calculations Grid */}
      {filteredCalcs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCalcs.map((calc) => {
            const inputItems = parseInputs(calc.inputs);

            return (
              <div
                key={calc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Title & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      {calc.title}
                    </h3>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyCalc(calc)}
                        title="Copy summary"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        aria-label="Copy calculation"
                      >
                        {copiedId === calc.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingCalc(calc)}
                        title="Edit calculation"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        aria-label="Edit calculation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCalc(calc)}
                        title="Delete calculation"
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        aria-label="Delete calculation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* High Visibility Result Box */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl mb-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-0.5">
                        Evaluated Result
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                          {calc.result || '---'}
                        </span>
                        {calc.unit && (
                          <span className="text-sm font-mono text-slate-300 font-medium">
                            {calc.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    {calc.formula && (
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">
                          Formula
                        </span>
                        <code className="text-xs font-mono text-brand-300 bg-slate-800/80 px-2 py-1 rounded">
                          {calc.formula}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Formula row on mobile */}
                  {calc.formula && (
                    <div className="sm:hidden mb-3">
                      <span className="text-xs text-slate-400 font-mono">Formula: </span>
                      <code className="text-xs font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {calc.formula}
                      </code>
                    </div>
                  )}

                  {/* Input Variables Table */}
                  {inputItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Input Parameters</span>
                      </h4>
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <tbody>
                            {inputItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-200/40 last:border-b-0">
                                <td className="py-1.5 px-3 font-mono font-semibold text-slate-800 w-16">
                                  {item.name}
                                </td>
                                <td className="py-1.5 px-2 font-mono text-brand-700 w-24">
                                  {item.value} {item.unit || ''}
                                </td>
                                <td className="py-1.5 px-2 text-slate-500 text-[11px] truncate">
                                  {item.description || ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Notes / Assumptions */}
                  {calc.notes && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 mb-2">
                      <span className="font-semibold text-slate-700">Assumptions / Notes: </span>
                      {calc.notes}
                    </div>
                  )}
                </div>

                {/* Footer Timestamp */}
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(calc.created_at)}</span>
                  </span>
                  {calc.updated_at && calc.updated_at !== calc.created_at && (
                    <span>Edited</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : calculations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Calculator className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mb-1">No Calculations Saved</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Record Ohm's law sizing, motor torques, structural beam bending moments, or thermal calculations.
          </p>
          <button
            onClick={() => {
              setEditingCalc(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Calculation</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No calculations matched your search term.
        </div>
      )}

      {/* Calculation Modal */}
      {(isModalOpen || editingCalc) && (
        <CalculationModal
          isOpen={isModalOpen || Boolean(editingCalc)}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCalc(null);
          }}
          onSubmit={handleSaveCalc}
          initialData={editingCalc}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deletingCalc && (
        <ConfirmDialog
          isOpen={Boolean(deletingCalc)}
          onClose={() => setDeletingCalc(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Engineering Calculation?"
          message={`Are you sure you want to delete "${deletingCalc.title}"?`}
          confirmText="Delete Calculation"
          danger={true}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

