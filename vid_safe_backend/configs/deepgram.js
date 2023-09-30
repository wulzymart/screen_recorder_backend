// Example filename: index.js

import pkg from '@deepgram/sdk';
import dotEnv from 'dotenv';
const { Deepgram } = pkg;
dotEnv.config();

// Your Deepgram API Key
const deepgramApiKey = process.env.DEEPGRAM_APIKEY;

// Location of the file you want to transcribe. Should include filename and extension.
// Example of a local file: ../../Audio/life-moves-pretty-fast.wav
// Example of a remote file: https://static.deepgram.com/examples/interview_speech-analytics.wav

// Mimetype for the file you want to transcribe
// Only necessary if transcribing a local file
// Example: audio/wav

// Initialize the Deepgram SDK
const deepgram = new Deepgram(deepgramApiKey);
const transciptFile = async (audio, mimetype) => {
  const source = {
    buffer: audio,
    mimetype: mimetype,
  };
  // Send the audio to Deepgram and get the response
  try {
    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      model: 'nova',
    });
    return response.results;
  } catch (error) {
    console.log(error);
  }
  //   deepgram.transcription
  //     .preRecorded(source, {
  //       smart_format: true,
  //       model: 'nova',
  //     })
  //     .then((response) => {
  //       // Write the response to the console
  //       return response.results;

  //       // Write only the transcript to the console
  //       //console.dir(response.results.channels[0].alternatives[0].transcript, { depth: null });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
};
export default transciptFile;
