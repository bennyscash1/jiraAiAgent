import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    jiraBaseUrl: process.env.JIRA_BASE_URL || '',
    projectKey: process.env.JIRA_PROJECT_KEY || '',
    defaultParentKey: process.env.JIRA_PARENT_KEY || '',
    defaultIssueTypeName: process.env.JIRA_ISSUE_TYPE_NAME || '',
    defaultPriorityName: process.env.JIRA_PRIORITY_NAME || '',
  });
});

export default router;


