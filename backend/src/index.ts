import cors from 'cors';
import express from 'express';

import { router } from './routes.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', router);

app.listen(port, () => {
  console.log(`Bill Lens API listening on :${port}`);
});
