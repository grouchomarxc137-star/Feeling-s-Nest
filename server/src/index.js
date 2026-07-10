import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import cors from 'cors';
import routes from './routes.js';
import { registerSocketHandlers } from './socket.js';
import { startDiscordBot } from './discordBot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: isDev ? { origin: '*' } : undefined,
});

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

registerSocketHandlers(io);
startDiscordBot();

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
