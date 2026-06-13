import cors from 'cors';
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ ok: true, message: 'LogPose API running' });
});

app.listen(PORT);
