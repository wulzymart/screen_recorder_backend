import http from 'http';
import express from 'express';
import { createWriteStream } from 'fs';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import dotEnv from 'dotenv';
import cors from 'cors';
import { bucket } from './configs/firebase.js';
import { connectDB } from './configs/dbConfig.js';
import Video from './models/video.js';
import Transcript from './models/transcript.js';
import Entry from './models/bothEntities.js';
dotEnv.config();

// TODO: link to db

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());

wss.on('connection', async (ws) => {
  console.log('a client connected');
  const id = uuidv4().toString();
  const newEntryData = await Entry.create({ created: false });
  console.log(newEntryData);
  const vidFile = bucket.file(id + '.webm').createWriteStream({ gzip: true });
  ws.send(JSON.stringify({ id: newEntryData.id }));
  ws.on('message', (message) => {
    vidFile.write(message, 'binary');
  });
  ws.on('close', async () => {
    console.log('A client disconnected');
    // Close the writable stream when the client disconnects
    if (vidFile) {
      vidFile.end();
      const vidData = await Video.create({ fileId: id });
      newEntryData.videoId = vidData.id;
      newEntryData.created = true;
      await newEntryData.save();
    }
  });
});
app.get('/api/entries/:id', async (req, res) => {
  const entryData = await Entry.findById(req.params.id);
  if (!entryData) return res.status(404).json({ mssg: 'entry not found' });
  res.status(200).json(entryData);
});
app.delete('/api/entries/:id', async (req, res) => {
  const entryData = await Entry.findByIdAndDelete(req.params.id);
  if (!entryData) return res.status(404).json({ mssg: 'entry not found' });
  await Video.findByIdAndDelete(entryData.videoId)
  if (entryData.transciptId) await Transcript.findByIdAndDelete(entryData.transciptId)
  res.status(200).json(entryData);
});
app.post('/api/entries:id/add_transcript', async (req, res) => {
  const transcript = req.body;
  const entryData = await Entry.findById(req.params.id);
  if (!entryData) {
    return res.status(404).json({ mssg: 'entry id not found' });
  }
  const newtranscript = await Transcript.create({ transcript });
  entryData.transciptId = newtranscript.id;
  entryData.save();
  res.status(200).json(newtranscript);
});
app.get('/api/videos/:id', async (req, res) => {
  const vidData = await Video.findById(req.params.id);
  if (!vidData) return res.status(404).json({ mssg: 'file not found' });
  const vidFile = bucket
    .file(vidData.fileId + '.webm')
    .createReadStream({ decompress: true });
  res.setHeader('Content-Type', 'video/webm');
  vidFile.pipe(res);
});

app.get('/api/transcript/:id', async (req, res) => {
  const transcipt = await Transcript.findById(req.params.id);
  if (!transcipt)
    return res.status(404).json({ mssg: 'transcript not found not found' });
  res.status(200).json(transcipt);
});

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(process.env.PORT || 3000, () => {
    console.log('listening on port 3000');
  });
};

start();
