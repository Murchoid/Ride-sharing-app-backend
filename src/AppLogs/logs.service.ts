import * as fs from 'fs';
import * as path from 'path';

export class LogsService {
  logToFile(message: string, ip: string) {
    const logMessage = `[${new Date().toISOString()}] [${ip}] ${message}\n`;
    const logFilePath = path.join(__dirname, 'app.log');
    fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf8' });
  }
}
