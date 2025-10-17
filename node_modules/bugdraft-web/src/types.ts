export type AdfDoc = {
  type: 'doc';
  version: 1;
  content: AdfNode[];
};

export type AdfNode = {
  type: 'paragraph';
  content: {
    type: 'text';
    text: string;
  }[];
};

export type BugDraft = {
  summary: string;
  descriptionPlaintext: string;
  descriptionDoc: AdfDoc;
};

export type DraftRequest = {
  userText: string;
  preferParentKey?: string;
  preferIssueType?: string;
  preferPriority?: string;
  currentSummary?: string;
  currentDescription?: string;
};

export type CreateRequest = {
  summary: string;
  descriptionDoc: AdfDoc;
  parentKey?: string;
  issueTypeName?: string;
  priorityName?: string;
};

export type MetaResponse = {
  jiraBaseUrl: string;
  projectKey: string;
  defaultParentKey: string;
  defaultIssueTypeName: string;
  defaultPriorityName: string;
};


