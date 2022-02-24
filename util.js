import {URL, fileURLToPath} from 'node:url';
import * as fs from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function dirname() {
  return __dirname;
}

export function isValidUrl(url) {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
}

export function getFileName(url) {
  url = url.slice(url.lastIndexOf('/') + 1);
  let idx = url.indexOf('?');
  if (idx >= 0) {
    url = url.slice(0, idx);
  }
  idx = url.indexOf('#');
  if (idx >= 0) {
    url = url.slice(0, idx);
  }
  return url;
}

export function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

export function readFile(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

export function readFileStream(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  }
  return null;
}

export function writeFile(filePath, data, opt = {}) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, opt, err => {
      if (err) {
        return reject(err);
      }
      resolve(`File is written: ${filePath}`);
    });
  });
}

export function writeFileStream(filePath, readStream, opt = {}) {
  const file = fs.createWriteStream(filePath, opt);
  return new Promise((resolve, reject) => {
    readStream.pipe(file)
      .on('finish', () => {
        resolve(`File is written: ${filePath}`);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

export function deleteFile(filePath) {
  fs.unlinkSync(filePath);
  console.log(`File is deleted : ${filePath}`);
}
