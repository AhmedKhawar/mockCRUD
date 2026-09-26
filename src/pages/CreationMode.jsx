import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './CreationMode.css'

const DATA_TYPES = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object', 'ObjectId', 'Mixed', 'Buffer', 'Decimal']

// ── Icons ──────────────────────────────────────────────────────────────────
const PlusIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
)
const SparkIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
)
const LinkIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
)
const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

// ── Error Dialog via portal ────────────────────────────────────────────────
function ErrorDialog({ message, onClose }) {
    return createPortal(
        <div className="cme-backdrop" onClick={onClose}>
            <div className="cme-dialog" onClick={e => e.stopPropagation()}>
                <div className="cme-dialog-header">
                    <div className="cme-dialog-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <span>Generation Failed</span>
                    <button className="cme-dialog-x" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <p className="cme-dialog-msg">{message}</p>
                <button className="cme-dialog-btn" onClick={onClose}>Dismiss</button>
            </div>
        </div>,
        document.body
    )
}

// ── Loading overlay ────────────────────────────────────────────────────────
function LoadingOverlay() {
    return (
        <div className="cme-loading">
            <div className="cme-loading-dots"><span /><span /><span /></div>
            <span>Creating resources…</span>
        </div>
    )
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
    return (
        <label className="cme-toggle" htmlFor={id}>
            <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="cme-track"><span className="cme-thumb" /></span>
        </label>
    )
}

