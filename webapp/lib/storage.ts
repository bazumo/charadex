import fs from 'fs';
import path from 'path';
import { DataStore } from './types';

const DATA_FILE = path.join(process.cwd(), 'lib', 'data.json');

export function readData(): DataStore {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return {
      characters: {},
      words: {},
      sentences: {}
    };
  }
}

export function writeData(data: DataStore): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data file:', error);
  }
}
