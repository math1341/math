import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { KaTeXRenderer } from '../../components/KaTeXRenderer';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Calculator,
  Upload,
  BookOpen,
} from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Modal create question
  const [showModal, setShowModal] = useState(false);
  const [topicId, setTopicId] = useState('');
  const [conditionText, setConditionText] = useState('');
  const [conditionFormula, setConditionFormula] = useState('');
  const [conditionImageUrl, setConditionImageUrl] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [points, setPoints] = useState(1.0);
  const [isSingleChoice, setIsSingleChoice] = useState(true);

  // Options A, B, C, D
  const [options, setOptions] = useState([
    { text: '', formula: '', isCorrect: true },
    { text: '', formula: '', isCorrect: false },
    { text: '', formula: '', isCorrect: false },
    { text: '', formula: '', isCorrect: false },
  ]);

  // Explanation
  const [explanationText, setExplanationText] = useState('');
  const [explanationFormula, setExplanationFormula] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions', {
        params: {
          search: search || undefined,
          topicId: selectedTopic || undefined,
          difficulty: selectedDifficulty || undefined,
        },
      });
      if (res.data.success) {
        setQuestions(res.data.items);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await api.get('/topics');
      if (res.data.success) {
        setTopics(res.data.topics);
        if (res.data.topics.length > 0 && !topicId) {
          setTopicId(res.data.topics[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchQuestions(), fetchTopics()]).finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'condition') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        if (target === 'condition') {
          setConditionImageUrl(res.data.url);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка загрузки изображения');
    }
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    setOptions((prev) => {
      const next = [...prev];
      if (field === 'isCorrect' && isSingleChoice) {
        // If single choice, reset others
        next.forEach((opt, idx) => {
          opt.isCorrect = idx === index;
        });
      } else {
        (next[index] as any)[field] = value;
      }
      return next;
    });
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { text: '', formula: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert('Минимум 2 варианта ответа');
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        topicId,
        conditionText,
        conditionFormula: conditionFormula || undefined,
        conditionImageUrl: conditionImageUrl || undefined,
        difficulty,
        points: Number(points),
        isSingleChoice,
        options: options.map((opt, idx) => ({
          text: opt.text || `Вариант ${String.fromCharCode(65 + idx)}`,
          formula: opt.formula || undefined,
          isCorrect: opt.isCorrect,
          orderIndex: idx + 1,
        })),
        explanationText: explanationText || undefined,
        explanationFormula: explanationFormula || undefined,
      };

      await api.post('/questions', payload);
      setShowModal(false);
      // Reset form
      setConditionText('');
      setConditionFormula('');
      setConditionImageUrl('');
      setExplanationText('');
      setExplanationFormula('');
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при сохранении вопроса');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-purple-600" /> Банк математических вопросов
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Создание и управление математическими задачами с формулами KaTeX и иллюстрациями
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Добавить вопрос
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            placeholder="Поиск по условию или формуле..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => {
            setSelectedTopic(e.target.value);
            setTimeout(fetchQuestions, 50);
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm max-w-xs"
        >
          <option value="">Все темы</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            setTimeout(fetchQuestions, 50);
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
        >
          <option value="">Любая сложность</option>
          <option value="EASY">Базовая (EASY)</option>
          <option value="MEDIUM">Средняя (MEDIUM)</option>
          <option value="HARD">Сложная (HARD)</option>
          <option value="OLYMPIAD">Олимпиадная (OLYMPIAD)</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {q.topic?.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.difficulty === 'EASY'
                      ? 'bg-emerald-100 text-emerald-700'
                      : q.difficulty === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {q.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Баллы: {q.points}
                </span>
              </div>
            </div>

            {/* Condition Text & KaTeX Formula */}
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {q.conditionText}
            </div>

            {q.conditionFormula && (
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40 text-center overflow-x-auto">
                <KaTeXRenderer math={q.conditionFormula} displayMode={true} />
              </div>
            )}

            {q.conditionImageUrl && (
              <div className="my-2">
                <img
                  src={q.conditionImageUrl}
                  alt="Иллюстрация к вопросу"
                  className="max-h-56 rounded-xl border border-slate-200 dark:border-slate-700 object-contain"
                />
              </div>
            )}

            {/* Options Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {q.options?.map((opt: any, optIdx: number) => (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    opt.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">
                      {String.fromCharCode(65 + optIdx)})
                    </span>
                    {opt.formula ? (
                      <KaTeXRenderer math={opt.formula} />
                    ) : (
                      <span>{opt.text}</span>
                    )}
                  </div>
                  {opt.isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Правильный
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation Preview */}
            {q.explanationText && (
              <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-100">Пояснение:</span>{' '}
                {q.explanationText}
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

      {/* Create Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" /> Создание математического вопроса
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Тема вопроса
                  </label>
                  <select
                    required
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Сложность
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="EASY">Базовая (EASY)</option>
                    <option value="MEDIUM">Средняя (MEDIUM)</option>
                    <option value="HARD">Сложная (HARD)</option>
                    <option value="OLYMPIAD">Олимпиадная</option>
                  </select>
                </div>
              </div>

              {/* Condition Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Условие вопроса (текст)
                </label>
                <textarea
                  rows={2}
                  required
                  value={conditionText}
                  onChange={(e) => setConditionText(e.target.value)}
                  placeholder="Найдите корни уравнения или вычислите значение выражения..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* KaTeX Formula with Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-purple-600" /> Математическая формула (LaTeX)
                  </label>
                  <span className="text-[10px] text-slate-400">например: \int_{0}^{1} x^2 dx</span>
                </div>
                <input
                  type="text"
                  value={conditionFormula}
                  onChange={(e) => setConditionFormula(e.target.value)}
                  placeholder="2x^2 - 5x + 2 = 0  или  \frac{a + b}{c}"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-purple-600"
                />

                {/* Live Preview Box */}
                {conditionFormula && (
                  <div className="mt-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">Предпросмотр формулы (KaTeX):</span>
                    <KaTeXRenderer math={conditionFormula} displayMode={true} />
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Изображение / График (JPEG, PNG)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleImageUpload(e, 'condition')}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                  />
                  {conditionImageUrl && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Загружено
                    </span>
                  )}
                </div>
              </div>

              {/* Options Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Варианты ответа (отметьте правильный)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    + Добавить вариант
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleOptionChange(optIdx, 'isCorrect', true)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        title="Отметить как правильный"
                      />
                      <span className="font-mono font-bold text-xs">
                        {String.fromCharCode(65 + optIdx)})
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(optIdx, 'text', e.target.value)}
                        placeholder={`Текст варианта ${String.fromCharCode(65 + optIdx)}`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        value={opt.formula}
                        onChange={(e) => handleOptionChange(optIdx, 'formula', e.target.value)}
                        placeholder="Формула (LaTeX)"
                        className="w-36 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Подробное пояснение / решение задачи
                </label>
                <textarea
                  rows={2}
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Текстовое объяснение хода решения..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="text"
                  value={explanationFormula}
                  onChange={(e) => setExplanationFormula(e.target.value)}
                  placeholder="Формула решения: D = b^2 - 4ac = 9 \implies x = 2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-purple-600"
                />
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
                  Создать вопрос
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
