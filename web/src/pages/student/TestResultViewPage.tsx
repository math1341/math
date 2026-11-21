import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { KaTeXRenderer } from '../../components/KaTeXRenderer';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const TestResultViewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      api.get(`/testing/attempts/${attemptId}/results`)
        .then((res) => {
          if (res.data.success) {
            setData(res.data);
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Загрузка результатов...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-sm text-slate-500">Результат не найден</div>;
  }

  const { attempt, questionsReview } = data;
  const isPassed = attempt.percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Link
        to="/student"
        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> В мой кабинет
      </Link>

      {/* Result Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
          isPassed
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900'
            : 'border-rose-200 bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-white dark:to-slate-900'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-300">
              Попытка №{attempt.attemptNumber}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Преподаватель: {attempt.teacherName}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {attempt.testTitle}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> {Math.floor(attempt.durationSeconds / 60)} мин {attempt.durationSeconds % 60} сек
            </span>
            <span>{new Date(attempt.submittedAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>

        {/* Score Ring / Block */}
        <div className="flex flex-col items-center sm:items-end">
          <div
            className={`text-4xl sm:text-5xl font-black tracking-tight ${
              isPassed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {attempt.percentage}%
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Набрано: {attempt.score} из {attempt.maxScore} баллов
          </p>
        </div>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Правильно</p>
          <div className="text-xl font-black text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {attempt.correctAnswers}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Неправильно</p>
          <div className="text-xl font-black text-rose-600 mt-0.5 flex items-center justify-center gap-1">
            <XCircle className="w-4 h-4" /> {attempt.incorrectAnswers}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Пропущено</p>
          <div className="text-xl font-black text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <HelpCircle className="w-4 h-4" /> {attempt.skippedAnswers}
          </div>
        </div>
      </div>

      {/* Question by Question Review */}
      {questionsReview && questionsReview.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Подробный разбор заданий
          </h3>

          <div className="space-y-4">
            {questionsReview.map((q: any) => (
              <div
                key={q.questionId}
                className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm space-y-3 ${
                  q.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      Вопрос #{q.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        q.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {q.isCorrect ? 'Верно' : 'Неверно'} ({q.pointsAwarded}/{q.points} б.)
                    </span>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {q.conditionText}
                </div>

                {q.conditionFormula && (
                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 text-center">
                    <KaTeXRenderer math={q.conditionFormula} displayMode={true} />
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options?.map((opt: any) => {
                    let borderClass = 'border-slate-200 dark:border-slate-800';
                    let bgClass = 'bg-slate-50/50 dark:bg-slate-800/40';

                    if (opt.isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';
                    } else if (opt.isSelected && !opt.isCorrect) {
                      borderClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${borderClass} ${bgClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs">{opt.orderLetter})</span>
                          {opt.formula ? (
                            <KaTeXRenderer math={opt.formula} />
                          ) : (
                            <span>{opt.text}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          {opt.isSelected && (
                            <span className={opt.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                              (Ваш ответ)
                            </span>
                          )}
                          {opt.isCorrect && (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Правильный
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {attempt.showExplanations && q.explanationText && (
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                    <span className="font-bold">Пояснение преподавателя:</span>
                    <div>{q.explanationText}</div>
                    {q.explanationFormula && (
                      <div className="mt-1">
                        <KaTeXRenderer math={q.explanationFormula} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
