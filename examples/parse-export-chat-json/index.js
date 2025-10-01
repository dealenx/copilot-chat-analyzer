import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import CopilotChatAnalyzer, { DialogStatus } from 'copilot-chat-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const chatDataPath = join(__dirname, 'chat.json');
const chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));

console.log('COPILOT CHAT ANALYZER');

const analyzer = new CopilotChatAnalyzer();

const requestCount = analyzer.getRequestsCount(chatData);
console.log('Requests count:', requestCount);

const status = analyzer.getDialogStatus(chatData);
console.log('Dialog status:', status);

const details = analyzer.getDialogStatusDetails(chatData);
console.log('Has result:', details.hasResult);
console.log('Has followups:', details.hasFollowups);
console.log('Is canceled:', details.isCanceled);

console.log('Available statuses:');
Object.entries(DialogStatus).forEach(([key, value]) => {
  console.log(' ', key + ':', value);
});
