# Copilot Chat Analyzer

Библиотека для анализа экспортированных чатов GitHub Copilot.

## Установка

```bash
npm install
npm run build
```

## Основные функции

### 1. Анализ пользователей

```javascript
import copilotChatAnalyze, { getChatUsers } from './dist/index.mjs';

const chatData = JSON.parse(readFileSync('chat.json', 'utf8'));

// Получить имя пользователя
const username = copilotChatAnalyze(chatData);

// Получить информацию о всех пользователях
const users = getChatUsers(chatData);
console.log(users.requester); // имя пользователя
console.log(users.responder); // "GitHub Copilot"
```

### 2. Подсчет запросов

```javascript
import { getRequestsCount } from './dist/index.mjs';

const requestsCount = getRequestsCount(chatData);
console.log(`Количество запросов: ${requestsCount}`);
```

### 3. Определение статуса диалога ⭐ NEW

```javascript
import { getDialogStatus, getDialogStatusDetails, DialogStatus } from './dist/index.mjs';

// Получить статус диалога
const status = getDialogStatus(chatData);
console.log(status); // 'completed', 'canceled', или 'in_progress'

// Получить детальную информацию
const details = getDialogStatusDetails(chatData);
console.log({
  status: details.status,
  statusText: details.statusText,
  hasResult: details.hasResult,
  hasFollowups: details.hasFollowups,
  isCanceled: details.isCanceled,
  lastRequestId: details.lastRequestId
});
```

## Статусы диалога

- **`DialogStatus.COMPLETED`** (`"completed"`) - Диалог завершен успешно
  - Есть поле `followups: []` (пустой массив)
  - Есть поле `result` с метаданными
  - `isCanceled: false`

- **`DialogStatus.CANCELED`** (`"canceled"`) - Диалог был отменен
  - `isCanceled: true`
  - Может быть с `followups: []` или без него

- **`DialogStatus.IN_PROGRESS`** (`"in_progress"`) - Диалог в процессе
  - Отсутствует поле `followups`
  - `isCanceled: false`

## Примеры использования

Смотрите файлы в папке `examples/chat-example/`:
- `index.js` - основной пример использования всех функций
- `test-status.js` - пример тестирования определения статуса

## Запуск примеров

```bash
# Основной пример
cd examples/chat-example
node index.js

# Тестирование статусов
node test-status.js
```

## Структура экспорта чата

Библиотека работает с JSON файлами, экспортированными из GitHub Copilot Chat со следующей структурой:

```json
{
  "requesterUsername": "username",
  "responderUsername": "GitHub Copilot",
  "requests": [
    {
      "requestId": "...",
      "message": {...},
      "response": [...],
      "followups": [], // только в завершенных диалогах
      "result": {...}, // только в завершенных диалогах
      "isCanceled": false
    }
  ]
}
```

## Типы

```typescript
interface CopilotChatData {
  requesterUsername?: string;
  responderUsername?: string;
  requests?: any[];
  [key: string]: any;
}

type DialogStatus = 'completed' | 'canceled' | 'in_progress';
```