import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import copilotChatAnalyze, { 
  getChatUsers, 
  getRequestsCount, 
  getDialogStatus, 
  getDialogStatusDetails, 
  DialogStatus 
} from '../../dist/index.mjs';

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

// Определение статуса диалога
const dialogStatus = getDialogStatus(chatData);
console.log('\n🔍 Статус диалога:', dialogStatus);

// Детальная информация о статусе
const statusDetails = getDialogStatusDetails(chatData);
console.log('📋 Детальная информация о статусе:');
console.log('  • Статус:', statusDetails.status);
console.log('  • Описание:', statusDetails.statusText);
console.log('  • Имеет результат:', statusDetails.hasResult);
console.log('  • Имеет followups:', statusDetails.hasFollowups);
console.log('  • Отменен:', statusDetails.isCanceled);
console.log('  • ID последнего запроса:', statusDetails.lastRequestId);

// Показываем все возможные статусы
console.log('\n📝 Возможные статусы диалога:');
console.log('  • COMPLETED:', DialogStatus.COMPLETED, '- диалог завершен успешно');
console.log('  • CANCELED:', DialogStatus.CANCELED, '- диалог был отменен');
console.log('  • IN_PROGRESS:', DialogStatus.IN_PROGRESS, '- диалог в процессе выполнения');

