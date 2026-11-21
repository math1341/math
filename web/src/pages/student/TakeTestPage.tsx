import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { KaTeXRenderer } from '../../components/KaTeXRenderer';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Save,
  Check,
} from 'lucide-react';

export const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  // Server-controlled Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Start or Resume Attempt
  useEffect(() => {
    if (!testId) return;

    api.post(`/testing/${testId}/start`)
      .then((res) => {
        if (res.data.success) {
          setAttemptId(res.data.attemptId);
          setTestTitle(res.data.testTitle);
          setQuestions(res.data.questions);
          setSecondsLeft(res.data.remainingSeconds);

          // Restore saved answers from attempt
          if (res.data.savedAnswers) {
            const restored: Record<string, string[]> = {};
            const savedFlags: Record<string, boolean> = {};
            Object.keys(res.data.savedAnswers).forEach((qId) => {
              restored[qId] = res.data.savedAnswers[qId].selectedOptionIds || [];
              savedFlags[qId] = true;
            });
            setAnswers(restored);
            setSavedStatus(savedFlags);
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Не удалось загрузить тест');
      })
      .finally(() => setLoading(false));
  }, [testId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinish(true); // Auto submit on expiration
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsLeft]);

  // 3. Option Selection & Autosave by ID
  const handleSelectOption = async (questionId: string, optionId: string, isSingleChoice: boolean) => {
    let newSelected: string[];

    if (isSingleChoice) {
      newSelected = [optionId];
    } else {
      const current = answers[questionId] || [];
      newSelected = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    }

    setAnswers((prev) => ({ ...prev, [questionId]: newSelected }));
    setSavedStatus((prev) => ({ ...prev, [questionId]: false }));

    // Send autosave to backend
    if (attemptId) {
      try {
        await api.post(`/testing/attempts/${attemptId}/save-answer`, {
          questionId,
          selectedOptionIds: newSelected,
        });
        setSavedStatus((prev) => ({ ...prev, [questionId]: true }));
      } catch (e) {
        console.error('Autosave error:', e);
      }
    }
  };

  // 4. Finish and Submit Attempt
  const handleFinish = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm('Вы уверены, что хотите завершить тестирование?');
      if (!confirmed) return;
    }

    if (!attemptId) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/testing/attempts/${attemptId}/finish`);
      if (res.data.success) {
        navigate(`/student/results/${attemptId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка завершения теста');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Подготовка вариантов и загрузка формул...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Тестирование недоступно</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={() => navigate('/student')}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700"
          >
            Вернуться в кабинет
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.questionId] || [];
  const isCurrentSaved = savedStatus[currentQ.questionId];

  // Timer format
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeLow = secondsLeft < 300; // less than 5 min

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Test Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              Тестирование ProTest
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
              {testTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Server-controlled Timer */}
            <div
              className={`px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold flex items-center gap-2 shadow-sm border ${
                isTimeLow
                  ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/60 dark:border-rose-900 animate-pulse'
                  : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/60 dark:border-purple-800 dark:text-purple-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timerStr}</span>
            </div>

            {/* Finish Button */}
            <button
              onClick={() => handleFinish(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Завершить тест</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Question Selector Pills */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {questions.map((q, idx) => {
            const hasAns = (answers[q.questionId] || []).length > 0;
            const isCur = idx === currentIndex;
            return (
              <button
                key={q.questionId}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  isCur
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-600/30'
                    : hasAns
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Вопрос {currentIndex + 1} из {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Балл: {currentQ.points}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              {isCurrentSaved ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Сохранено
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Автосохранение
                </span>
              )}
            </div>
          </div>

          {/* Condition Text & Formula */}
          <div className="space-y-4">
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.conditionText}
            </div>

            {currentQ.conditionFormula && (
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-center text-lg overflow-x-auto shadow-inner">
                <KaTeXRenderer math={currentQ.conditionFormula} displayMode={true} />
              </div>
            )}

            {currentQ.conditionImageUrl && (
              <div className="flex justify-center my-4">
                <img
                  src={currentQ.conditionImageUrl}
                  alt="Иллюстрация к вопросу"
                  className="max-h-64 rounded-2xl border border-slate-200 dark:border-slate-800 object-contain shadow-md"
                />
              </div>
            )}
          </div>

          {/* Answer Options (Randomized order frozen per attempt, verified by ID) */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentQ.isSingleChoice
                ? 'Выберите один правильный вариант:'
                : 'Выберите правильные варианты:'}
            </p>

            <div className="space-y-2.5">
              {currentQ.options?.map((opt: any) => {
                const isSelected = currentAnswer.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() =>
                      handleSelectOption(currentQ.questionId, opt.id, currentQ.isSingleChoice)
                    }
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 select-none ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 dark:bg-purple-950/60 dark:text-purple-200 shadow-md shadow-purple-600/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-800'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.orderLetter}
                    </div>

                    <div className="flex-1 text-sm font-semibold">
                      {opt.formula ? (
                        <KaTeXRenderer math={opt.formula} />
                      ) : (
                        <span>{opt.text}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
            >
              Следующий вопрос <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFinish(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              Завершить тест <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
