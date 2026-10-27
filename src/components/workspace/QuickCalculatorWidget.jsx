import React, { useState } from 'react';
import { evaluateFormula } from '../../lib/calculator';
import { CALCULATION_TEMPLATES } from '../../constants';
import { 
  Calculator, 
  Play, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles,
  FolderPlus,
  AlertCircle
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export function QuickCalculatorWidget({ onOpenProjectSelect }) {
  const { activeProject, createCalculation, showToast, actionLoading } = useProjects();

  const [formula, setFormula] = useState('(w * L^2) / 8');
  const [title, setTitle] = useState('Beam Max Bending Moment');
  const [inputs, setInputs] = useState([
    { name: 'w', value: '1500', unit: 'N/m', description: 'Distributed load' },
    { name: 'L', value: '4', unit: 'm', description: 'Beam span length' }
  ]);
  const [unit, setUnit] = useState('N·m');
  const [notes, setNotes] = useState('Simply supported beam central moment.');
  const [result, setResult] = useState('3000');
  const [evalError, setEvalError] = useState('');
  const [copied, setCopied] = useState(false);

  // Template select
  const handleSelectTemplate = (idxStr) => {
    if (idxStr === '') return;
    const t = CALCULATION_TEMPLATES[parseInt(idxStr, 10)];
    if (!t) return;

    setTitle(t.title);
    setFormula(t.formula);
    setUnit(t.unit);
    setInputs(t.inputs || []);
    setNotes(t.notes || '');

    // Evaluate immediately
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

  const handleAddInput = () => {
    setInputs(prev => [...prev, { name: '', value: '', unit: '', description: '' }]);
  };

  const handleRemoveInput = (idx) => {
    setInputs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleInputChange = (idx, field, val) => {
    setInputs(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const handleCopy = () => {
    const text = `${title}
Formula: ${formula}
Result: ${result} ${unit}
Inputs:
${inputs.map(i => `  ${i.name} = ${i.value} ${i.unit} (${i.description})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Calculation copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToProject = async () => {
    if (!activeProject) {
      showToast('Please open or select a project first to save calculations to it.', 'info');
      if (onOpenProjectSelect) onOpenProjectSelect();
      return;
    }

    const res = await createCalculation({
      projectId: activeProject.id,
      title,
      formula,
      inputs,
      result,
      unit,
      notes
    });

    if (res.success) {
      showToast(`Calculation saved to "${activeProject.title}"!`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>Engineering Calculation & Formula Tool</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Evaluate engineering math expressions, substitute parameters, and save to project records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeProject && (
            <button
              onClick={handleSaveToProject}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Save to {activeProject.title.slice(0, 18)}...</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Template Selector */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Load Standard Engineering Formula Template:</span>
          </div>
          <select
            defaultValue=""
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">-- Select formula (Ohm's Law, Power, Beam deflection, Kinetic energy, Motor...) --</option>
            {CALCULATION_TEMPLATES.map((t, idx) => (
              <option key={idx} value={idx}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Calculation Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Formula Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Formula Expression
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              operators: +, -, *, /, ^, sqrt(), sin(), cos(), pi
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm sm:text-base font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
            <button
              onClick={handleEvaluate}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-lg inline-flex items-center gap-2 transition-all shadow-sm shadow-emerald-500/20 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Evaluate</span>
            </button>
          </div>
          {evalError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{evalError}</span>
            </p>
          )}
        </div>

        {/* Big Engineering Result Readout */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">
              Evaluated Result
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {result || '---'}
              </span>
              <span className="text-base font-mono text-slate-300 font-semibold">
                {unit}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Result Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. N·m, V, W, J"
              className="w-full sm:w-32 px-2.5 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Input Variables Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Formula Parameters & Variables
            </label>
            <button
              onClick={handleAddInput}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {inputs.map((item, idx) => (
              <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Var (e.g. w)"
                  value={item.name}
                  onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                  className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 1500)"
                  value={item.value}
                  onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                  className="w-28 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-brand-700 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. N/m)"
                  value={item.unit}
                  onChange={(e) => handleInputChange(idx, 'unit', e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Description / Symbol name"
                  value={item.description}
                  onChange={(e) => handleInputChange(idx, 'description', e.target.value)}
                  className="flex-1 min-w-[120px] px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {inputs.length > 1 && (
                  <button
                    onClick={() => handleRemoveInput(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title="Remove variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Engineering Notes / Conditions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Assumptions, material properties, safety factors..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

