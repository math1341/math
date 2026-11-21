import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { KaTeXRenderer } from '../../components/KaTeXRenderer';
import {
  FileCheck2,
  Plus,
  Clock,
  Shuffle,
  Users2,
  CheckCircle2,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';

export const TestConstructorPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [allowRetake, setAllowRetake] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  // Selection mode: 'manual' or 'auto'
  const [selectionMode, setSelectionMode] = useState<'manual' | 'auto'>('manual');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Auto select criteria
  const [autoTopicIds, setAutoTopicIds] = useState<string[]>([]);
  const [autoCount, setAutoCount] = useState(10);
  const [autoDifficulty, setAutoDifficulty] = useState('');

  const fetchData = async () => {
    try {
      const [testsRes, questionsRes, groupsRes, topicsRes] = await Promise.all([
        api.get('/tests'),
        api.get('/questions', { params: { limit: 100 } }),
        api.get('/groups'),
        api.get('/topics'),
      ]);

      if (testsRes.data.success) setTests(testsRes.data.items);
      if (questionsRes.data.success) setQuestions(questionsRes.data.items);
      if (groupsRes.data.success) setGroups(groupsRes.data.groups);
      if (topicsRes.data.topics) setTopics(topicsRes.data.topics);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleQuestion = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId],
    );
  };

  const handleToggleGroup = (gId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(gId) ? prev.filter((id) => id !== gId) : [...prev, gId],
    );
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectionMode === 'manual' && selectedQuestionIds.length === 0) {
      alert('Выберите хотя бы один вопрос');
      return;
    }

    try {
      const payload: any = {
        title,
        description: description || undefined,
        durationMinutes: Number(durationMinutes),
        shuffleQuestions,
        shuffleOptions,
        allowRetake,
        maxAttempts: Number(maxAttempts),
        showResultsImmediately,
        showExplanations,
        groupIds: selectedGroupIds,
      };

      if (selectionMode === 'manual') {
        payload.questionIds = selectedQuestionIds;
      } else {
        payload.autoSelect = {
          topicIds: autoTopicIds.length > 0 ? autoTopicIds : topics.map((t) => t.id),
          count: Number(autoCount),
          difficulty: autoDifficulty || undefined,
        };
      }

      await api.post('/tests', payload);
      setShowModal(false);
      // Reset
      setTitle('');
      setDescription('');
      setSelectedQuestionIds([]);
      setSelectedGroupIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка создания теста');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-purple-600" /> Конструктор тестов
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Составление математических тестов, назначение группам и контроль параметров
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Создать новый тест
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {test.durationMinutes} мин
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {test._count?.testQuestions || 0} вопросов
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {test.title}
              </h3>
              {test.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {test.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {test.shuffleQuestions && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                    <Shuffle className="w-2.5 h-2.5" /> Вопросы
                  </span>
                )}
                {test.shuffleOptions && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                    <Shuffle className="w-2.5 h-2.5" /> Варианты
                  </span>
                )}
                {test.allowRetake && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Повтор ({test.maxAttempts})
                  </span>
                )}
              </div>

              {/* Assigned Groups */}
              {test.assignedGroups && test.assignedGroups.length > 0 && (
                <div className="pt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users2 className="w-3.5 h-3.5 text-purple-600" /> Назначено группам:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {test.assignedGroups.map((ag: any) => (
                      <span
                        key={ag.groupId}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]"
                      >
                        {ag.group?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Сдач: <strong className="text-purple-600">{test._count?.attempts || 0}</strong>
              </span>
              <Link
                to={`/teacher/tests/${test.id}/results`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Результаты & Excel
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Test Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" /> Создание теста
            </h3>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Название теста
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Итоговый срез по алгебре и началам анализа"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Время теста (минут)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={360}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Описание и инструкции
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Инструкция для учащихся..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Flags & Shuffling */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Перемешивать вопросы</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Перемешивать варианты</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showResultsImmediately}
                    onChange={(e) => setShowResultsImmediately(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Показывать балл сразу</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExplanations}
                    onChange={(e) => setShowExplanations(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Показывать решения</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRetake}
                    onChange={(e) => setAllowRetake(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Разрешить пересдачу</span>
                </label>

                {allowRetake && (
                  <div className="flex items-center gap-2">
                    <span>Попыток:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Assign Groups */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                  <Users2 className="w-4 h-4 text-purple-600" /> Назначить группам учеников:
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleToggleGroup(g.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedGroupIds.includes(g.id)
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Selection Mode Switch */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" /> Подбор математических вопросов:
                  </span>
                  <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('manual')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        selectionMode === 'manual'
                          ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Ручной выбор ({selectedQuestionIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode('auto')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        selectionMode === 'auto'
                          ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Автоматический подбор
                    </button>
                  </div>
                </div>

                {selectionMode === 'manual' ? (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {questions.map((q) => {
                      const isSel = selectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isSel
                              ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSel}
                              readOnly
                              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                            />
                            <div>
                              <span className="font-semibold">{q.conditionText}</span>
                              {q.conditionFormula && (
                                <div className="mt-0.5">
                                  <KaTeXRenderer math={q.conditionFormula} />
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-bold shrink-0">
                            {q.points} б.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">
                        Количество случайно выбираемых вопросов:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={autoCount}
                        onChange={(e) => setAutoCount(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  Сохранить тест
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
