import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load root .env regardless of CWD
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json({ limit: '1mb' }));

// CORS for dev only
const devOrigin = `http://localhost:${process.env.VITE_DEV_SERVER_PORT || 5173}`;
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? false : devOrigin,
    credentials: false,
  })
);

// Routes
import draftRouter from './routes/openai.js';
import jiraRouter from './routes/jira.js';
import metaRouter from './routes/meta.js';

app.use('/api/draft', draftRouter);
app.use('/api/create', jiraRouter);
app.use('/api/meta', metaRouter);

// Serve web build in production
const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


