# CI/CD Setup

Этот проект использует GitHub Actions для автоматизации тестирования и публикации.

## Workflows

### 1. **Test** (`.github/workflows/test.yml`)

- Запускается при push и PR в main
- Тестирует на Node.js 18.x, 20.x, 22.x (Ubuntu)
- Дополнительно тестирует на Windows
- Запускает тесты с покрытием кода
- Проверяет сборку и примеры

### 2. **Code Quality** (`.github/workflows/quality.yml`)

- Запускается при push и PR в main
- Проверка типов TypeScript
- Проверка сборки
- Валидация экспортируемых файлов

### 3. **NPM Publish** (`.github/workflows/npm-publish.yml`)

- Запускается при создании релиза
- Автоматически публикует в npm
- Использует provenance для безопасности

## Настройка для публикации

1. **Создайте NPM токен:**

   ```bash
   npm login
   npm token create --type=automation
   ```

2. **Добавьте секрет в GitHub:**

   - Перейдите в Settings > Secrets and variables > Actions
   - Добавьте `NPM_TOKEN` с вашим токеном

3. **Создайте релиз:**
   ```bash
   # Обновите версию в package.json
   git tag v0.0.2
   git push origin v0.0.2
   # Или создайте релиз через GitHub UI
   ```

## Локальное тестирование

```bash
# Все тесты (как в CI)
task test
task test:coverage

# Проверка сборки
pnpm build

# Проверка примера
task example
```

## Статусы

- [![Test](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/test.yml/badge.svg)](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/test.yml)
- [![Code Quality](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/quality.yml/badge.svg)](https://github.com/dealenx/copilot-chat-analyzer/actions/workflows/quality.yml)
