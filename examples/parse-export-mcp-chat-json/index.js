import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import CopilotChatAnalyzer from 'copilot-chat-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const analyzer = new CopilotChatAnalyzer();

// Загружаем чат с ошибкой
const chatErrorData = JSON.parse(readFileSync(join(__dirname, 'chat_error_mcp.json'), 'utf8'));

console.log('🔍 MCP Инструменты в чате с ошибкой:');
const toolNames = analyzer.getMcpToolNames(chatErrorData);
console.log(toolNames);

console.log('\n📞 Вызовы update_entry_fields:');
const calls = analyzer.getMcpToolCalls(chatErrorData, 'update_entry_fields');
calls.forEach((call, i) => {
  console.log(`${i + 1}. ${call.isError ? '❌ Ошибка' : '✅ Успех'}`);
});

// Загружаем успешный чат
console.log('\n\n🎯 Успешный чат:');
const chatSuccessData = JSON.parse(readFileSync(join(__dirname, 'chat_succes_mcp.json'), 'utf8'));
const successCalls = analyzer.getMcpToolCalls(chatSuccessData, 'update_entry_fields');
console.log(`Найдено ${successCalls.length} вызовов update_entry_fields`);
successCalls.forEach((call, i) => {
  console.log(`${i + 1}. ${call.isError ? '❌ Ошибка' : '✅ Успех'}`);
});
