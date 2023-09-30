import http from 'http';
import express from 'express';
import { createReadStream, createWriteStream, unlink } from 'fs';
import { WebSocketServer } from 'ws';
import dotEnv from 'dotenv';
import cors from 'cors';
import ffprobeins from '@ffprobe-installer/ffprobe';
import ffmpegins from '@ffmpeg-installer/ffmpeg';
import Ffmpeg from 'fluent-ffmpeg';
import { bucket } from './configs/firebase.js';
import { connectDB } from './configs/dbConfig.js';
import Video from './models/video.js';
import path from 'path';
import { fileURLToPath } from 'url';
import transciptFile from './configs/deepgram.js';

dotEnv.config();

// setting up video converter
Ffmpeg.setFfmpegPath(ffmpegins.path);
Ffmpeg.setFfprobePath(ffprobeins.path);

// to display readme
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// settup the server
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// middlewares
app.use(cors());
app.use(express.static('public'));

// handle websocket conections to get live video, convert audio and transcribe
wss.on('connection', async (ws) => {
  console.log('a client connected');
  let newVideoData = await Video.create({ created: false }); //make a new entry in database and send  id to frontend
  // creating files
  const id = newVideoData.id; // to create unique video file
  const localVidFilePath = path.join(__dirname, 'videos', `${id}.webm`);
  const localAudFilePath = path.join(__dirname, 'audios', `${id}.mp3`);
  const vidFileGCS = bucket
    .file(`${id}.webm`)
    .createWriteStream({ gzip: true });
  const localVidFile = createWriteStream(localVidFilePath);

  ws.send(JSON.stringify({ id: newVideoData.id }));
  ws.on('message', async (message) => {
    try {
      localVidFile.write(message, 'binary');
      vidFileGCS.write(message, 'binary');
    } catch (error) {
      console.log(error);
      await newVideoData.deleteOne();
      newVideoData = null;
      ws.send(JSON.stringify({ err: 'error creating file' }));
      ws.close();
    }
  });

  ws.on('close', async () => {
    console.log('A client disconnected');

    // Close the writable stream when the client disconnects
    vidFileGCS.end(async () => {
      newVideoData.created = true;

      // close local file and generate transcript
      localVidFile.close(async () => {
        // convert to audio
        const command = Ffmpeg(localVidFilePath).toFormat('mp3');
        command
          .saveToFile(localAudFilePath)

          .on('progress', () => {
            console.log('conversion in progress');
          })

          .on('end', async () => {
            console.log('conversion done');

            // delete local video file
            unlink(localVidFilePath, (err) => {
              if (err) console.log(err);
              else console.log(localVidFilePath, 'deleted');
            });

            // get transcription from deepgram
            const transcript = await transciptFile(
              createReadStream(localAudFilePath),
              'mp3'
            );
            if (transcript) {
              // update newData
              newVideoData.transcipt = JSON.stringify(transcript);
              await newVideoData.save();

              // delete local audio file
              unlink(localAudFilePath, (err) => {
                if (err) console.log(err);
                else console.log(localAudFilePath, 'deleted');
              });
            }
          })

          .on('error', (err) => {
            console.log(err);
          });
      });
      await newVideoData.save();
    });
  });
});


// api routes
app.get('/api/videos/:id', async (req, res) => {
  const id = req.params.id;
  const vidData = await Video.findById(id);
  console.log(vidData);
  if (!vidData) return res.status(404).json({ mssg: 'file not found' });
  const vidFile = bucket.file(id + '.webm');
  if (!(await vidFile.exists()))
    return res.status(404).json({ mssg: 'file not found' });
  const response = await vidFile.getSignedUrl({
    action: 'read',
    expires: Date.now() + 24 * 60 * 1000,
  });
  const signedUrl = response[0];
  res.status(200).json({
    downloadLink: signedUrl,
    streamLink: `${process.env.DOMAIN}/api/videos/${id}/stream`,
    transciptJson: vidData.transcipt,
    dateCreated: vidData.createdAt,
  });
});

app.get('/api/videos/:id/stream', async (req, res) => {
  const vidFile = bucket.file(req.params.id + '.webm');
  if (!(await vidFile.exists()))
    return res.status(404).json({ mssg: 'file not found' });
  res.setHeader('Content-Type', 'video/webm');
  vidFile.createReadStream().pipe(res);
});

app.delete('/api/videos/:id', async (req, res) => {
  const id = req.params.id;
  const vidData = await Video.findByIdAndDelete(id);
  if (!vidData) return res.status(404).json({ mssg: 'file not found' });
  const vidFile = bucket.file(id + '.webm');
  if (!(await vidFile.exists()))
    return res.status(404).json({ mssg: 'file not found' });
  vidFile.delete(() => {
    console.log('file deleted');
  });
  res.status(200).json({ mssg: `video with id ${id} deleted` });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/README.md');
});


// starting server logic
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(process.env.PORT || 3000, () => {
    console.log('listening on port 3000');
  });
};

start();
