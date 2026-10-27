export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    question: "What is Engineer's Project Hub?",
    answer: "Engineer's Project Hub is a unified full-stack engineering workspace where students and professionals track hardware and software projects, record engineering notes, evaluate math formulas, upload CAD drawings/schematics, and manage milestones.",
    category: 'General'
  },
  {
    id: 'faq-2',
    question: "How do I create and manage an engineering project?",
    answer: "Click the '+ New Project' button on the dashboard or top navigation. Enter a project title, brief technical objective, select your engineering discipline (Robotics, Mechanical, Electronics, Software, etc.), and choose an initial status (Not Started, In Progress, Completed).",
    category: 'Projects'
  },
  {
    id: 'faq-3',
    question: "How does the Engineering Formula Calculator work?",
    answer: "The calculation engine evaluates standard mathematical expressions with variables. It supports operators (+, -, *, /, ^), trigonometry (sin, cos, tan), roots (sqrt), powers, and natural logarithms. You can define input variables with values and units, then click Evaluate to calculate real-time results.",
    category: 'Calculations'
  },
  {
    id: 'faq-4',
    question: "What types of files can I upload to a project workspace?",
    answer: "You can upload project images (PNG, JPG, SVG, WEBP), CAD diagrams, circuit schematics, PDF datasheets, CSV data tables, and code files up to 25MB per file. Image files have an interactive lightbox zoom preview.",
    category: 'Storage'
  },
  {
    id: 'faq-5',
    question: "Is my engineering data private from other users?",
    answer: "Yes. All project data is protected by Supabase Row-Level Security (RLS). Database policies enforce that you can only view, edit, or delete records that match your authenticated User ID.",
    category: 'Security'
  },
  {
    id: 'faq-6',
    question: "Can I use the app without connecting Supabase?",
    answer: "Yes! The application includes a Local Demo Mode that runs in your browser with persistent local storage. You can test all features immediately. When you are ready, add your Supabase credentials in .env to switch to cloud persistence.",
    category: 'General'
  },
  {
    id: 'faq-7',
    question: "What should I do if an engineering calculation results in an error?",
    answer: "Check your formula syntax. Ensure variable names in the formula match your defined input variables exactly. Division by zero will trigger site-specific error code 480 (ERR_CALC_SYNTAX).",
    category: 'Calculations'
  },
  {
    id: 'faq-8',
    question: "How do I export or share my calculation results?",
    answer: "Each calculation card has a 'Copy' button. Clicking this copies a cleanly formatted engineering summary of the title, formula, all input variables with units, and evaluated result directly to your clipboard.",
    category: 'Calculations'
  },
  {
    id: 'faq-9',
    question: "How are support tickets submitted and tracked?",
    answer: "If the AI assistant cannot answer your question or if you encounter an unexpected issue, you can create a support ticket directly through the AI chat widget or via the Support Tickets page. Tickets are stored permanently in the SQL database.",
    category: 'Support'
  },
  {
    id: 'faq-10',
    question: "Where are chat logs and user feedback stored?",
    answer: "Chat interaction logs and thumbs-up/thumbs-down feedback are dispatched to MongoDB via our serverless API endpoint, separating operational metrics from relational SQL application data.",
    category: 'Architecture'
  },
  {
    id: 'faq-11',
    question: "What third-party APIs does Engineer's Project Hub use?",
    answer: "The hub integrates with an external Engineering Environmental & Status API with an AbortController timeout limit (3000ms) and automatic graceful fallback so the application stays responsive even during upstream outages.",
    category: 'Integrations'
  }
];

export const DEFAULT_ERROR_CODES = [
  {
    code: 400,
    name: 'Bad Request',
    description: 'The server cannot process the request due to malformed request syntax or invalid input data.',
    cause: 'Missing required fields (e.g. project title, email) or corrupted JSON payload sent in the request.',
    solution: 'Check form validation errors, ensure all required fields are filled, and resubmit.',
    is_site_specific: false
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: 'Authentication is required and has failed or has not yet been provided.',
    cause: 'Your session token has expired, or you attempted to perform an action while logged out.',
    solution: 'Click the Sign In button in the navigation header, re-enter your credentials, and try again.',
    is_site_specific: false
  },
  {
    code: 403,
    name: 'Forbidden',
    description: 'The server understood the request, but refuses to authorize it due to permission constraints.',
    cause: 'Attempted to access, edit, or delete another user\'s project or file, blocked by Supabase Row Level Security (RLS).',
    solution: 'Ensure you are logged into the account that owns the project. Contact the owner if you need access.',
    is_site_specific: false
  },
  {
    code: 404,
    name: 'Not Found',
    description: 'The server cannot find the requested resource or URL route.',
    cause: 'The requested project ID, document path, or page route does not exist or has been deleted.',
    solution: 'Verify the URL address or return to the Dashboard. Use the "Ask Assistant" button for help locating resources.',
    is_site_specific: false
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time (rate limit exceeded).',
    cause: 'Excessive API calls or rapid repeated clicks on calculation or AI assistant query triggers.',
    solution: 'Wait 30 seconds before sending another prompt or request to let the rate limit window reset.',
    is_site_specific: false
  },
  {
    code: 500,
    name: 'Internal Server Error',
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    cause: 'Unhandled exception, database connectivity timeout, or database query error on the backend.',
    solution: 'Reload the page or check the Health Check page. If the issue persists, submit a support ticket via the AI assistant.',
    is_site_specific: false
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'The server is currently unable to handle the request due to temporary overloading or maintenance.',
    cause: 'Supabase database paused, cloud maintenance in progress, or upstream network outage.',
    solution: 'Check your internet connection and Supabase dashboard project status. Try again in a few minutes.',
    is_site_specific: false
  },
  {
    code: 480,
    name: 'ERR_CALC_SYNTAX (Site-Specific Error)',
    description: 'Engineering calculation formula syntax error, undefined variable reference, or division by zero.',
    cause: 'The math formula contains mismatched parentheses, an unrecognized function, or references variables not defined in the input parameters.',
    solution: 'Review the formula expression. Ensure all variables are declared in the input table and that denominators do not equal zero.',
    is_site_specific: true
  }
];

