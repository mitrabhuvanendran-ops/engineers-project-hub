import re
from .models import FAQ, ErrorCode, SupportTicket
from .mongo_logger import log_chat_interaction

DEFAULT_FAQS = [
    {
        'question': 'How do I create and structure a new engineering project in the Hub?',
        'answer': 'Navigate to the Dashboard or My Projects directory and click "+ New Project". Enter a descriptive title, overview, select your engineering discipline (e.g., Robotics, Mechanical, Electronics, Software), and set an initial status.',
        'category': 'Projects',
        'keywords': 'create project, new project, setup, start, engineering hub',
        'sort_order': 1
    },
    {
        'question': 'How does Row Level Security protect my private engineering documentation?',
        'answer': 'User data isolation is strictly enforced at the database level. Each project and note is linked to your authenticated user account (request.user). Unauthenticated or unauthorized visitors cannot view or modify your repositories.',
        'category': 'Security',
        'keywords': 'security, privacy, permissions, rls, isolation, safe',
        'sort_order': 2
    },
    {
        'question': 'How do I evaluate structural and circuit formulas using the Quick Calc Tool?',
        'answer': 'Open the Quick Calc Tool from the sidebar or workspace. Select a preset template (e.g., Beam Bending Moment, Ohm\'s Law, Kinetic Energy, Resonant Frequency) or write custom mathematical expressions with variables, evaluate, and save directly to your project.',
        'category': 'Calculations',
        'keywords': 'calculator, formula, bending moment, ohms law, calculations',
        'sort_order': 3
    },
    {
        'question': 'Where are project files, schematic drawings, and CAD images stored?',
        'answer': 'Uploaded project files, circuit schematics, and mechanical photos are stored securely on the server under media/project_files/ and linked to their respective projects with authenticated access.',
        'category': 'Storage',
        'keywords': 'upload, storage, files, pdf, images, cad, attachments',
        'sort_order': 4
    },
    {
        'question': 'Can I edit or delete my technical notes and project calculations after creation?',
        'answer': 'Yes. Within any project workspace, navigate to the Notes or Calculations tab. Each entry includes full editing and deletion controls so you can iterate on your engineering progress.',
        'category': 'Workspace',
        'keywords': 'edit note, delete calculation, modify, change, update',
        'sort_order': 5
    },
    {
        'question': 'What engineering disciplines and categories are supported?',
        'answer': 'The platform natively categorizes projects across Robotics, Mechanical, Electronics, Software, Civil, Aerospace, Chemical, and Other multidisciplinary fields.',
        'category': 'Projects',
        'keywords': 'categories, disciplines, robotics, mechanical, electronics, civil',
        'sort_order': 6
    },
    {
        'question': 'How does the AI Assistant provide technical assistance and answer queries?',
        'answer': 'The integrated AI assistant indexes your SQL database FAQs and technical error code directory. It can explain HTTP and calculation error codes, suggest solutions, and automatically create a SQL support ticket when a query cannot be answered.',
        'category': 'AI Assistant',
        'keywords': 'ai, assistant, chatbot, help, queries, support ticket',
        'sort_order': 7
    },
    {
        'question': 'Where are chat conversations and user feedback logs stored?',
        'answer': 'In compliance with architecture guidelines, support tickets are saved in the primary SQL database, while AI chat interaction logs and satisfaction feedback are dispatched to MongoDB Atlas.',
        'category': 'Database',
        'keywords': 'mongodb, sql, chat logs, feedback, database, logging',
        'sort_order': 8
    },
    {
        'question': 'How is real-time environmental telemetry obtained and monitored?',
        'answer': 'The System Health dashboard queries live ambient weather telemetry (temperature, pressure, humidity) from the Open-Meteo API using a strict 2.5-second timeout with an automatic ISO 2533 Standard Atmosphere fallback.',
        'category': 'System Health',
        'keywords': 'health, weather, telemetry, timeout, fallback, api, open-meteo',
        'sort_order': 9
    },
    {
        'question': 'What should I do if I encounter an error code like 480 ERR_CALC_SYNTAX?',
        'answer': 'Error 480 indicates a syntax or dimensional error in your engineering calculation formula (e.g., mismatched parentheses or dividing by zero). Check the Error Code Directory or ask the AI assistant for step-by-step resolution.',
        'category': 'Troubleshooting',
        'keywords': '480, err_calc_syntax, calculation error, syntax, math error',
        'sort_order': 10
    },
    {
        'question': 'How do I submit an official support ticket if my issue cannot be answered?',
        'answer': 'You can open the Support Tickets view from the sidebar to submit a ticket, or ask the AI assistant in the chat widget. If the assistant cannot resolve your problem, it will automatically offer to generate a ticket with a unique ticket number.',
        'category': 'Support',
        'keywords': 'ticket, support, help desk, issue, bug, report',
        'sort_order': 11
    },
    {
        'question': 'Can I filter projects by status or search by keywords?',
        'answer': 'Yes. The Project Directory includes a search bar for live keyword matching across titles and descriptions, as well as one-click filters for In Progress, Completed, Not Started, and Disciplines.',
        'category': 'Projects',
        'keywords': 'search, filter, sort, status, keyword',
        'sort_order': 12
    }
]

