import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  FolderTree,
  Folder,
  Plus,
  ChevronRight,
  ChevronDown,
  Archive,
  RotateCcw,
  Search,
} from 'lucide-react';

export const TopicsPage: React.FC = () => {
  const [tree, setTree] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newParentId, setNewParentId] = useState<string | null>(null);

  const fetchTree = async () => {
    try {
      const res = await api.get('/topics/tree');
      if (res.data.success) {
        setTree(res.data.topics);
        // Expand first 2 categories by default
        const initExp: Record<string, boolean> = {};
        res.data.topics.slice(0, 2).forEach((t: any) => {
          initExp[t.id] = true;
        });
        setExpanded(initExp);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/topics', {
        name: newTopicName,
        description: newTopicDesc || undefined,
        parentId: newParentId || undefined,
      });
      setShowModal(false);
      setNewTopicName('');
      setNewTopicDesc('');
      fetchTree();
    } catch (err) {
      alert('Ошибка при создании темы');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      await api.patch(`/topics/${id}/archive`);
      fetchTree();
    } catch (err) {
      alert('Ошибка при архивации');
    }
  };

  // Filter tree
  const filteredTree = tree.filter((cat) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const matchCat = cat.name.toLowerCase().includes(s);
    const matchChild = cat.children?.some((c: any) => c.name.toLowerCase().includes(s));
    return matchCat || matchChild;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-purple-600" /> Математические темы
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Иерархический каталог разделов математики (185+ предустановленных тем)
          </p>
        </div>
        <button
          onClick={() => {
            setNewParentId(null);
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Добавить раздел
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по 185+ темам (алгебра, интеграл, векторы...)"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
        />
      </div>

      {/* Topics Hierarchy List */}
      <div className="space-y-3">
        {filteredTree.map((cat) => {
          const isExp = expanded[cat.id];
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              <div
                onClick={() => toggleExpand(cat.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExp ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {cat.description || 'Раздел математики'} • {cat.children?.length || 0} подтем
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setNewParentId(cat.id);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold flex items-center gap-1"
                    title="Добавить подтему"
                  >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Подтема</span>
                  </button>
                </div>
              </div>

              {/* Subtopics */}
              {isExp && cat.children && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-3 pl-12 space-y-1.5">
                  {cat.children.map((child: any) => (
                    <div
                      key={child.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {child.name}
                        </span>
                        {child.description && (
                          <span className="text-slate-400 ml-2">({child.description})</span>
                        )}
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-semibold text-[10px]">
                          Вопросов: {child._count?.questions || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleArchive(child.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="Архивировать"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {newParentId ? 'Добавить подраздел' : 'Добавить главный раздел'}
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название темы
                </label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Например: Метод математической индукции"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Краткое описание
                </label>
                <textarea
                  rows={2}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Основные формулы и концепции..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
