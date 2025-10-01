import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import copilotChatAnalyze, { getChatUsers, getRequestsCount } from '../../dist/index.mjs';

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Читаем файл с данными чата
const chatDataPath = join(__dirname, 'chat.json');
const chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));

console.log('=== Анализ чата Copilot ===\n');

// Основная функция для получения имени пользователя
const requesterUsername = copilotChatAnalyze(chatData);
console.log('👤 Имя пользователя (requesterUsername):', requesterUsername);

// Получение информации о всех пользователях
const users = getChatUsers(chatData);
console.log('👥 Пользователи чата:');
console.log('  • Запрашивающий:', users.requester);
console.log('  • Отвечающий:', users.responder);

// Подсчет количества запросов
const requestsCount = getRequestsCount(chatData);
console.log('📊 Количество запросов в чате:', requestsCount);

// Пример с пустым объектом
console.log('\n=== Тест с пустым объектом ===');
const emptyResult = copilotChatAnalyze({});
console.log('Результат с пустым объектом:', emptyResult);

// Пример с некорректными данными
console.log('\n=== Тест с некорректными данными ===');
const nullResult = copilotChatAnalyze(null);
console.log('Результат с null:', nullResult);
