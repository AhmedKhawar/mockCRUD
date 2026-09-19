import { useState, useCallback } from 'react'
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
const BrainIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5V5a2 2 0 0 0 4 0c0-1.1.9-2 2-2a2 2 0 0 1 0 4c0 .37-.1.72-.27 1.03A4 4 0 0 1 16 12a4 4 0 0 1-2 3.46V20a1 1 0 0 1-2 0v-3H8v3a1 1 0 0 1-2 0v-4.54A4 4 0 0 1 4 12a4 4 0 0 1 1.73-3.27A2 2 0 0 0 4 7a2 2 0 0 1 0-4 2 2 0 0 1 2 2 2 2 0 0 0 4 0V4.5A2.5 2.5 0 0 1 9.5 2z" />
    </svg>
)

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

// ── Single field row ───────────────────────────────────────────────────────
function FieldRow({ field, onChange, onDelete }) {
    return (
        <div className="cm-field-row">
            <input
                className="cm-field-input cm-field-name"
                placeholder="fieldName"
                value={field.name}
                onChange={e => onChange({ ...field, name: e.target.value })}
            />
            <div className="cm-select-wrap">
                <select
                    className="cm-field-select"
                    value={field.type}
                    onChange={e => onChange({ ...field, type: e.target.value })}
                >
                    {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>
            <label className="cm-field-required" title="Required">
                <input
                    type="checkbox"
                    checked={field.required}
                    onChange={e => onChange({ ...field, required: e.target.checked })}
                />
                <span className="cm-req-box" />
            </label>
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
    const deleteField = (fi) => onChange({ ...resource, fields: resource.fields.filter((_, i) => i !== fi) })
    const addField = () => onChange({
        ...resource,
        fields: [...resource.fields, { id: Date.now(), name: '', type: 'String', required: false }]
    })

    return (
        <div className="cm-resource-card">
            <div className="cm-resource-header">
                <span className="cm-resource-label">RESOURCE #{index + 1}</span>
                <input
                    className="cm-resource-name-input"
                    placeholder="resourceName"
                    value={resource.name}
                    onChange={e => onChange({ ...resource, name: e.target.value })}
                />
                <label className="cm-infer-label">
                    <input
                        type="checkbox"
                        checked={resource.inferFields}
                        onChange={e => onChange({ ...resource, inferFields: e.target.checked, fields: e.target.checked ? [] : resource.fields })}
                    />
                    <span className="cm-infer-check" />
                    <span className="cm-infer-text">Infer fields on own</span>
                </label>
                <label className="cm-count-label">
                    Count:
                    <input
                        className="cm-count-input"
                        type="number"
                        min={1}
                        max={50}
                        value={resource.count}
                        onChange={e => onChange({ ...resource, count: Math.max(1, Math.min(50, Number(e.target.value))) })}
                    />
                </label>
                <span className="cm-auth-label">Auth</span>
                <Toggle
                    id={`auth-${resource.id}`}
                    checked={resource.auth}
                    onChange={v => onChange({ ...resource, auth: v })}
                />
                {index > 0 && (
                    <button className="cm-resource-del" onClick={onDelete} title="Remove resource">
                        <TrashIcon />
                    </button>
                )}
            </div>

            {resource.inferFields ? (
                <div className="cm-infer-banner">
                    <BrainIcon />
                    <div>
                        <span className="cm-infer-banner-title">Field Inputs Auto-Locked for AI Generation</span>
                        <span className="cm-infer-banner-desc">
                            The model will auto-generate optimal attributes, infer data types, assign constraints,
                            and connect foreign keys to '{resource.name || 'this resource'}'.
                        </span>
                    </div>
                </div>
            ) : (
                <div className="cm-fields-section">
                    {resource.fields.length > 0 && (
                        <div className="cm-field-header-row">
                            <span>FIELD NAME</span>
                            <span>DATA TYPE</span>
                            <span>REQUIRED</span>
                            <span>DEL</span>
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
            )}
        </div>
    )
}

// ── newResource factory ────────────────────────────────────────────────────
const newResource = () => ({
    id: Date.now() + Math.random(),
    name: '',
    auth: false,
    inferFields: false,
    count: 5,
    fields: [{ id: Date.now(), name: '', type: 'String', required: false }],
})

// ── Main component ─────────────────────────────────────────────────────────
export default function CreationMode({ onSubmit, loading }) {
    const [tab, setTab] = useState('custom') // 'custom' | 'infer'
    const [resources, setResources] = useState([newResource()])
    const [systemName, setSystemName] = useState('')
    const [showPayload, setShowPayload] = useState(false)

    // Build payload for Option 1
    const customPayload = {
        mode: 'custom',
        resources: resources.map(r => ({
            name: r.name,
            auth: r.auth,
            inferFields: r.inferFields,
            count: r.count,
            fields: r.inferFields ? [] : r.fields.map(f => ({
                name: f.name,
                type: f.type,
                required: f.required,
            })),
        })),
    }

    // Build payload for Option 2
    const inferPayload = {
        mode: 'infer',
        systemName: systemName.trim(),
    }

    const currentPayload = tab === 'custom' ? customPayload : inferPayload

    const updateResource = useCallback((index, updated) => {
        setResources(prev => prev.map((r, i) => i === index ? updated : r))
    }, [])

    const deleteResource = useCallback((index) => {
        setResources(prev => prev.filter((_, i) => i !== index))
    }, [])

    const addResource = () => setResources(prev => [...prev, newResource()])

    const handleSubmit = () => {
        if (onSubmit) onSubmit(currentPayload)
    }

    // Stats for footer
    const manualCount = resources.filter(r => !r.inferFields).length
    const inferCount = resources.filter(r => r.inferFields).length

    // Validate for option 1
    const canSubmitCustom = resources.length > 0 && resources.every(r => r.name.trim())
    const canSubmitInfer = systemName.trim().length > 0

    return (
        <div className="cm-root">
            {/* Tab switcher */}
            <div className="cm-tabs">
                <button
                    className={`cm-tab ${tab === 'custom' ? 'cm-tab-active' : ''}`}
                    onClick={() => setTab('custom')}
                >
                    Option 1: Add Custom Resources
                </button>
                <button
                    className={`cm-tab ${tab === 'infer' ? 'cm-tab-active' : ''}`}
                    onClick={() => setTab('infer')}
                >
                    Option 2: Generate Full System via Prompt
                </button>
            </div>

            {/* ── Option 1 ── */}
            {tab === 'custom' && (
                <div className="cm-body">
                    {resources.map((r, i) => (
                        <ResourceCard
                            key={r.id}
                            resource={r}
                            index={i}
                            onChange={updated => updateResource(i, updated)}
                            onDelete={() => deleteResource(i)}
                        />
                    ))}

                    <button className="cm-add-resource-btn" onClick={addResource}>
                        <PlusIcon /> Add Another Resource
                    </button>

                    <div className="cm-footer">
                        <span className="cm-footer-stats">
                            ● {resources.length} Resource{resources.length !== 1 ? 's' : ''} Configured
                            {' '}({manualCount} Manual, {inferCount} Inferred)
                        </span>
                        <button
                            className="btn btn-teal cm-submit-btn"
                            onClick={handleSubmit}
                            disabled={loading || !canSubmitCustom}
                        >
                            {loading ? <><span className="spinner" /> Creating…</> : 'Create Mock Resources'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Option 2 ── */}
            {tab === 'infer' && (
                <div className="cm-body cm-infer-body">
                    <div className="cm-infer-section">
                        <label className="cm-infer-section-label">System Name</label>
                        <input
                            className="form-input cm-system-input"
                            placeholder="e.g. student management system, hospital records, e-commerce platform…"
                            value={systemName}
                            onChange={e => setSystemName(e.target.value)}
                        />
                        <p className="cm-infer-hint">
                            Backend will verify and infer all joins, fields, relationships, and data types automatically.
                            No manual configuration needed.
                        </p>
                    </div>
                    <div className="cm-footer">
                        <span />
                        <button
                            className="btn btn-teal cm-submit-btn"
                            onClick={handleSubmit}
                            disabled={loading || !canSubmitInfer}
                        >
                            {loading ? <><span className="spinner" /> Generating…</> : '⚡ Generate Full System'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Sample Payload Panel ── */}
            <div className="cm-payload-panel">
                <button className="cm-payload-toggle" onClick={() => setShowPayload(o => !o)}>
                    <span className="cm-payload-icon">{'</>'}</span>
                    <span>Sample Request Payload</span>
                    <svg
                        className={`cm-payload-chevron ${showPayload ? 'open' : ''}`}
                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                {showPayload && (
                    <div className="cm-payload-body">
                        <div className="cm-payload-label">
                            What the frontend will send to the backend — POST /api/resources/generate
                        </div>
                        <pre className="cm-payload-code">
                            {JSON.stringify(currentPayload, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
