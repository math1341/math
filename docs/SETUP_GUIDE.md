# Инструкция по запуску и сборке ProTest

## 1. Локальный запуск без Docker (Быстрый старт)

### Требования:
- Node.js v18+ или v20+

### Шаг 1: Запуск Backend (NestJS API)
```powershell
cd backend
npm install
npm run prisma:generate:sqlite
npm run db:push:sqlite
npm run db:seed:sqlite
npm run start:dev
```
*API станет доступно по адресу:* `http://localhost:4000/api`
*Swagger документация:* `http://localhost:4000/api/docs`

### Шаг 2: Запуск Web-приложения (React + Vite)
```powershell
cd web
npm install
npm run dev
```
*Интерфейс откроется по адресу:* `http://localhost:3000`

---

## 2. Запуск в продакшене через Docker Compose

```powershell
cd docker
docker compose up -d --build
```
Это запустит:
1. `postgres:16-alpine` (Порт 5432)
2. `redis:7-alpine` (Порт 6379)
3. `protest_backend` (Порт 4000)
4. `protest_web` (Порт 3000)
5. `nginx` (Порт 80)

---

## 3. Сборка Android-приложения (APK)

### Вариант А: Через Android Studio
1. Запустите Android Studio.
2. Выберите **Open** и укажите папку `loyiha1/android`.
3. Дождитесь синхронизации Gradle.
4. Выберите в верхнем меню: **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
5. Готовый файл `.apk` появится в `android/app/build/outputs/apk/debug/app-debug.apk`.

### Вариант Б: Через терминал (при наличии установленного Android SDK и Java 17)
```powershell
cd android
./gradlew assembleDebug
```
Готовый APK: `android/app/build/outputs/apk/debug/app-debug.apk`.