DEFAULT_ERROR_CODES = [
    {
        'code': 400,
        'title': 'Bad Request',
        'category': 'Client Error',
        'description': 'The server cannot process the request due to malformed request syntax or invalid input parameters.',
        'cause': 'Missing required form fields (such as project title), invalid characters, or corrupted payload data.',
        'solution': 'Verify all required fields in the form are filled out correctly and retry.',
        'is_site_specific': False
    },
    {
        'code': 401,
        'title': 'Unauthorized',
        'category': 'Authentication',
        'description': 'Authentication credentials are required and either missing or invalid.',
        'cause': 'Session expired, invalid login credentials, or attempting to access protected workspace without logging in.',
        'solution': 'Sign in with your email and password on the login screen or use the 1-click Quick Demo login.',
        'is_site_specific': False
    },
    {
        'code': 403,
        'title': 'Forbidden',
        'category': 'Authorization',
        'description': 'The client authenticated successfully, but does not have permission to access the requested resource.',
        'cause': 'Attempting to access or delete another user\'s private project or documentation without ownership.',
        'solution': 'Verify project ownership. Only the engineer who created the project can modify or delete it.',
        'is_site_specific': False
    },
    {
        'code': 404,
        'title': 'Not Found',
        'category': 'Client Error',
        'description': 'The requested URL, project, or workspace resource could not be found on the server.',
        'cause': 'Typo in the URL address, project was deleted, or navigating to an unmapped path.',
        'solution': 'Use the sidebar navigation or click "Ask the Assistant" on the custom 404 page for guidance.',
        'is_site_specific': False
    },
    {
        'code': 429,
        'title': 'Too Many Requests',
        'category': 'Rate Limiting',
        'description': 'The client has sent too many requests in a given amount of time exceeding server rate limits.',
        'cause': 'Rapid repeated form submissions, aggressive calculation evaluations, or automated API queries.',
        'solution': 'Wait a few seconds before trying again. Throttle repeated automated requests.',
        'is_site_specific': False
    },
    {
        'code': 500,
        'title': 'Internal Server Error',
        'category': 'Server Error',
        'description': 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
        'cause': 'Database connection failure, unhandled runtime exception, or server-side computation error.',
        'solution': 'Check the custom 500 error page, review System Health diagnostics, or ask the AI assistant to file a support ticket.',
        'is_site_specific': False
    },
    {
        'code': 503,
        'title': 'Service Unavailable',
        'category': 'Server Error',
        'description': 'The server is currently unable to handle the request due to temporary overloading or maintenance.',
        'cause': 'Backend database maintenance or external API gateway downtime.',
        'solution': 'The system automatically utilizes fallback telemetry. Retry after 30 seconds.',
        'is_site_specific': False
    },
    {
        'code': 480,
        'title': 'ERR_CALC_SYNTAX',
        'category': 'Engineering Workspace Specific',
        'description': 'Site-specific calculation engine syntax error. The mathematical formula contains invalid operators, mismatched parentheses, or division by zero.',
        'cause': 'Formula syntax error such as "(w * L^2 / 8" with an unclosed parenthesis, or dividing by a variable with value 0.',
        'solution': 'Check formula brackets, verify variable values are non-zero, and test with the Quick Calc preset templates.',
        'is_site_specific': True
    }
]

