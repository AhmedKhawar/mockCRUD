import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './CreationMode.css'

const DATA_TYPES = ['String', 'Number', 'Boolean', 'Array', 'Object']

// ── Icons ──────────────────────────────────────────────────────────────────
const PlusIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const TrashIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)
const SparkIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
)
const InfoIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8.01" /><line x1="12" y1="12" x2="12" y2="16" />
    </svg>
)

// ── Error Dialog (rendered via portal — avoids overflow:hidden clipping) ───
function ErrorDialog({ message, onClose }) {
    return createPortal(
        <div className="cm-dialog-backdrop" onClick={onClose}>
            <div className="cm-dialog" onClick={e => e.stopPropagation()}>
                <div className="cm-dialog-header">
                    <div className="cm-dialog-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <span className="cm-dialog-title">Generation Failed</span>
                    <button className="cm-dialog-close" onClick={onClose} aria-label="Close">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <p className="cm-dialog-msg">{message}</p>
                <button className="cm-dialog-btn" onClick={onClose}>Dismiss</button>
            </div>
        </div>,
        document.body
    )
}

// ── Animated loader overlay ────────────────────────────────────────────────
function LoadingOverlay() {
    return (
        <div className="cm-loading-overlay">
            <div className="cm-loading-inner">
                <div className="cm-loading-dots">
                    <span /><span /><span />
                </div>
                <p className="cm-loading-text">Generating resources…</p>
            </div>
        </div>
    )
}

// ── Toggle switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
    return (
        <label className="cm-toggle" htmlFor={id}>
            <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="cm-toggle-track">
                <span className="cm-toggle-thumb" />
            </span>
        </label>
    )
}

// ── Checkbox ──────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label, className = '' }) {
    return (
        <label className={`cm-checkbox-label ${className}`}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="cm-checkbox-native" />
            <span className="cm-checkbox-box">{checked && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}</span>
            {label && <span className="cm-checkbox-text">{label}</span>}
        </label>
    )
}

