export const PROJECT_CATEGORIES = [
  'Robotics',
  'Mechanical',
  'Electronics',
  'Software',
  'Civil',
  'Chemical',
  'Electrical',
  'Biomedical',
  'Aerospace',
  'Other'
];

export const PROJECT_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed'
];

export const CATEGORY_COLORS = {
  Robotics: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
    iconColor: 'text-purple-600',
  },
  Mechanical: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
    iconColor: 'text-amber-600',
  },
  Electronics: {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800',
    dot: 'bg-cyan-500',
    iconColor: 'text-cyan-600',
  },
  Software: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
  },
  Civil: {
    bg: 'bg-stone-50 text-stone-700 border-stone-200',
    badge: 'bg-stone-100 text-stone-800',
    dot: 'bg-stone-500',
    iconColor: 'text-stone-600',
  },
  Chemical: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    dot: 'bg-rose-500',
    iconColor: 'text-rose-600',
  },
  Electrical: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
    iconColor: 'text-blue-600',
  },
  Biomedical: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    dot: 'bg-teal-500',
    iconColor: 'text-teal-600',
  },
  Aerospace: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
    dot: 'bg-sky-500',
    iconColor: 'text-sky-600',
  },
  Other: {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    dot: 'bg-slate-500',
    iconColor: 'text-slate-600',
  }
};

export const STATUS_COLORS = {
  'Not Started': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  'In Progress': {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  'Completed': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  }
};

// Engineering calculation presets for quick loading
export const CALCULATION_TEMPLATES = [
  {
    title: "Ohm's Law: Voltage (V = I * R)",
    formula: "I * R",
    unit: "V",
    inputs: [
      { name: "I", value: "2.5", unit: "A", description: "Current" },
      { name: "R", value: "48", unit: "Ω", description: "Resistance" }
    ],
    notes: "Direct DC voltage drop across load resistor."
  },
  {
    title: "Electrical Power (P = V * I)",
    formula: "V * I",
    unit: "W",
    inputs: [
      { name: "V", value: "12", unit: "V", description: "Voltage" },
      { name: "I", value: "3.2", unit: "A", description: "Current" }
    ],
    notes: "Total dissipated or absorbed power."
  },
  {
    title: "LED Resistor Drop: R = (Vs - Vf) / If",
    formula: "(Vs - Vf) / If",
    unit: "Ω",
    inputs: [
      { name: "Vs", value: "5", unit: "V", description: "Supply Voltage" },
      { name: "Vf", value: "2.1", unit: "V", description: "LED Forward Voltage" },
      { name: "If", value: "0.02", unit: "A", description: "Desired Current (20mA)" }
    ],
    notes: "Current limiting resistor for indicator LED."
  },
  {
    title: "Beam Max Bending Moment: M = (w * L^2) / 8",
    formula: "(w * L^2) / 8",
    unit: "N·m",
    inputs: [
      { name: "w", value: "1500", unit: "N/m", description: "Distributed load" },
      { name: "L", value: "4", unit: "m", description: "Beam span length" }
    ],
    notes: "Simply supported uniform distributed load max central moment."
  },
  {
    title: "Kinetic Energy: KE = 0.5 * m * v^2",
    formula: "0.5 * m * (v^2)",
    unit: "J",
    inputs: [
      { name: "m", value: "12", unit: "kg", description: "Mass of rover/robot" },
      { name: "v", value: "3.5", unit: "m/s", description: "Velocity" }
    ],
    notes: "Translational kinetic energy for mobile robotics design."
  },
  {
    title: "DC Motor Mechanical Output: P = (2 * pi * N * T) / 60",
    formula: "(2 * 3.14159 * N * T) / 60",
    unit: "W",
    inputs: [
      { name: "N", value: "3000", unit: "RPM", description: "Rotational Speed" },
      { name: "T", value: "0.45", unit: "N·m", description: "Torque" }
    ],
    notes: "Shaft mechanical power calculation."
  }
];