def seed_faqs_and_errors():
    """Seeds default FAQs and Error Codes into the SQL database if empty."""
    if FAQ.objects.count() < 10:
        for item in DEFAULT_FAQS:
            FAQ.objects.get_or_create(
                question=item['question'],
                defaults=item
            )

    if ErrorCode.objects.count() < 8:
        for item in DEFAULT_ERROR_CODES:
            ErrorCode.objects.get_or_create(
                code=item['code'],
                defaults=item
            )

def query_assistant(user_message, session_id='guest', user=None):
    """Answers user queries from SQL FAQs & Error Codes, with ticket generation fallback."""
    seed_faqs_and_errors()

    msg_clean = user_message.strip()
    msg_lower = msg_clean.lower()

    # 1. Check for Error Code explanation request
    code_match = re.search(r'\b(400|401|403|404|429|500|503|480)\b', msg_lower)
    if code_match:
        code_num = int(code_match.group(1))
        err = ErrorCode.objects.filter(code=code_num).first()
        if err:
            site_tag = " (Site-Specific Engineer Hub Code)" if err.is_site_specific else ""
            reply = (
                f"**Error {err.code}: {err.title}**{site_tag}\n\n"
                f"• **Category:** {err.category}\n"
                f"• **Description:** {err.description}\n"
                f"• **Likely Cause:** {err.cause}\n"
                f"• **Recommended Fix:** {err.solution}\n\n"
                f"Would you like me to open a support ticket for this issue?"
            )
            log_chat_interaction(session_id, user_message, reply, {'type': 'error_code', 'code': code_num})
            return {
                'answer': reply,
                'source': 'Error Code Directory',
                'can_create_ticket': True,
                'ticket_subject': f"Assistance with Error {err.code} ({err.title})"
            }

    # 2. Check for FAQ match
    best_faq = None
    best_score = 0
    words = [w for w in re.findall(r'\w+', msg_lower) if len(w) > 2]

    for faq in FAQ.objects.all():
        score = 0
        faq_text = (faq.question + " " + faq.keywords + " " + faq.category).lower()
        for word in words:
            if word in faq_text:
                score += 1
        if score > best_score:
            best_score = score
            best_faq = faq

    if best_faq and best_score >= 1:
        reply = (
            f"**{best_faq.question}**\n\n"
            f"{best_faq.answer}\n\n"
            f"*(Category: {best_faq.category})*"
        )
        log_chat_interaction(session_id, user_message, reply, {'type': 'faq', 'faq_id': best_faq.id})
        return {
            'answer': reply,
            'source': f"SQL FAQ Database ({best_faq.category})",
            'can_create_ticket': False
        }

    # 3. Fallback when AI cannot answer -> Offer SQL Support Ticket
    reply = (
        f"I couldn't find a direct match for your question in our engineering FAQs or error code directory.\n\n"
        f"Would you like me to submit an official **Support Ticket** to our engineering team for investigation?"
    )
    log_chat_interaction(session_id, user_message, reply, {'type': 'unanswered_fallback'})
    return {
        'answer': reply,
        'source': 'AI Assistant Support Desk',
        'can_create_ticket': True,
        'ticket_subject': msg_clean[:60] if len(msg_clean) > 5 else "Engineering Hub Technical Inquiry"
    }
