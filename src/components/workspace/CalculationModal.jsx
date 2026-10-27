import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { evaluateFormula } from '../../lib/calculator';
import { CALCULATION_TEMPLATES } from '../../constants';
import { Plus, Trash2, Play, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CalculationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false
}) {
  const [title, setTitle] = useState('');
  const [formula, setFormula] = useState('');
  const [inputs, setInputs] = useState([{ name: 'x', value: '10', unit: '', description: '' }]);
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [evalError, setEvalError] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setFormula(initialData.formula || '');
      setResult(initialData.result || '');
      setUnit(initialData.unit || '');
      setNotes(initialData.notes || '');

      let parsedInputs = [{ name: 'x', value: '10', unit: '', description: '' }];
      if (initialData.inputs) {
        try {
          parsedInputs = typeof initialData.inputs === 'string'
            ? JSON.parse(initialData.inputs)
            : initialData.inputs;
        } catch (e) {
          parsedInputs = [];
        }
      }
      setInputs(parsedInputs);
    } else {
      setTitle('');
      setFormula('');
      setInputs([{ name: 'x', value: '10', unit: '', description: '' }]);
      setResult('');
      setUnit('');
      setNotes('');
    }
    setError('');
    setEvalError('');
  }, [initialData, isOpen]);

  // Handle Preset selection
  const handleSelectTemplate = (templateIndex) => {
    if (templateIndex === '') return;
    const t = CALCULATION_TEMPLATES[parseInt(templateIndex, 10)];
    if (!t) return;

    setTitle(t.title);
    setFormula(t.formula);
    setUnit(t.unit);
    setInputs(t.inputs || []);
    setNotes(t.notes || '');

    // Auto evaluate preset
    const vars = {};
    (t.inputs || []).forEach(item => {
      vars[item.name] = item.value;
    });
    const res = evaluateFormula(t.formula, vars);
    if (res.success) {
      setResult(res.result);
      setEvalError('');
    }
  };

  // Add variable row
  const handleAddInput = () => {
    setInputs(prev => [...prev, { name: '', value: '', unit: '', description: '' }]);
  };

  // Remove variable row
  const handleRemoveInput = (idx) => {
    setInputs(prev => prev.filter((_, i) => i !== idx));
  };

  // Update input row
  const handleInputChange = (idx, field, val) => {
    setInputs(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  // Run calculation evaluation
  const handleEvaluate = () => {
    setEvalError('');
    const varMap = {};
    for (const item of inputs) {
      if (item.name.trim()) {
        varMap[item.name.trim()] = item.value;
      }
    }

    const res = evaluateFormula(formula, varMap);
    if (res.success) {
      setResult(res.result);
      setEvalError('');
    } else {
      setEvalError(res.error || 'Evaluation error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a calculation title.');
      return;
    }

    const res = await onSubmit({
      title: title.trim(),
      formula: formula.trim(),
      inputs,
      result: result.trim(),
      unit: unit.trim(),
      notes: notes.trim()
    });

    if (res?.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Engineering Calculation' : 'Record Engineering Calculation'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Preset Selector */}
        {!isEditing && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Load Engineering Formula Preset (Optional):</span>
            </div>
            <select
              defaultValue=""
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="">-- Choose a standard formula template --</option>
              {CALCULATION_TEMPLATES.map((t, idx) => (
                <option key={idx} value={idx}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Calculation Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cantilever Beam Maximum Bending Stress"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Formula Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Formula Expression
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              supports +, -, *, /, ^, sqrt(), sin(), cos(), pi
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. (w * L^2) / 8"
              className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleEvaluate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
              title="Evaluate formula with current variables"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Evaluate</span>
            </button>
          </div>
          {evalError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{evalError}</span>
            </p>
          )}
        </div>

        {/* Input Variables List */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Input Variables
            </label>
            <button
              type="button"
              onClick={handleAddInput}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {inputs.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Var (e.g. w)"
                  value={item.name}
                  onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                  className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 1500)"
                  value={item.value}
                  onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                  className="w-28 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. N/m)"
                  value={item.unit}
                  onChange={(e) => handleInputChange(idx, 'unit', e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Label/Desc (e.g. Load)"
                  value={item.description}
                  onChange={(e) => handleInputChange(idx, 'description', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                    title="Remove variable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Result & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Calculated Result
            </label>
            <input
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. 7500"
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Result Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. N·m, V, W, J, mm"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Engineering Notes & Assumptions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes & Assumptions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Assumes uniform beam cross section, safety factor 1.25, grade 6061-T6 Aluminum..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isEditing ? 'Save Changes' : 'Save Calculation'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

