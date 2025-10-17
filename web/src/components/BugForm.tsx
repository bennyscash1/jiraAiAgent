import React, { useEffect, useMemo, useState } from 'react';
import { BugDraft, CreateRequest, DraftRequest, MetaResponse } from '../types';
import { createIssue, draftBug, fetchMeta } from '../api';
import Preview from './Preview';

function makeAdf(text: string) {
  return {
    type: 'doc' as const,
    version: 1 as const,
    content: [
      {
        type: 'paragraph' as const,
        content: [
          {
            type: 'text' as const,
            text,
          },
        ],
      },
    ],
  };
}

export default function BugForm() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [userText, setUserText] = useState('');
  const [parentKey, setParentKey] = useState('');
  const [issueTypeName, setIssueTypeName] = useState('');
  const [priorityName, setPriorityName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<BugDraft | null>(null);
  const [summary, setSummary] = useState('');
  const [descriptionPlaintext, setDescriptionPlaintext] = useState('');

  const jiraLink = useMemo(() => {
    return meta?.jiraBaseUrl ? (key: string) => `${meta.jiraBaseUrl}/browse/${key}` : null;
  }, [meta]);

  const [createResult, setCreateResult] = useState<any | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMeta().then(setMeta).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (meta) {
      setParentKey(meta.defaultParentKey || '');
      setIssueTypeName(meta.defaultIssueTypeName || '');
      setPriorityName(meta.defaultPriorityName || '');
    }
  }, [meta]);

  async function onGenerate(regenerate = false) {
    setError(null);
    setLoading(true);
    try {
      const body: DraftRequest = {
        userText,
        preferParentKey: parentKey || undefined,
        preferIssueType: issueTypeName || undefined,
        preferPriority: priorityName || undefined,
        currentSummary: regenerate ? summary : undefined,
        currentDescription: regenerate ? descriptionPlaintext : undefined,
      };
      const d = await draftBug(body);
      setDraft(d);
      setSummary(d.summary);
      setDescriptionPlaintext(d.descriptionPlaintext);
    } catch (e: any) {
      setError(`${e.status || ''} ${e.message || 'Failed to generate draft'}`.trim());
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setCreateError(null);
    setCreateResult(null);
    if (!summary.trim() || !descriptionPlaintext.trim()) {
      setCreateError('Summary and Description are required');
      return;
    }
    setCreating(true);
    try {
      const payload: CreateRequest = {
        summary: summary.trim(),
        descriptionDoc: makeAdf(descriptionPlaintext),
        parentKey: parentKey || undefined,
        issueTypeName: issueTypeName || undefined,
        priorityName: priorityName || undefined,
      };
      const result = await createIssue(payload);
      setCreateResult(result);
    } catch (e: any) {
      setCreateError(`${e.status || ''} ${e.message || 'Failed to create issue'}`.trim());
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid two-col">
      <div className="panel section">
        <div className="section-title">Describe the bug</div>
        <div className="control">
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="What did you try? What happened?"
          />
        </div>

        <div className="section-title" style={{ marginTop: 14 }}>Attributes</div>
        <div className="row row-3">
          <div className="control">
            <label className="muted">Parent issue key (optional)</label>
            <input type="text" value={parentKey} onChange={(e) => setParentKey(e.target.value)} />
          </div>
          <div className="control">
            <label className="muted">Issue type</label>
            <input type="text" value={issueTypeName} onChange={(e) => setIssueTypeName(e.target.value)} />
          </div>
          <div className="control">
            <label className="muted">Priority</label>
            <input type="text" value={priorityName} onChange={(e) => setPriorityName(e.target.value)} />
          </div>
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => onGenerate(false)} disabled={loading || !userText.trim()}>
            {loading ? 'Generating…' : 'Generate draft'}
          </button>
          {draft && (
            <button className="btn" onClick={() => onGenerate(true)} disabled={loading}>
              {loading ? 'Regenerating…' : 'Regenerate'}
            </button>
          )}
        </div>

        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="panel section">
        <div className="section-title">Preview & refine</div>
        {draft ? (
          <>
            <Preview
              summary={summary}
              descriptionPlaintext={descriptionPlaintext}
              onSummaryChange={setSummary}
              onDescriptionChange={setDescriptionPlaintext}
            />
            <div className="actions" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" onClick={onSave} disabled={creating}>
                {creating ? 'Saving…' : 'Save to Jira'}
              </button>
            </div>
          </>
        ) : (
          <div className="muted">Generate a draft to see a preview here.</div>
        )}

        {createError && <div className="alert alert-error" style={{ marginTop: 12 }}>{createError}</div>}
        {createResult && (
          <div className="alert alert-success result" style={{ marginTop: 12 }}>
            {createResult.key ? (
              <span>
                Created: {jiraLink ? (
                  <a href={jiraLink(createResult.key)} target="_blank" rel="noreferrer">{createResult.key}</a>
                ) : (
                  createResult.key
                )}
              </span>
            ) : (
              <pre>{JSON.stringify(createResult, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


