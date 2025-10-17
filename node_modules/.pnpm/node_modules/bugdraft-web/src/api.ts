import { BugDraft, CreateRequest, DraftRequest, MetaResponse } from './types';

async function handle(res: Response) {
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = json?.error || json?.message || text || 'Request failed';
    const error: any = new Error(message);
    error.status = res.status;
    throw error;
  }
  return json;
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch('/api/meta');
  return handle(res);
}

export async function draftBug(body: DraftRequest): Promise<BugDraft> {
  const res = await fetch('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function createIssue(body: CreateRequest): Promise<any> {
  const res = await fetch('/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}


