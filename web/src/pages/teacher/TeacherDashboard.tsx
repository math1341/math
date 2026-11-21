import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  FileCheck2,
  HelpCircle,
  Users2,
  FolderTree,
  PlusCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/teacher').then((res) => {
      if (res.data.success) setStats(res.data.stats);
    });
    api.get('/tests', { params: { limit: 5 } }).then((res) => {
      if (res.data.success) setRecentTests(res.data.items);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Кабинет Преподавателя
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Управление математическими вопросами, тестами и успеваемостью
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/teacher/questions"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Создать вопрос
          </Link>
          <Link
            to="/teacher/tests"
            className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1.5 transition-all"
          >
            <FileCheck2 className="w-4 h-4" /> Новый тест
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Мои тесты</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.testsCount}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Вопросов в банке</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.questionsCount}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Мои группы</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.groupsCount}
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Средний балл сдачи</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {stats.averagePercentage}%
            </h3>
          </div>
        </div>
      )}

      {/* Quick Access Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/teacher/questions"
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-purple-600 text-white w-fit mb-4 shadow-md shadow-purple-600/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
            Банк вопросов
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Создание вопросов с KaTeX-формулами, графиками, вариантами ответов и пояснениями.
          </p>
        </Link>

        <Link
          to="/teacher/topics"
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-indigo-600 text-white w-fit mb-4 shadow-md shadow-indigo-600/30">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
            Математические темы
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Иерархический каталог из 185+ тем: арифметика, алгебра, тригонометрия, стереометрия.
          </p>
        </Link>

        <Link
          to="/teacher/groups"
          className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-fuchsia-600 text-white w-fit mb-4 shadow-md shadow-fuchsia-600/30">
            <Users2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-fuchsia-600 transition-colors">
            Группы учеников
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Формирование классов, привязка учеников и отслеживание успеваемости.
          </p>
        </Link>
      </div>

      {/* Recent Tests Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Последние созданные тесты
          </h3>
          <Link
            to="/teacher/tests"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Все тесты <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Название</th>
                <th className="px-4 py-3">Время</th>
                <th className="px-4 py-3">Вопросов</th>
                <th className="px-4 py-3">Попыток сдачи</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                    {t.title}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {t.durationMinutes} мин
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {t._count?.testQuestions || 0}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-purple-600">
                    {t._count?.attempts || 0}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/teacher/tests/${t.id}/results`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 transition-colors"
                    >
                      Результаты
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
