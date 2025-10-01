import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import CopilotChatAnalyzer, {
  copilotChatAnalyze,
  getChatUsers,
  getRequestsCount,
  getDialogStatus,
  getDialogStatusDetails,
  DialogStatus
} from 'copilot-chat-analyzer';

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Читаем файл с данными чата
const chatDataPath = join(__dirname, 'chat.json');
const chatData = JSON.parse(readFileSync(chatDataPath, 'utf8'));

console.log('🚀 COPILOT CHAT ANALYZER - Демонстрация SOLID архитектуры\n');

// =====================================================================
// 🆕 НОВЫЙ ПОДХОД: Объектно-ориентированная SOLID архитектура
// =====================================================================

console.log('🏗️ НОВАЯ АРХИТЕКТУРА (Рекомендуется)');
console.log('='.repeat(50));

// Создаем единый анализатор
const analyzer = new CopilotChatAnalyzer();

console.log('✨ Принципы SOLID в действии:');
console.log('  • Single Responsibility: каждый компонент имеет одну обязанность');
console.log('  • Open/Closed: легко расширяется без изменения существующего кода');
console.log('  • Liskov Substitution: компоненты взаимозаменяемы через интерфейсы');
console.log('  • Interface Segregation: интерфейсы разделены по функциональности');
console.log('  • Dependency Inversion: зависимости внедряются через абстракции\n');

// Единый интерфейс для всех операций
console.log('📊 Анализ чата через единый класс-анализатор:');
console.log('-'.repeat(40));

const username = analyzer.analyze(chatData);
console.log(`👤 Имя пользователя: ${username || 'не найдено'}`);

const users = analyzer.getChatUsers(chatData);
console.log(`👥 Участники диалога:`);
console.log(`   └── Запрашивающий: ${users.requester || 'неизвестен'}`);
console.log(`   └── Отвечающий: ${users.responder || 'неизвестен'}`);

const requestCount = analyzer.getRequestsCount(chatData);
console.log(`� Количество запросов: ${requestCount}`);

const status = analyzer.getDialogStatus(chatData);
const statusIcon = {
  'completed': '✅',
  'canceled': '❌',
  'in_progress': '⏳'
}[status] || '❓';

console.log(`${statusIcon} Статус диалога: ${status.toUpperCase()}`);

const details = analyzer.getDialogStatusDetails(chatData);
console.log(`📋 Детализация статуса:`);
console.log(`   ├── Описание: ${details.statusText}`);
console.log(`   ├── Имеет результат: ${details.hasResult ? '✅' : '❌'}`);
console.log(`   ├── Имеет дополнения: ${details.hasFollowups ? '✅' : '❌'}`);
console.log(`   ├── Отменен: ${details.isCanceled ? '✅' : '❌'}`);
console.log(`   └── ID последнего запроса: ${details.lastRequestId || 'отсутствует'}`);

console.log('\n🎯 Преимущества нового подхода:');
console.log('  ✅ Единая точка входа - один класс для всех операций');
console.log('  ✅ Типобезопасность TypeScript');
console.log('  ✅ Легкое тестирование через dependency injection');
console.log('  ✅ Простое расширение функциональности');
console.log('  ✅ Чистая архитектура по принципам SOLID');

// =====================================================================
// 🔄 СТАРЫЙ ПОДХОД: Функциональное API (сохранено для совместимости)
// =====================================================================

console.log('\n' + '='.repeat(60));
console.log('⚠️ СТАРОЕ API (Deprecated, но работает для совместимости)');
console.log('='.repeat(60));

console.log('📝 Использование отдельных функций:');
console.log('-'.repeat(35));

// Демонстрируем, что старое API все еще работает
const oldUsername = copilotChatAnalyze(chatData);
const oldUsers = getChatUsers(chatData);
const oldRequestCount = getRequestsCount(chatData);
const oldStatus = getDialogStatus(chatData);
const oldDetails = getDialogStatusDetails(chatData);

console.log(`� copilotChatAnalyze(): ${oldUsername}`);
console.log(`👥 getChatUsers(): ${oldUsers.requester} → ${oldUsers.responder}`);
console.log(`📝 getRequestsCount(): ${oldRequestCount}`);
console.log(`🔍 getDialogStatus(): ${oldStatus}`);
console.log(`📋 getDialogStatusDetails(): ${oldDetails.statusText}`);

console.log('\n❗ Проблемы старого подхода:');
console.log('  ❌ Много отдельных функций вместо единого интерфейса');
console.log('  ❌ Дублирование логики создания анализаторов');
console.log('  ❌ Сложность расширения функциональности');
console.log('  ❌ Нарушение принципов SOLID');

// =====================================================================
// 📚 СПРАВОЧНАЯ ИНФОРМАЦИЯ
// =====================================================================

console.log('\n' + '='.repeat(60));
console.log('📚 СПРАВОЧНАЯ ИНФОРМАЦИЯ');
console.log('='.repeat(60));

console.log('� Возможные статусы диалога:');
Object.entries(DialogStatus).forEach(([key, value], index, array) => {
  const isLast = index === array.length - 1;
  const prefix = isLast ? '└──' : '├──';
  const statusEmoji = {
    'COMPLETED': '✅',
    'CANCELED': '❌',
    'IN_PROGRESS': '⏳'
  }[key] || '❓';

  console.log(`   ${prefix} ${statusEmoji} ${key}: "${value}"`);
});

console.log('\n💡 РЕКОМЕНДАЦИЯ:');
console.log('   Используйте новый класс CopilotChatAnalyzer для:');
console.log('   • Лучшей архитектуры и читаемости кода');
console.log('   • Простого тестирования и расширения');
console.log('   • Соблюдения принципов SOLID');
console.log('   • Типобезопасности в TypeScript');

console.log('\n🔗 Пример использования в проекте:');
console.log('```javascript');
console.log('import CopilotChatAnalyzer from "copilot-chat-analyzer";');
console.log('');
console.log('const analyzer = new CopilotChatAnalyzer();');
console.log('const result = analyzer.analyze(chatData);');
console.log('```');

console.log('\n✨ Готово! Архитектура успешно обновлена по принципам SOLID.');

// =====================================================================
// 🧪 ДЕМОНСТРАЦИЯ РАСШИРЯЕМОСТИ
// =====================================================================

console.log('\n' + '='.repeat(60));
console.log('🧪 ДЕМОНСТРАЦИЯ РАСШИРЯЕМОСТИ (Dependency Injection)');
console.log('='.repeat(60));

// Пример как можно расширить функциональность через DI
console.log('� Пример создания кастомного анализатора:');
console.log('```javascript');
console.log('// Можно внедрить свои реализации компонентов');
console.log('const customAnalyzer = new CopilotChatAnalyzer(');
console.log('  customValidator,     // ваш валидатор');
console.log('  customUserExtractor, // ваш экстрактор пользователей');
console.log('  customRequestAnalyzer, // ваш анализатор запросов');
console.log('  customStatusAnalyzer   // ваш анализатор статусов');
console.log(');');
console.log('```');

console.log('\n🎊 Рефакторинг завершен! Код теперь следует принципам SOLID.');

