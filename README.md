# Copilot Chat Analyzer

Простая библиотека для анализа экспортированных чатов GitHub Copilot.

## Особенности

- 📊 Подсчет количества запросов в диалоге
- 🔍 Определение статуса диалога (завершен, отменен, в процессе)
- 📝 Получение детальной информации о статусе
- 🚀 Простой и понятный API

## Установка

```bash
npm install
npm run build
```

## 🚀 Использование

### Основной API

```javascript
import CopilotChatAnalyzer from "./dist/index.mjs";

const chatData = JSON.parse(readFileSync("chat.json", "utf8"));
const analyzer = new CopilotChatAnalyzer();

// Подсчет запросов
const requestsCount = analyzer.getRequestsCount(chatData);
console.log(`Количество запросов: ${requestsCount}`);

// Определение статуса диалога
const status = analyzer.getDialogStatus(chatData);
console.log(`Статус: ${status}`); // 'completed', 'canceled', 'in_progress'

// Получение детальной информации о статусе
const details = analyzer.getDialogStatusDetails(chatData);
console.log({
  status: details.status,
  statusText: details.statusText,
  hasResult: details.hasResult,
  hasFollowups: details.hasFollowups,
  isCanceled: details.isCanceled,
  lastRequestId: details.lastRequestId,
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

Смотрите файлы в папке `examples/parse-export-chat-json/`:

- `index.js` - основной пример использования всех функций

## Запуск примера

```bash
cd examples/parse-export-chat-json
node index.js
```

## Структура экспорта чата

Библиотека работает с JSON файлами, экспортированными из GitHub Copilot Chat со следующей структурой:

```json
{
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
  requests?: any[];
  [key: string]: any;
}

type DialogStatusType = "completed" | "canceled" | "in_progress";

interface DialogStatusDetails {
  status: DialogStatusType;
  statusText: string;
  hasResult: boolean;
  hasFollowups: boolean;
  isCanceled: boolean;
  lastRequestId?: string;
}
```
