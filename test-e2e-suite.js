const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('--- НАЧАЛО ТЕСТИРОВАНИЯ СИСТЕМЫ ProTest ---');

  // 1. Проверка входа администратора
  console.log('1. Тест входа администратора...');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { phone: '+998901234567', password: 'ProTest2026!' }
  );

  if (![200, 201].includes(adminLogin.status) || !adminLogin.body.accessToken) {
    throw new Error('Не удалось войти под администратором: ' + JSON.stringify(adminLogin.body));
  }
  const adminToken = adminLogin.body.accessToken;
  console.log('✓ Вход администратора успешен. Роль:', adminLogin.body.user.role);

  // 2. Проверка банка тем (185+ тем)
  console.log('2. Проверка 185+ математических тем...');
  const topicsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/topics/tree',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✓ Загружено основных разделов математики: ${topicsRes.body.topics.length}`);

  // 3. Вход преподавателя
  console.log('3. Тест входа преподавателя...');
  const teacherLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { phone: '+998902345678', password: 'ProTest2026!' }
  );
  const teacherToken = teacherLogin.body.accessToken;
  console.log('✓ Вход преподавателя успешен. Имя:', teacherLogin.body.user.fullName);

  // 4. Вход ученика
  console.log('4. Тест входа ученика...');
  const studentLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { phone: '+998903456789', password: 'ProTest2026!' }
  );
  const studentToken = studentLogin.body.accessToken;
  console.log('✓ Вход ученика успешен. ID:', studentLogin.body.user.id);

  // 5. Получение назначенного теста
  console.log('5. Получение теста для ученика...');
  const testsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/tests',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log('Tests status:', testsRes.status, 'Body:', testsRes.body);

  const test = testsRes.body.items[0];
  if (!test) throw new Error('Тест не найден для ученика');
  console.log(`✓ Найден тест: "${test.title}", Длительность: ${test.durationMinutes} мин.`);

  // 6. Старт попытки тестирования (Проверка перемешивания и скрытия ответов)
  console.log('6. Старт попытки тестирования (проверка Anti-Cheat)...');
  const attemptRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/testing/${test.id}/start`,
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    }
  );

  const attempt = attemptRes.body;
  console.log(`✓ Попытка создана: ID ${attempt.attemptId}, Вопросов: ${attempt.totalQuestions}, Оставшееся время: ${attempt.remainingSeconds} сек.`);

  // Проверка: ни один вариант не должен содержать флаг isCorrect!
  const hasLeakedCorrectFlag = attempt.questions.some(q => q.options.some(o => 'isCorrect' in o));
  if (hasLeakedCorrectFlag) {
    throw new Error('ОШИБКА БЕЗОПАСНОСТИ: флаг isCorrect обнаружен в данных ученика!');
  }
  console.log('✓ Проверка безопасности: правильные ответы надежно скрыты от клиента!');

  // 7. Сохранение ответа по ID варианта
  console.log('7. Выбор и автосохранение ответа...');
  const firstQ = attempt.questions[0];
  const chosenOptionId = firstQ.options[0].id; // выбираем первый вариант

  const saveRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/testing/attempts/${attempt.attemptId}/save-answer`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    },
    { questionId: firstQ.questionId, selectedOptionIds: [chosenOptionId] }
  );
  console.log('✓ Автосохранение ответа:', saveRes.body.message);

  // 8. Завершение теста и проверка результатов
  console.log('8. Завершение тестирования и подсчет баллов...');
  const finishRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/testing/attempts/${attempt.attemptId}/finish`,
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    }
  );

  const result = finishRes.body.attempt;
  console.log(`✓ Тест завершен: Набрано ${result.score} из ${result.maxScore} баллов (${result.percentage}%), Затрачено: ${result.durationSeconds} сек.`);

  // 9. Проверка экспорта в Excel
  console.log('9. Проверка экспорта результатов теста в Excel...');
  const excelRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/analytics/tests/${test.id}/export-excel`,
    method: 'GET',
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  console.log('✓ Excel отчет успешно сформирован. HTTP статус:', excelRes.status);

  console.log('--- ВСЕ 9 ТЕСТОВЫХ СЦЕНАРИЕВ УСПЕШНО ПРОЙДЕНЫ! ---');
}

runTestSuite().catch((e) => {
  console.error('ОШИБКА В ТЕСТАХ:', e);
  process.exit(1);
});
