# Copilot Chat Analyzer

Библиотека для анализа экспортированных чатов GitHub Copilot с поддержкой SOLID архитектуры.

## 🆕 Новая SOLID Архитектура

Начиная с версии 0.0.1, библиотека полностью переписана с использованием принципов SOLID:

- **S**ingle Responsibility: каждый класс отвечает за одну функциональность
- **O**pen/Closed: легко расширяется новыми анализаторами без изменения существующего кода
- **L**iskov Substitution: все анализаторы реализуют соответствующие интерфейсы
- **I**nterface Segregation: интерфейсы разделены по назначению
- **D**ependency Inversion: зависимости инжектируются через интерфейсы

## Установка

```bash
npm install
npm run build
```

## 🚀 Новый API (Рекомендуется)

### Использование класса CopilotChatAnalyzer

```javascript
import CopilotChatAnalyzer from "./dist/index.mjs";

const chatData = JSON.parse(readFileSync("chat.json", "utf8"));
const analyzer = new CopilotChatAnalyzer();

// Получить имя пользователя
const username = analyzer.analyze(chatData);

// Получить информацию о всех пользователях
const users = analyzer.getChatUsers(chatData);
console.log(users.requester); // имя пользователя
console.log(users.responder); // "GitHub Copilot"

// Подсчет запросов
const requestsCount = analyzer.getRequestsCount(chatData);

// Определение статуса диалога
const status = analyzer.getDialogStatus(chatData);
const statusDetails = analyzer.getDialogStatusDetails(chatData);
```

### Dependency Injection (Продвинутое использование)

Вы можете внедрить собственные реализации анализаторов:

```javascript
import CopilotChatAnalyzer from "./dist/index.mjs";

// Создайте кастомные анализаторы, реализующие соответствующие интерфейсы
class CustomUserExtractor {
  // Ваша кастомная логика
}

class CustomStatusAnalyzer {
  // Ваша кастомная логика
}

// Внедрите зависимости
const analyzer = new CopilotChatAnalyzer(
  undefined, // validator (по умолчанию)
  new CustomUserExtractor(validator),
  undefined, // requestAnalyzer (по умолчанию)
  new CustomStatusAnalyzer(validator, requestAnalyzer)
);
```

## 🔄 Старый API (Deprecated, но все еще работает)

Для обратной совместимости старые функции все еще доступны:

### 1. Анализ пользователей

```javascript
import copilotChatAnalyze, { getChatUsers } from "./dist/index.mjs";

const chatData = JSON.parse(readFileSync("chat.json", "utf8"));

// Получить имя пользователя
const username = copilotChatAnalyze(chatData);

// Получить информацию о всех пользователях
const users = getChatUsers(chatData);
console.log(users.requester); // имя пользователя
console.log(users.responder); // "GitHub Copilot"
```

### 2. Подсчет запросов

```javascript
import { getRequestsCount } from "./dist/index.mjs";

const requestsCount = getRequestsCount(chatData);
console.log(`Количество запросов: ${requestsCount}`);
```

### 3. Определение статуса диалога ⭐ NEW

```javascript
import {
  getDialogStatus,
  getDialogStatusDetails,
  DialogStatus,
} from "./dist/index.mjs";

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

type DialogStatus = "completed" | "canceled" | "in_progress";
```
