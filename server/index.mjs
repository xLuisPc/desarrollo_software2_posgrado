import { createApp } from './app.mjs';
const port = Number(process.env.PORT || 3001);
createApp().listen(port, '127.0.0.1', () =>
  console.log(`Campus Norte API · http://127.0.0.1:${port}`),
);
