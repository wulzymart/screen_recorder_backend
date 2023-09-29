// Import the functions you need from the SDKs you need
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotEnv from 'dotenv';
import { decryptFile } from '../src/secure-file.js';
const secureFileName = './service_account.json.secure';
const jsonStr = await decryptFile(secureFileName);
dotEnv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
initializeApp({
  credential: cert(JSON.parse(jsonStr)),
  storageBucket: process.env.STORAGE_BUCKET,
});

export const bucket = getStorage().bucket();
