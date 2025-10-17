import { Router } from 'express';
import { DraftRequest, BugDraft } from '../types.js';
import { generateDraft } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const body: DraftRequest = req.body;
    if (!body?.userText || typeof body.userText !== 'string') {
      return res.status(400).json({ error: 'userText is required' });
    }

    const draft: BugDraft = await generateDraft(body);
    return res.json(draft);
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || 'Draft generation failed' });
  }
});

export default router;


