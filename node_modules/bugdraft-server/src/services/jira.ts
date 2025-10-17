import fetch from 'node-fetch';
import { CreateRequest } from '../types.js';

export async function createIssue(req: CreateRequest) {
  const baseUrl = process.env.JIRA_BASE_URL;
  if (!baseUrl) {
    throw new Error('JIRA_BASE_URL is not configured');
  }

  const projectKey = process.env.JIRA_PROJECT_KEY;
  if (!projectKey) {
    throw new Error('JIRA_PROJECT_KEY is not configured');
  }

  // Trim summary to 255 chars
  const summary = req.summary.slice(0, 255);

  const parentKey = req.parentKey || process.env.JIRA_PARENT_KEY;
  const issueTypeName = req.issueTypeName || process.env.JIRA_ISSUE_TYPE_NAME;
  const priorityName = req.priorityName || process.env.JIRA_PRIORITY_NAME;

  const fields: any = {
    project: { key: projectKey },
    summary,
    description: req.descriptionDoc,
    issuetype: { name: issueTypeName },
    priority: { name: priorityName },
  };

  if (parentKey) {
    fields.parent = { key: parentKey };
  }

  const payload = { fields };

  // Dry-run if missing auth
  if (!process.env.JIRA_AUTH_BASIC) {
    // eslint-disable-next-line no-console
    console.log('Jira dry-run payload:', JSON.stringify(payload, null, 2));
    return { dryRun: true, payload };
  }

  const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.JIRA_AUTH_BASIC}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // keep raw text if not json
  }

  if (!response.ok) {
    const message = json?.errorMessages?.join('; ') || json?.message || text || 'Jira error';
    const error: any = new Error(message);
    error.status = response.status;
    throw error;
  }

  return json;
}


