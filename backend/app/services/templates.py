"""Keys of the pre-made sample apps the preview can show. Must match frontend/src/sample-apps."""

from typing import Literal

TemplateKey = Literal["support_desk", "leave_tracker", "sales_crm", "meeting_notes", "ops_dashboard"]

TEMPLATE_DESCRIPTIONS: dict[str, str] = {
    "support_desk": "customer support: an assistant answering questions, a conversation inbox, help articles",
    "leave_tracker": "HR and requests: forms people submit, approvals by a manager, a shared calendar",
    "sales_crm": "sales and leads: a list of contacts or leads with scores, a pipeline, drafted outreach",
    "meeting_notes": "documents and notes: upload text, get summaries and action items, searchable history",
    "ops_dashboard": "anything else: a dashboard with metrics, tables of records and automated reports",
}

# Words that point to a template when no AI is available to choose one.
TEMPLATE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "support_desk": ("support", "customer", "help", "ticket", "faq", "chatbot", "question"),
    "leave_tracker": ("leave", "holiday", "time off", "vacation", "approval", "request", "hr ", "employee"),
    "sales_crm": ("sales", "lead", "crm", "prospect", "deal", "outreach", "pipeline"),
    "meeting_notes": ("meeting", "notes", "transcript", "summar", "document", "minutes"),
}

DEFAULT_TEMPLATE: TemplateKey = "ops_dashboard"
