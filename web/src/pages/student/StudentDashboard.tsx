import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Award,
  History,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [history, setHistory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tests'),
      api.get('/analytics/student/history'),
    ]).then(([testsRes, histRes]) => {
      if (testsRes.data.success) setTests(testsRes.data.items);
      if (histRes.data.success) setHistory(histRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Кабинет Ученика
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Назначенные математические тестирования и история ваших попыток
        </p>
      </div>

      {/* Summary stats */}
      {history && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Доступно тестов</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {tests.length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Сдано тестов</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {history.stats?.totalCompleted || 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Средний результат</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {history.stats?.avgPercentage || 0}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Available Tests Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-600" /> Назначенные тестирования
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => {
            const hasAttempts = test.myAttempts && test.myAttempts.length > 0;
            const lastAttempt = hasAttempts ? test.myAttempts[test.myAttempts.length - 1] : null;
            const isCompleted = lastAttempt?.status === 'COMPLETED';
            const canTake = !hasAttempts || (test.allowRetake && test.myAttempts.length < test.maxAttempts);

            return (
              <div
                key={test.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.durationMinutes} минут
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Вопросов: {test._count?.testQuestions || 0}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {test.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {test.description || 'Математическое тестирование'}
                  </p>

                  <div className="text-xs text-slate-400">
                    Преподаватель: <strong className="text-slate-600 dark:text-slate-300">{test.teacher?.fullName}</strong>
                  </div>

                  {/* Previous Attempt Summary if any */}
                  {isCompleted && (
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                          Последний результат:
                        </span>
                        <div className="text-slate-500 mt-0.5">
                          Балл: {lastAttempt.score}/{lastAttempt.maxScore} ({lastAttempt.percentage}%)
                        </div>
                      </div>
                      <Link
                        to={`/student/results/${lastAttempt.id}`}
                        className="text-xs font-bold text-emerald-700 underline"
                      >
                        Посмотреть разбор
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {canTake ? (
                    <Link
                      to={`/student/test/${test.id}`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" /> {hasAttempts ? 'Сдать повторно' : 'Начать тестирование'}
                    </Link>
                  ) : (
                    <div className="w-full py-2 rounded-xl text-center text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800">
                      Лимит попыток исчерпан
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {tests.length === 0 && (
            <div className="col-span-2 p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
              Вам пока не назначено ни одного тестирования
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
