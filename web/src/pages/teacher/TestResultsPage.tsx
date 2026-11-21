import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, API_BASE_URL } from '../../api/client';
import { KaTeXRenderer } from '../../components/KaTeXRenderer';
import {
  FileCheck2,
  Download,
  Users,
  Award,
  Clock,
  ArrowLeft,
  Percent,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const TestResultsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      api.get(`/analytics/tests/${testId}`).then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      }).finally(() => setLoading(false));
    }
  }, [testId]);

  const handleDownloadExcel = () => {
    const token = localStorage.getItem('protest_token');
    window.open(`${API_BASE_URL}/analytics/tests/${testId}/export-excel?token=${token}`, '_blank');
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Загрузка аналитики...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-sm text-slate-500">Данные не найдены</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/teacher/tests"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Назад к тестам
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Аналитика теста: {data.test.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Преподаватель: {data.test.teacherName} • Всего сдач: {data.test.totalAttempts}
          </p>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" /> Скачать отчет в Excel (.xlsx)
        </button>
      </div>

      {/* Students Results Table */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" /> Рейтинг результатов учеников
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Ученик</th>
                <th className="px-4 py-3">Телефон</th>
                <th className="px-4 py-3">Попытка</th>
                <th className="px-4 py-3">Баллы</th>
                <th className="px-4 py-3">Процент (%)</th>
                <th className="px-4 py-3">Время сдачи</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.studentsResults.map((s: any) => (
                <tr key={s.attemptId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {s.studentName}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                    {s.studentPhone}
                  </td>
                  <td className="px-4 py-3.5 text-xs">№{s.attemptNumber}</td>
                  <td className="px-4 py-3.5 font-bold text-purple-600">
                    {s.score} / {s.maxScore}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.percentage >= 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {s.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {Math.floor(s.durationSeconds / 60)}м {s.durationSeconds % 60}с
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 text-right">
                    {new Date(s.submittedAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}

              {data.studentsResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-xs text-slate-400">
                    Пока никто из учеников не сдал данный тест
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Question Difficulty & Error Analysis */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Percent className="w-5 h-5 text-indigo-600" /> Анализ сложности и ошибок по вопросам
        </h3>

        <div className="space-y-3">
          {data.questionStats.map((q: any, idx: number) => (
            <div
              key={q.questionId}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">Вопрос #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-semibold">
                    {q.topicName}
                  </span>
                  <span className="text-slate-400">({q.difficulty})</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {q.conditionText}
                </div>
                {q.conditionFormula && (
                  <div className="mt-1">
                    <KaTeXRenderer math={q.conditionFormula} />
                  </div>
                )}
              </div>

              {/* Progress and numbers */}
              <div className="shrink-0 flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Успешность: {q.successRate}%
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-600 font-semibold">✓ {q.correctCount}</span>
                    <span className="text-rose-500 font-semibold">✗ {q.incorrectCount}</span>
                  </div>
                </div>

                <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${q.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
