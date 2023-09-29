// Import the functions you need from the SDKs you need
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotEnv from 'dotenv';
import data from '../service_account.json';

dotEnv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
initializeApp({
  credential: cert(data),
  storageBucket: process.env.STORAGE_BUCKET,
});

export const bucket = getStorage().bucket();