// ── Single field row ───────────────────────────────────────────────────────
function FieldRow({ field, onChange, onDelete }) {
    const isIdForbidden = field.name.trim().toLowerCase() === 'id'

    return (
        <div className="cm-field-row">
            <div className="cm-field-name-wrap">
                <input
                    className={`cm-field-input${isIdForbidden ? ' cm-field-input--error' : ''}`}
                    placeholder="fieldName"
                    value={field.name}
                    onChange={e => onChange({ ...field, name: e.target.value })}
                />
                {isIdForbidden && (
                    <div className="cm-id-tooltip">
                        <InfoIcon />
                        <span className="cm-id-tooltip-text">
                            MongoDB auto-creates <code>_id</code> for every record (returned as <code>id</code> to clients). For foreign keys use compound names like <code>studentId</code> or <code>userId</code>.
                        </span>
                    </div>
                )}
            </div>
            <select
                className="cm-field-select"
                value={field.type}
                onChange={e => onChange({ ...field, type: e.target.value })}
            >
                {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="cm-field-req-cell">
                <Checkbox checked={field.required} onChange={v => onChange({ ...field, required: v })} />
            </div>
            <button className="cm-field-del" onClick={onDelete} title="Delete field">
                <TrashIcon />
            </button>
        </div>
    )
}

// ── Resource card ──────────────────────────────────────────────────────────
function ResourceCard({ resource, index, onChange, onDelete }) {
    const updateField = (fi, updated) => {
        const fields = resource.fields.map((f, i) => i === fi ? updated : f)
        onChange({ ...resource, fields })
    }
    const deleteField = fi => onChange({ ...resource, fields: resource.fields.filter((_, i) => i !== fi) })
    const addField = () => onChange({
        ...resource,
        fields: [...resource.fields, { id: Date.now(), name: '', type: 'String', required: false }]
    })

    return (
        <div className="cm-resource-card">
            <div className="cm-resource-header">
                <span className="cm-resource-num">#{index + 1}</span>
                <input
                    className="cm-resource-name-input"
                    placeholder="resourceName  (e.g. students, orders)"
                    value={resource.name}
                    onChange={e => onChange({ ...resource, name: e.target.value })}
                />
                <div className="cm-auth-wrap">
                    <span className="cm-auth-label">Auth</span>
                    <Toggle
                        id={`auth-${resource.id}`}
                        checked={resource.auth}
                        onChange={v => onChange({ ...resource, auth: v })}
                    />
                </div>
                {index > 0 && (
                    <button className="cm-resource-del" onClick={onDelete} title="Remove resource">
                        <TrashIcon />
                    </button>
                )}
            </div>

            <div className="cm-fields-section">
                {resource.fields.length > 0 && (
                    <div className="cm-field-header-row">
                        <span>Field name</span>
                        <span>Type</span>
                        <span>Req</span>
                        <span />
                    </div>
                )}
                {resource.fields.map((f, fi) => (
                    <FieldRow
                        key={f.id}
                        field={f}
                        onChange={updated => updateField(fi, updated)}
                        onDelete={() => deleteField(fi)}
                    />
                ))}
                <button className="cm-add-field-btn" onClick={addField}>
                    <PlusIcon /> Add Field
                </button>
            </div>
        </div>
    )
}

// ── AI-added fields callout (shown after creation) ─────────────────────────
function AiAddedCallout({ resourceName, fields }) {
    if (!fields || fields.length === 0) return null
    return (
        <div className="cm-ai-added-callout">
            <SparkIcon />
            <span>
                <strong>{resourceName}</strong> — AI added: {fields.map(f => (
                    <code key={f} className="cm-ai-added-field">{f}</code>
                ))}
            </span>
        </div>
    )
}

const newResource = () => ({
    id: Date.now() + Math.random(),
    name: '',
    auth: false,
    fields: [{ id: Date.now(), name: '', type: 'String', required: false }],
})

// ── Main component ─────────────────────────────────────────────────────────
export default function CreationMode({ onSubmit, loading }) {
    const [tab, setTab] = useState('custom')
    const [resources, setResources] = useState([newResource()])
    const [systemName, setSystemName] = useState('')
    const [error, setError] = useState(null)
    const [aiAddedResult, setAiAddedResult] = useState([]) // [{resource, aiAddedFields}]

    const resetCustom = () => { setResources([newResource()]); setAiAddedResult([]) }
    const resetInfer = () => { setSystemName(''); setAiAddedResult([]) }

    const updateResource = useCallback((index, updated) => {
        setResources(prev => prev.map((r, i) => i === index ? updated : r))
    }, [])

    const deleteResource = useCallback(index => {
        setResources(prev => prev.filter((_, i) => i !== index))
    }, [])

    const addResource = () => setResources(prev => [...prev, newResource()])

    // Check if any field has the forbidden "id" name
    const hasIdField = resources.some(r =>
        r.fields.some(f => f.name.trim().toLowerCase() === 'id')
    )

    const handleSubmit = async () => {
        setAiAddedResult([])

        const payload = tab === 'custom'
            ? {
                mode: 'custom',
                resources: resources.map(r => ({
                    name: r.name,
                    auth: r.auth,
                    fields: r.fields
                        .filter(f => f.name.trim() && f.name.trim().toLowerCase() !== 'id')
                        .map(f => ({ name: f.name, type: f.type, required: f.required }))
                })),
            }
            : { mode: 'infer', systemName: systemName.trim() }

        try {
            const result = await onSubmit(payload)
            // onSubmit should return the created resources so we can surface AI-added fields
            if (result && Array.isArray(result)) {
                const added = result
                    .filter(r => r.aiAddedFields && r.aiAddedFields.length > 0)
                    .map(r => ({ resource: r.name, aiAddedFields: r.aiAddedFields }))
                setAiAddedResult(added)
            }
            if (tab === 'custom') resetCustom()
            else resetInfer()
        } catch (err) {
            setError(err.message || 'Something went wrong')
        }
    }

    const canSubmitCustom = resources.length > 0 &&
        resources.every(r => r.name.trim()) &&
        !hasIdField

    const canSubmitInfer = systemName.trim().length > 0

    return (
        <div className="cm-root">
            {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
            {loading && <LoadingOverlay />}

            {/* AI-added fields notification */}
            {aiAddedResult.length > 0 && (
                <div className="cm-ai-added-banner">
                    <div className="cm-ai-added-banner-title">
                        <SparkIcon /> AI completed missing relationships
                    </div>
                    {aiAddedResult.map(r => (
                        <AiAddedCallout key={r.resource} resourceName={r.resource} fields={r.aiAddedFields} />
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="cm-tabs">
                <button className={`cm-tab${tab === 'custom' ? ' cm-tab-active' : ''}`} onClick={() => setTab('custom')} disabled={loading}>
                    Add Custom Resources
                </button>
                <button className={`cm-tab${tab === 'infer' ? ' cm-tab-active' : ''}`} onClick={() => setTab('infer')} disabled={loading}>
                    Generate Full System via Prompt
                </button>
            </div>

            {/* Custom tab */}
            {tab === 'custom' && (
                <div className="cm-body">
                    {/* MongoDB ID info banner */}
                    <div className="cm-id-info-banner">
                        <InfoIcon />
                        <span>
                            MongoDB auto-creates an <code>_id</code> for every record (returned as <code>id</code>).
                            Do not add an <code>id</code> field. For foreign keys use compound names like <code>studentId</code> or <code>courseId</code>.
                            The AI will detect missing relational joins and add them automatically.
                        </span>
                    </div>

                    {resources.map((r, i) => (
                        <ResourceCard
                            key={r.id}
                            resource={r}
                            index={i}
                            onChange={updated => updateResource(i, updated)}
                            onDelete={() => deleteResource(i)}
                        />
                    ))}
                    <button className="cm-add-resource-btn" onClick={addResource} disabled={loading}>
                        <PlusIcon /> Add Another Resource
                    </button>
                    <div className="cm-footer">
                        <span className="cm-footer-stats">
                            {resources.length} Resource{resources.length !== 1 ? 's' : ''}
                            {hasIdField && (
                                <span className="cm-footer-id-warn"> · ⚠ Remove forbidden "id" field</span>
                            )}
                        </span>
                        <button className="btn btn-teal cm-submit-btn" onClick={handleSubmit} disabled={loading || !canSubmitCustom}>
                            Create Mock Resources
                        </button>
                    </div>
                </div>
            )}

            {/* Infer tab */}
            {tab === 'infer' && (
                <div className="cm-body">
                    <div className="cm-infer-section">
                        <label className="cm-infer-section-label">Describe your system</label>
                        <input
                            className="cm-system-input"
                            placeholder="e.g. student management system, hospital records, e-commerce platform…"
                            value={systemName}
                            onChange={e => setSystemName(e.target.value)}
                            disabled={loading}
                        />
                        <p className="cm-infer-hint">
                            The AI will verify this is a recognisable software system, then infer all entities, fields,
                            datatypes, required flags, and relational foreign keys. MongoDB automatically generates an <code>_id</code> for
                            every record (exposed as <code>id</code>) — foreign-key fields in child resources
                            (e.g. <code>studentId</code> in <code>enrollments</code>) reference that <code>_id</code>.
                            You do not need to add an <code>id</code> field manually.
                        </p>
                    </div>
                    <div className="cm-footer">
                        <span />
                        <button className="btn btn-teal cm-submit-btn" onClick={handleSubmit} disabled={loading || !canSubmitInfer}>
                            ⚡ Generate Full System
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