// ── Custom checkbox ────────────────────────────────────────────────────────
function CB({ checked, onChange }) {
    return (
        <label className="cme-cb">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="cme-cb-box">
                {checked && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
        </label>
    )
}

// ── Field row ─────────────────────────────────────────────────────────────
function FieldRow({ field, onChange, onDelete, isOnly }) {
    const isBad = field.name.trim().toLowerCase() === 'id'
    return (
        <div className={`cme-field-row${isBad ? ' cme-field-row--bad' : ''}`}>
            <div className="cme-field-name-cell">
                <input
                    className="cme-field-input"
                    placeholder="fieldName"
                    value={field.name}
                    onChange={e => onChange({ ...field, name: e.target.value })}
                />
                {isBad && <span className="cme-id-badge">use compound e.g. userId</span>}
            </div>
            <div className="cme-select-wrap">
                <select className="cme-field-select" value={field.type} onChange={e => onChange({ ...field, type: e.target.value })}>
                    {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <svg className="cme-select-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <CB checked={field.required} onChange={v => onChange({ ...field, required: v })} />
            <button className="cme-del-field" onClick={onDelete} disabled={isOnly} title={isOnly ? 'Need at least one field' : 'Delete field'}>
                <TrashIcon />
            </button>
        </div>
    )
}

// ── Resource block ─────────────────────────────────────────────────────────
function ResourceBlock({ resource, index, total, onChange, onDelete }) {
    const updateField = (fi, val) => onChange({ ...resource, fields: resource.fields.map((f, i) => i === fi ? val : f) })
    const removeField = fi => onChange({ ...resource, fields: resource.fields.filter((_, i) => i !== fi) })
    const MAX_FIELDS = 8
    const addField = () => {
        if (resource.fields.length >= MAX_FIELDS) return
        onChange({ ...resource, fields: [...resource.fields, { id: Date.now(), name: '', type: 'String', required: false }] })
    }

    const handleCount = raw => {
        if (raw === '') { onChange({ ...resource, inferFieldCount: '' }); return }
        const n = parseInt(raw, 10)
        if (!isNaN(n) && n >= 1 && n <= 8) onChange({ ...resource, inferFieldCount: n })
    }

    const hasIdErr = !resource.inferFields && resource.fields.some(f => f.name.trim().toLowerCase() === 'id')

    return (
        <div className={`cme-block${hasIdErr ? ' cme-block--err' : ''}`}>

            {/* ── Header: row 1 — entity name ── */}
            <div className="cme-block-head">
                <span className="cme-block-num">{index + 1}</span>
                <input
                    className="cme-name-input"
                    placeholder="e.g. users, products, orders"
                    value={resource.name}
                    onChange={e => onChange({ ...resource, name: e.target.value })}
                />
                {total > 1 && (
                    <button className="cme-del-block" onClick={onDelete} title="Remove resource">
                        <TrashIcon />
                    </button>
                )}
            </div>

            {/* ── Header: row 2 — controls ── */}
            <div className="cme-block-controls-bar">
                <button
                    className={`cme-ctrl-btn${resource.link ? ' cme-ctrl-btn--on' : ''}`}
                    onClick={() => onChange({ ...resource, link: !resource.link })}
                    title="Allow AI to link this to other resources"
                    type="button"
                >
                    <LinkIcon />
                    <span>Link</span>
                    {resource.link
                        ? <span className="cme-ctrl-dot cme-ctrl-dot--on" />
                        : <span className="cme-ctrl-dot" />}
                </button>
                <button
                    className={`cme-ctrl-btn${resource.auth ? ' cme-ctrl-btn--on' : ''}`}
                    onClick={() => onChange({ ...resource, auth: !resource.auth })}
                    title="Require JWT authentication"
                    type="button"
                >
                    <LockIcon />
                    <span>Auth</span>
                    {resource.auth
                        ? <span className="cme-ctrl-dot cme-ctrl-dot--on" />
                        : <span className="cme-ctrl-dot" />}
                </button>
            </div>

            {/* ── Infer fields strip ── */}
            <div className="cme-infer-strip">
                <button
                    className={`cme-infer-toggle${resource.inferFields ? ' cme-infer-toggle--on' : ''}`}
                    onClick={() => onChange({ ...resource, inferFields: !resource.inferFields, inferFieldCount: resource.inferFieldCount || '' })}
                    type="button"
                >
                    <SparkIcon />
                    Infer fields
                </button>
                {resource.inferFields && (
                    <>
                        <div className="cme-infer-count">
                            <input
                                className="cme-count-input"
                                type="number"
                                min="1"
                                max="8"
                                step="1"
                                placeholder=""
                                value={resource.inferFieldCount ?? ''}
                                onChange={e => handleCount(e.target.value)}
                                autoFocus
                            />
                            <span className="cme-count-unit">fields</span>
                            <span className="cme-count-range">(1 – 8)</span>
                        </div>
                        <span className="cme-infer-note">
                            AI will generate {resource.inferFieldCount ? <strong>{resource.inferFieldCount}</strong> : '…'} relevant fields
                        </span>
                    </>
                )}
            </div>

            {/* ── Manual fields ── */}
            {!resource.inferFields && (
                <div className="cme-fields">
                    <div className="cme-fields-header">
                        <span>Field name</span>
                        <span>Type</span>
                        <span>Req</span>
                        <span />
                    </div>
                    {resource.fields.map((f, fi) => (
                        <FieldRow
                            key={f.id}
                            field={f}
                            onChange={v => updateField(fi, v)}
                            onDelete={() => removeField(fi)}
                            isOnly={resource.fields.length === 1}
                        />
                    ))}
                    {resource.fields.length < MAX_FIELDS ? (
                        <button className="cme-add-field" onClick={addField}>
                            <PlusIcon /> Add field
                        </button>
                    ) : (
                        <span className="cme-fields-cap">Max {MAX_FIELDS} fields reached</span>
                    )}
                </div>
            )}
        </div>
    )
}

// ── AI banner ──────────────────────────────────────────────────────────────
function AiBanner({ results }) {
    if (!results.length) return null
    return (
        <div className="cme-ai-banner">
            <div className="cme-ai-title"><SparkIcon /> AI completed relationships</div>
            {results.map(r => (
                <div key={r.resource} className="cme-ai-row">
                    <strong>{r.resource}</strong> — added: {r.aiAddedFields.map(f => <code key={f} className="cme-ai-chip">{f}</code>)}
                </div>
            ))}
        </div>
    )
}

const fresh = () => ({
    id: Date.now() + Math.random(),
    name: '',
    auth: false,
    link: true,
    inferFields: false,
    inferFieldCount: undefined,
    fields: [{ id: Date.now(), name: '', type: 'String', required: false }],
})

// ── Main component ─────────────────────────────────────────────────────────
export default function CreationMode({ onSubmit, loading }) {
    const [resources, setResources] = useState([fresh()])
    const [error, setError] = useState(null)
    const [aiResult, setAiResult] = useState([])

    const reset = () => { setResources([fresh()]); setAiResult([]) }

    const update = useCallback((i, val) => setResources(p => p.map((r, idx) => idx === i ? val : r)), [])
    const remove = useCallback(i => setResources(p => p.filter((_, idx) => idx !== i)), [])
    const add = () => setResources(p => p.length < 5 ? [...p, fresh()] : p)

    const hasIdErr = resources.some(r => !r.inferFields && r.fields.some(f => f.name.trim().toLowerCase() === 'id'))

    const canSubmit = !hasIdErr && resources.length > 0 &&
        resources.every(r => r.name.trim()) &&
        resources.every(r => r.inferFields
            ? (r.inferFieldCount && r.inferFieldCount > 0)
            : r.fields.some(f => f.name.trim())
        )

    const handleSubmit = async () => {
        setAiResult([])
        const payload = {
            resources: resources.map(r =>
                r.inferFields
                    ? { name: r.name, auth: r.auth, link: r.link, inferFields: true, inferFieldCount: r.inferFieldCount }
                    : {
                        name: r.name, auth: r.auth, link: r.link, inferFields: false,
                        fields: r.fields
                            .filter(f => f.name.trim() && f.name.trim().toLowerCase() !== 'id')
                            .map(f => ({ name: f.name, type: f.type, required: f.required }))
                    }
            )
        }
        try {
            const res = await onSubmit(payload)
            if (Array.isArray(res)) setAiResult(res.filter(r => r.aiAddedFields?.length).map(r => ({ resource: r.name, aiAddedFields: r.aiAddedFields })))
            reset()
        } catch (err) {
            setError(err.message || 'Something went wrong')
        }
    }

    return (
        <div className="cme-root">
            {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
            {loading && <LoadingOverlay />}

            <AiBanner results={aiResult} />

            <div className="cme-body">
                {resources.map((r, i) => (
                    <ResourceBlock
                        key={r.id}
                        resource={r}
                        index={i}
                        total={resources.length}
                        onChange={val => update(i, val)}
                        onDelete={() => remove(i)}
                    />
                ))}

                {resources.length < 5 ? (
                    <button className="cme-add-block" onClick={add} disabled={loading}>
                        <PlusIcon /> Add another resource
                    </button>
                ) : (
                    <span className="cme-fields-cap">Max resources in one cycle reached</span>
                )}

                <div className="cme-footer">
                    <span className="cme-footer-count">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''}
                        {hasIdErr && <span className="cme-footer-err"> · Remove forbidden "id" field</span>}
                    </span>
                    <button className="btn btn-teal cme-submit" onClick={handleSubmit} disabled={loading || !canSubmit}>
                        Create Resources
                    </button>
                </div>
            </div>
        </div>
    )
}
