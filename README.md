# 🎓 ProTest — Образовательная платформа для математического тестирования

**ProTest** — это полнофункциональная цифровая образовательная система для создания математических вопросов, проведения тестирований с защитой от списывания, серверным контролем таймера и автоматической аналитикой результатов.

---

## 🚀 Основные возможности (Core Features)

1. **Банк математических вопросов (185+ тем):**
   - Полная иерархия разделов математики: арифметика, теория чисел, алгебра, тригонометрия, математический анализ, планиметрия, стереометрия, комбинаторика, теория вероятностей, текстовые задачи.
   - Рендеринг любых математических формул высокой четкости через **KaTeX** (интегралы, дроби, корни, системы).
   - Поддержка изображений (JPEG, PNG) внутри условий, вариантов ответов и решений.

2. **Индивидуальное перемешивание и защита (Anti-Cheat Shuffling):**
   - Для каждой попытки каждого ученика генерируется уникальный порядок вариантов (A, B, C, D...).
   - Порядок фиксируется в снимке `shuffledSnapshot` на сервере: при перезагрузке страницы порядок не сбивается.
   - Правильные ответы проверяются строго по уникальному ID варианта на сервере. В клиентский код флаги правильности **не передаются**.

3. **Серверный таймер и автосохранение:**
   - Точный таймер обратного отсчета контролируется сервером.
   - Каждый выбранный ответ сохраняется мгновенно в фоне. При обрыве соединения в Android-приложении ответы кэшируются локально в Room DB.

4. **Аналитика и экспорт в Excel:**
   - Автоматический расчет баллов, процентов, правильных, неправильных и пропущенных заданий.
   - Анализ ошибок по каждому вопросу (success rate).
   - Экспорт ведомостей сдачи в файл **Microsoft Excel (.xlsx)**.

5. **Безопасная авторизация (+998 Узбекистан):**
   - Вход по паролю или по 6-значному SMS OTP коду (5 минут срок действия, защита от перебора до 5 попыток, 60 секунд задержка между отправками).

---

## 🛠 Технический стек

| Компонент | Технологии |
| :--- | :--- |
| **Backend** | NestJS, TypeScript, Prisma ORM, PostgreSQL / SQLite, Redis, JWT, ExcelJS |
| **Web Frontend** | React 18, Vite, TypeScript, Tailwind CSS (Purple theme), KaTeX, Lucide Icons |
| **Android App** | Kotlin, Jetpack Compose, Retrofit, Room Database, WorkManager |
| **Инфраструктура** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 👥 Роли пользователей и тестовые данные

| Роль | Телефон | Пароль | Доступ |
| :--- | :--- | :--- | :--- |
| **ADMIN (Администратор)** | `+998901234567` | `ProTest2026!` | Полный контроль, блокировка пользователей, журнал действий |
| **TEACHER (Преподаватель)** | `+998902345678` | `ProTest2026!` | Банк вопросов, конструктор тестов, группы, Excel-отчеты |
| **STUDENT (Ученик)** | `+998903456789` | `ProTest2026!` | Сдача тестов, таймер, просмотр разбора и решений |

---

## ⚡️ Быстрый запуск

### 1. Запуск Backend (API):
```powershell
cd backend
npm install
npm run db:push:sqlite
npm run db:seed:sqlite
npm run start:dev
```
*API доступно:* `http://localhost:4000/api`  
*Swagger API Docs:* `http://localhost:4000/api/docs`

### 2. Запуск Web-интерфейса:
```powershell
cd web
npm install
npm run dev
```
*Web-интерфейс:* `http://localhost:3000`

### 3. Запуск через Docker Compose (Все сервисы):
```powershell
cd docker
docker compose up -d --build
```

### 4. Android проект:
Откройте папку `android/` в **Android Studio** и запустите на эмуляторе или соберите APK:
```powershell
cd android
./gradlew assembleDebug
```

---

## 📂 Структура проекта

```
loyiha1/
├── backend/               # Серверная часть NestJS + Prisma
│   ├── prisma/            # Схемы PostgreSQL и SQLite, 185+ тем seed
│   ├── src/
│   │   ├── modules/       # auth, users, groups, topics, questions, tests, testing, analytics, audit, upload
│   │   └── common/        # guards (JWT, Roles), decorators, filters
│   └── Dockerfile
├── web/                   # Веб-приложение React + Vite + KaTeX
│   ├── src/
│   │   ├── components/    # Navbar, Sidebar, KaTeXRenderer, ImageUpload
│   │   ├── pages/         # auth, admin, teacher, student, exam room
│   │   └── context/       # AuthContext, ThemeContext
│   └── Dockerfile
├── android/               # Мобильное приложение Android (Kotlin + Jetpack Compose)
│   ├── app/src/main/
│   │   └── java/uz/protest/app/
│   │       ├── data/      # Retrofit API, Room Offline DB, Models
│   │       └── ui/        # Compose Theme (Purple), Screens (Login, Exam, Result)
├── docker/                # docker-compose.yml и конфигурация Nginx
├── docs/                  # Архитектура и руководство по установке
└── uploads/               # Хранилище изображений к математическим задачам
```
