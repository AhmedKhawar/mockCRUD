import { useEffect, useState } from 'react'

// ── Shared dialog data ───────────────────────────────────────────────────────
export const DOC_ENDPOINTS = [
    {
        method: 'GET', path: '/m/{slug}/{resource}', desc: 'List all records',
        sample: '{\n    "records": [\n        {\n            "id": "6aabd867c0c98f87d7df5057",\n            "name": "Alex Jones",\n            "age": 28,\n            "active": false\n        }\n    ],\n    "count": 1\n}'
    },
    {
        method: 'GET', path: '/m/{slug}/{resource}/:id', desc: 'Get record by ID',
        sample: '{\n    "id": "6aabd867c0c98f87d7df5057",\n    "name": "Alex Jones",\n    "age": 28,\n    "active": false\n}'
    },
    {
        method: 'POST', path: '/m/{slug}/{resource}', desc: 'Create a new record',
        sample: '{\n    "message": "Record added successfully",\n    "id": "6aabd867c0c98f87d7df5057",\n    "name": "Alex Jones",\n    "age": 28,\n    "active": false\n}'
    },
    {
        method: 'PUT', path: '/m/{slug}/{resource}/:id', desc: 'Replace a record by ID',
        sample: '{\n    "message": "Record updated successfully",\n    "id": "6aabd867c0c98f87d7df5057",\n    "name": "Alex Jones",\n    "age": 28,\n    "active": true\n}'
    },
    {
        method: 'DELETE', path: '/m/{slug}/{resource}/:id', desc: 'Delete a record by ID',
        sample: '{\n    "message": "Record deleted successfully",\n    "id": "6aabd867c0c98f87d7df5057"\n}'
    },
]

export const PROMPT_TIPS = [
    { icon: '🎯', label: 'Name it', example: '"create a product"', note: 'Fields are auto-inferred.' },
    { icon: '📋', label: 'List fields', example: '"user with name, email, age"', note: 'Exactly those fields are used.' },
    { icon: '🔢', label: 'Set a count', example: '"course with 5 fields"', note: 'LLM picks the best 5.' },
    { icon: '🔗', label: 'System prompt', example: '"student management system"', note: 'Multiple linked resources with foreign keys are inferred.' },
    { icon: '🚫', label: 'Avoid', example: '"how are you" / "president"', note: 'Off-topic or vague single words are rejected.' },
]

// ── Close Icon ────────────────────────────────────────────────────────────────
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

// ── Base Dialog shell ─────────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    return (
        <div className="dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div className="dialog-panel" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <span className="dialog-title">{title}</span>
                    <button className="dialog-close-btn" onClick={onClose} title="Close">
                        <CloseIcon />
                    </button>
                </div>
                <div className="dialog-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ── API Reference Dialog ──────────────────────────────────────────────────────
export function ReferenceDialog({ open, onClose }) {
    const [openEp, setOpenEp] = useState(null)

    return (
        <Dialog open={open} onClose={onClose} title="📖 API Reference">
            <p className="dialog-intro">
                Every resource gets a live REST API. Your project's <strong>slug</strong> never changes.
            </p>

            <div className="dialog-endpoint-table">
                {DOC_ENDPOINTS.map((ep, i) => {
                    const isOpen = openEp === i;
                    return (
                        <div
                            key={i}
                            className={`dialog-ep-row ${isOpen ? 'is-open' : ''}`}
                        >
                            <div className="dialog-ep-row-top">
                                <span className={`badge badge-${ep.method} dialog-badge`}>{ep.method}</span>
                                <code className="mono dialog-ep-path">{ep.path}</code>
                                <button
                                    className="dialog-ep-dropdown-btn"
                                    title="View sample response"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isNowOpen = !isOpen;
                                        setOpenEp(isNowOpen ? i : null);
                                        if (isNowOpen) {
                                            const row = e.currentTarget.closest('.dialog-ep-row');
                                            setTimeout(() => {
                                                if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                            }, 250);
                                        }
                                    }}
                                >
                                    {isOpen ? 'Hide response' : 'View response'}
                                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className={isOpen ? 'rotate-180' : ''}>
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                            </div>
                            <span className="dialog-ep-desc">{ep.desc}</span>

                            <div className="dialog-ep-sample-container">
                                <div className="dialog-ep-sample-box">
                                    <div className="sample-header">Example Response ({ep.method})</div>
                                    <pre className="sample-code">{ep.sample}</pre>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="dialog-notes">
                <div className="dialog-note">
                    <span className="dialog-note-label">ID field</span>
                    <p>MongoDB auto-generates <code className="mono">_id</code>; the API exposes it as <code className="mono">id</code>. Use it for GET by id, PUT, and DELETE.</p>
                </div>
                <div className="dialog-note">
                    <span className="dialog-note-label">Example</span>
                    <pre className="dialog-code">{`POST /m/abc123/customers
{ "name": "Alice", "email": "a@b.com" }
→ { "id": "64a...", "name": "Alice" }

PUT /m/abc123/customers/64a...
{ "name": "Alice Updated" }`}</pre>
                </div>
            </div>
        </Dialog>
    )
}

// ── Prompt Guide Dialog ───────────────────────────────────────────────────────
export function PromptDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} title="✦ Prompt Guide">
            <p className="dialog-intro">Describe a data model — not a question or greeting.</p>

            <div className="dialog-tips-list">
                {PROMPT_TIPS.map((tip, i) => (
                    <div key={i} className="dialog-tip">
                        <span className="dialog-tip-icon">{tip.icon}</span>
                        <div>
                            <span className="dialog-tip-label">{tip.label}</span>
                            <code className="dialog-tip-example">{tip.example}</code>
                            <span className="dialog-tip-note">{tip.note}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Dialog>
    )
}
