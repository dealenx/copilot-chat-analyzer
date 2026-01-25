# Copilot Chat Analyzer

[![Test](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/test.yml/badge.svg)](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/test.yml)
[![Code Quality](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/quality.yml/badge.svg)](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/quality.yml)
[![npm version](https://badge.fury.io/js/copilot-chat-analyzer.svg)](https://badge.fury.io/js/copilot-chat-analyzer)

TypeScript библиотека для **анализа** экспортированных чатов GitHub Copilot с поддержкой мониторинга MCP инструментов.

> **⚠️ Важно**: Эта библиотека предназначена только для **анализа** уже экспортированных JSON-файлов чата. Она НЕ экспортирует данные чата из VS Code. Для экспорта используйте команду VS Code `workbench.action.chat.export`.

## 🤖 AI Assistant Quick Reference

```typescript
// Basic import and usage
import CopilotChatAnalyzer, { DialogStatus } from "copilot-chat-analyzer";

const analyzer = new CopilotChatAnalyzer();
const chatData = JSON.parse(fs.readFileSync("chat.json", "utf8"));

// Core methods:
analyzer.getDialogStatus(chatData); // Returns: 'pending' | 'in_progress' | 'completed' | 'canceled' | 'failed'
analyzer.getRequestsCount(chatData); // Returns: number
analyzer.getDialogStatusDetails(chatData); // Returns: { status, statusText, hasResult, hasFollowups, isCanceled, isFailed, lastRequestId, errorCode?, errorMessage? }
analyzer.getSessionId(chatData); // Returns: string | null - Extract session ID from chat
analyzer.getSessionInfo(chatData); // Returns: { sessionId, agentId?, modelId? } | null
analyzer.getMcpToolMonitoring(chatData); // Returns: MCP tool usage statistics

// Dialog statuses:
// - 'pending': Empty requests array, chat not started
// - 'in_progress': Has requests but not finished
// - 'completed': Has followups:[] and not canceled
// - 'canceled': isCanceled:true in last request
// - 'failed': Has result.errorDetails in last request (API error)
```

## Особенности

- 📊 **Анализ статусов диалога** - автоматическое определение состояния чата
- 🔢 **Подсчет запросов** - точный подсчет количества запросов в диалоге
- 🔍 **Детальная диагностика** - получение развернутой информации о статусе
- �️ **MCP мониторинг** - отслеживание использования Model Context Protocol инструментов
- 📈 **Статистика успешности** - анализ успешности выполнения MCP вызовов
- 🚀 **Простой API** - интуитивно понятный интерфейс
- 💪 **TypeScript** - полная поддержка типов

## Установка

```bash
npm install copilot-chat-analyzer
```

Или с yarn:

```bash
yarn add copilot-chat-analyzer
```

Или с pnpm:

```bash
pnpm add copilot-chat-analyzer
```

## Как экспортировать чат

Для получения данных чата из GitHub Copilot Chat:

1. **Откройте VS Code** с установленным GitHub Copilot Chat
2. **Откройте панель чата** (обычно справа или через `Ctrl+Shift+I`)
3. **Ведите диалог** с Copilot
4. **Нажмите `F1`** для открытия Command Palette
5. **Введите и выберите** `"Export Chat"`
6. **Сохраните файл** в формате JSON

## 🚀 Использование

### Основной API

```javascript
import CopilotChatAnalyzer from "copilot-chat-analyzer";
import { readFileSync } from "fs";

const chatData = JSON.parse(readFileSync("chat.json", "utf8"));
const analyzer = new CopilotChatAnalyzer();

// Подсчет запросов
const requestsCount = analyzer.getRequestsCount(chatData);
console.log(`Количество запросов: ${requestsCount}`);

// Определение статуса диалога
const status = analyzer.getDialogStatus(chatData);
console.log(`Статус: ${status}`); // 'pending', 'completed', 'canceled', 'in_progress'

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

### Мониторинг MCP инструментов

```javascript
// Получить список всех MCP инструментов в чате
const toolNames = analyzer.getMcpToolNames(chatData);
console.log("Инструменты:", toolNames);

// Получить все вызовы конкретного инструмента
const calls = analyzer.getMcpToolCalls(chatData, "update_entry_fields");
calls.forEach((call, i) => {
  console.log(
    `${i + 1}. ${call.isError ? "❌ Ошибка" : "✅ Успех"}: ${JSON.stringify(
      call.input
    )}`
  );
});

// Получить только успешные или только ошибочные вызовы
const successCalls = analyzer.getMcpToolSuccessfulCalls(
  chatData,
  "update_entry_fields"
);
const errorCalls = analyzer.getMcpToolErrorCalls(
  chatData,
  "update_entry_fields"
);
```

## Статусы диалога

Библиотека автоматически определяет текущий статус чата при экспорте:

- **`DialogStatus.PENDING`** (`"pending"`) - Диалог еще не начат

  - Массив `requests` пустой или отсутствует
  - Еще не было сделано ни одного запроса к Copilot

- **`DialogStatus.COMPLETED`** (`"completed"`) - Диалог завершен успешно

  - Есть поле `followups: []` (пустой массив)
  - Есть поле `result` с метаданными
  - `isCanceled: false`

- **`DialogStatus.CANCELED`** (`"canceled"`) - Диалог был отменен

  - `isCanceled: true`
  - Может быть с `followups: []` или без него

- **`DialogStatus.FAILED`** (`"failed"`) - Диалог завершился с ошибкой

  - Есть поле `result.errorDetails` в последнем запросе
  - Содержит `errorCode` и `errorMessage` в деталях статуса
  - Обычно указывает на ошибку API или аутентификации

- **`DialogStatus.IN_PROGRESS`** (`"in_progress"`) - Диалог в процессе
  - Отсутствует поле `followups`
  - `isCanceled: false`
  - **Такой статус получается при экспорте во время диалога**

## Извлечение информации о сессии

```javascript
// Получить ID сессии (уникален для каждого диалога)
const sessionId = analyzer.getSessionId(chatData);
console.log(`Session ID: ${sessionId}`);
// Пример: "ff72bca6-0dec-4953-b130-a103a97e5380"

// Получить полную информацию о сессии
const sessionInfo = analyzer.getSessionInfo(chatData);
console.log(sessionInfo);
// { sessionId: "ff72bca6-...", agentId: "github.copilot.editsAgent", modelId: "copilot/gemini-2.5-pro" }
```

## Примеры использования

Смотрите файлы в папке `examples/parse-export-chat-json/`:

- `index.js` - основной пример использования всех функций

## Запуск примера

```bash
cd examples/parse-export-chat-json
node index.js
```

## Тестирование

Для запуска тестов используйте:

```bash
# Запуск всех тестов
pnpm test

# Запуск тестов в watch режиме
pnpm test:watch

# Запуск тестов с анализом покрытия кода
pnpm test:coverage
```

Проект использует **Jest** для тестирования с поддержкой TypeScript через **ts-jest**.

## Структура экспорта чата

Библиотека работает с JSON файлами, экспортированными из GitHub Copilot Chat через команду **`F1 > Export Chat`**.

### Формат файла

Экспортированный файл содержит следующую структуру:

```json
{
  "requesterUsername": "your-username",
  "responderUsername": "GitHub Copilot",
  "requests": [
    {
      "requestId": "request_abc123...",
      "message": {
        "text": "Ваш вопрос к Copilot"
      },
      "response": [...], // массив частей ответа
      "followups": [], // только в завершенных диалогах (пустой массив)
      "result": {...}, // метаданные результата
      "isCanceled": false // true если диалог был отменен
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

type DialogStatusType = "pending" | "completed" | "canceled" | "in_progress";

interface DialogStatusDetails {
  status: DialogStatusType;
  statusText: string;
  hasResult: boolean;
  hasFollowups: boolean;
  isCanceled: boolean;
  lastRequestId?: string;
}
```
