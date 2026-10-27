export const INITIAL_DEMO_PROJECTS = [
  {
    id: 'demo-proj-1',
    title: 'Autonomous Mobile Quadruped Robot',
    description: 'Design, inverse kinematics simulation, and embedded firmware for a 12-DOF quadruped robot using brushless actuators and ROS 2.',
    category: 'Robotics',
    status: 'In Progress',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'demo-proj-2',
    title: 'High-Efficiency MPPT Solar Charge Controller',
    description: 'Synchronous buck-boost converter topology with perturb & observe algorithm for maximum power extraction in off-grid solar micro-grids.',
    category: 'Electronics',
    status: 'Completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-proj-3',
    title: 'Carbon Composite UAV Wing Spar FEA',
    description: 'Finite element structural analysis, aeroelastic flutter investigation, and bending deflection modeling under 6G pull-up maneuver loads.',
    category: 'Mechanical',
    status: 'In Progress',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'demo-proj-4',
    title: 'Real-Time Edge Computer Vision Pipeline',
    description: 'YOLOv8-tiny deployment on Raspberry Pi 5 with Coral Edge TPU for industrial manufacturing defect detection and conveyor sorting.',
    category: 'Software',
    status: 'Not Started',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  }
];

export const INITIAL_DEMO_NOTES = [
  {
    id: 'demo-note-1',
    project_id: 'demo-proj-1',
    title: 'Actuator Selection & Gear Ratio Tradeoffs',
    content: `Evaluated planetary vs cycloidal gearboxes for the quadruped hip and knee joints:
- Planetary (6:1) has high backdrivability, low friction, but moderate torque ripple.
- Cycloidal (10:1) offers zero backlash and high impact resistance, but higher inertia.
Decision: Selected custom planetary 6:1 gearboxes paired with 5010 280KV BLDC motors with magnetic absolute encoders (AS5048A) over SPI.`,
    tag: 'Design Spec',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'demo-note-2',
    project_id: 'demo-proj-1',
    title: 'Trot Gait Inverse Kinematics Verification',
    content: `Ran numerical IK simulation in Python using PyBullet:
- Hip abduction limit: +/- 30 degrees
- Thigh swing angle: -45 to +60 degrees
- Calf knee angle: 25 to 135 degrees
Foot trajectory bezier curve parameters: step height = 45mm, step length = 120mm, frequency = 2.4Hz.`,
    tag: 'Test Results',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'demo-note-3',
    project_id: 'demo-proj-2',
    title: 'Thermal Dissipation & MOSFET Heatsink Test',
    content: `Tested synchronous buck stage under 15A continuous load:
- Ambient temperature: 24.5 °C
- Inductor core temp: 58.2 °C (well within 125 °C limit)
- Low-side MOSFET junction temp: 64.1 °C
Added 35mm x 35mm extruded aluminum heatsink and thermal pad with 4.5 W/mK conductivity.`,
    tag: 'Test Results',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  }
];

export const INITIAL_DEMO_CALCULATIONS = [
  {
    id: 'demo-calc-1',
    project_id: 'demo-proj-1',
    title: 'Knee Joint Peak Holding Torque',
    formula: 'm * g * L_thigh * sin(theta)',
    inputs: JSON.stringify([
      { name: 'm', value: '4.5', unit: 'kg', description: 'Mass per leg support' },
      { name: 'g', value: '9.81', unit: 'm/s^2', description: 'Gravitational acceleration' },
      { name: 'L_thigh', value: '0.22', unit: 'm', description: 'Thigh segment length' },
      { name: 'theta', value: '1.047', unit: 'rad', description: '60 deg knee flexion' }
    ]),
    result: '8.41',
    unit: 'N·m',
    notes: 'Max holding torque required at 60 degree knee angle with a 1.25 dynamic safety factor.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
  },
  {
    id: 'demo-calc-2',
    project_id: 'demo-proj-1',
    title: 'LiPo Battery Runtime at Nominal Trotting Draw',
    formula: '(Capacity_Ah * Voltage * Efficiency) / AvgPower_W',
    inputs: JSON.stringify([
      { name: 'Capacity_Ah', value: '5.2', unit: 'Ah', description: '6S Battery Capacity' },
      { name: 'Voltage', value: '22.2', unit: 'V', description: 'Nominal Pack Voltage' },
      { name: 'Efficiency', value: '0.88', unit: '', description: 'Converter & BMS efficiency' },
      { name: 'AvgPower_W', value: '145', unit: 'W', description: 'Average total walking power' }
    ]),
    result: '0.70',
    unit: 'hours (42 min)',
    notes: 'Estimates mission endurance before dropping below 3.6V/cell cutoff voltage.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'demo-calc-3',
    project_id: 'demo-proj-2',
    title: 'Synchronous Buck Inductance for 20% Current Ripple',
    formula: '(Vin - Vout) * Vout / (Vin * f_sw * Delta_IL)',
    inputs: JSON.stringify([
      { name: 'Vin', value: '36', unit: 'V', description: 'Max Solar Panel Input' },
      { name: 'Vout', value: '14.4', unit: 'V', description: 'Battery Absorption Voltage' },
      { name: 'f_sw', value: '150000', unit: 'Hz', description: '150 kHz PWM frequency' },
      { name: 'Delta_IL', value: '3', unit: 'A', description: 'Allowed inductor ripple (20% of 15A)' }
    ]),
    result: '0.0000192',
    unit: 'H (19.2 µH)',
    notes: 'Selected standard 22 µH shielded ferrite core inductor with 22A saturation current.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  }
];

export const INITIAL_DEMO_FILES = [
  {
    id: 'demo-file-1',
    project_id: 'demo-proj-1',
    name: 'Quadruped_Leg_Assembly_Drawing.pdf',
    size: 2450890,
    type: 'application/pdf',
    file_path: 'demo/Quadruped_Leg_Assembly_Drawing.pdf',
    public_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'demo-file-2',
    project_id: 'demo-proj-1',
    name: 'Chassis_FEA_Stress_Contours.png',
    size: 1845200,
    type: 'image/png',
    file_path: 'demo/Chassis_FEA_Stress_Contours.png',
    public_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'demo-file-3',
    project_id: 'demo-proj-2',
    name: 'MPPT_Controller_Schematic_v2.pdf',
    size: 3120000,
    type: 'application/pdf',
    file_path: 'demo/MPPT_Controller_Schematic_v2.pdf',
    public_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  }
];

