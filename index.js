import http from 'node:http';
import path from 'node:path';
import {FileWriter} from './writer.js';
import {alignPDT} from './filter.js';
import {dirname, isValidUrl, mkdir, readFile, getFileName} from './util.js';

import hlx from 'hlx-lib';

const ROOT_DIR = path.join(dirname(), 'public');
mkdir(ROOT_DIR);

const srcUrl = process.argv[2];

if (!isValidUrl(srcUrl)) {
  throw new Error(`Invalid URL: ${srcUrl}`);
}

const port = process.env.PORT || 8080;

// process.setMaxListeners(0);

const mode = process.env.PDT_ALIGNMENT || 'HORIZONTALLY_ALIGNED';

const MAX_RETRY = 500;

console.log(`Start proxying: ${srcUrl}`);

hlx.src(srcUrl, {noUriConversion: true})
  .pipe(new FileWriter())
  .pipe(hlx.dest())
  .on('error', err => {
    console.error(err.stack);
  });

function read(fileName, type, res, timeout) {
  let file = readFile(path.join(ROOT_DIR, fileName));
  if (file) {
    res.writeHead(200, {'Content-Type': type});
    if (mode === 'VERTICALLY_ALIGNED' && type === 'application/x-mpegURL') {
      file = alignPDT(file.toString('utf8'));
    }
    return res.end(file);
  }
  if (!timeout) {
    console.error(`Unable to read the file: "${fileName}"`);
    res.writeHead(404);
    return res.end();
  }
  const retry = timeout * 2;
  setTimeout(() => read(fileName, type, res, retry > MAX_RETRY ? 0 : retry), timeout);
}

http.createServer((req, res) => {
  console.log(`Incoming message: ${req.url}`);
  const fileName = getFileName(req.url);
  let type = '';
  if (fileName.includes('.m3u8')) {
    type = 'application/x-mpegURL';
  } else if (fileName.includes('.ts')) {
    type = 'video/MP2T';
  } else if (fileName.includes('.aac')) {
    type = 'audio/aac';
  } else {
    console.error(`Unknown file name: "${fileName}". Ignoring...`);
    res.writeHead(404);
    return res.end();
  }
  read(fileName, type, res, 10);
}).listen(port);

console.log(`HTTP server listening on port ${port}`);
