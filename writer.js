import path from 'node:path';
import {Transform} from 'node:stream';
import {dirname, mkdir, getFileName, writeFile, writeFileStream, deleteFile} from './util.js';

const __dirname = dirname();

const MASTER_DIR = path.join(__dirname, 'public');
const MEDIA_DIR = path.join(__dirname, 'public');
const SEGMENT_DIR = path.join(__dirname, 'public');

mkdir(MASTER_DIR);
mkdir(MEDIA_DIR);
mkdir(SEGMENT_DIR);

const MANIFEST_WINDOW_SIZE = 5;
const SEGMENT_WINDOW_SIZE = 60;

export class FileWriter extends Transform {
  #masterSaved;
  #manifestWindow;
  #segmentWindow;

  #writeMediaPlaylist(fileName, source) {
    let manifestWindow = this.#manifestWindow[fileName];
    if (!manifestWindow) {
      manifestWindow = [];
      this.#manifestWindow[fileName] = manifestWindow;
    }
    manifestWindow.push(source);
    if (manifestWindow.length <= MANIFEST_WINDOW_SIZE) {
      return Promise.resolve(`File is written in memory: ${fileName}`);
    }
    return writeFile(path.join(MEDIA_DIR, fileName), manifestWindow.shift());
  }

  #handlePlaylist({isMasterPlaylist, uri, source}) {
    if (isMasterPlaylist) {
      if (!this.#masterSaved) {
        this.#masterSaved = true;
        return writeFile(path.join(MASTER_DIR, getFileName(uri)), source);
      }
      return Promise.resolve('The master playlist has already written');
    }
    return this.#writeMediaPlaylist(getFileName(uri), source);
  }

  #handleSegment({uri, data}) {
    const fileName = getFileName(uri);
    const segmentWindow = this.#segmentWindow;
    if (segmentWindow.includes(fileName)) {
      return Promise.resolve(`The segment already exists: ${fileName}`);
    }
    segmentWindow.push(fileName);
    if (segmentWindow.length >= SEGMENT_WINDOW_SIZE) {
      deleteFile(path.join(SEGMENT_DIR, segmentWindow.shift()));
    }
    return writeFileStream(path.join(SEGMENT_DIR, fileName), data);
  }

  constructor() {
    super({objectMode: true});
    this.#masterSaved = false;
    this.#manifestWindow = {};
    this.#segmentWindow = [];
  }

  async _transform(data, _, cb) {
    const ret = data.type === 'playlist' ? await this.#handlePlaylist(data) : await this.#handleSegment(data);
    console.log(ret);
    cb(null, data);
  }
}
