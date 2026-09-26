/** Keys of the pre-made sample apps. Must match backend/app/services/templates.py. */
export const TEMPLATE_KEYS = ["support_desk", "leave_tracker", "sales_crm", "meeting_notes", "ops_dashboard"] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];
