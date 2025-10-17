import { Router } from 'express';
import { CreateRequest } from '../types.js';
import { createIssue } from '../services/jira.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const body: CreateRequest = req.body;
    if (!body?.summary || !body?.descriptionDoc) {
      return res.status(400).json({ error: 'summary and descriptionDoc are required' });
    }

    const result = await createIssue(body);
    return res.json(result);
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || 'Jira create failed' });
  }
});

export default router;


