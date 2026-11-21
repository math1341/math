import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Users2, Plus, UserPlus, Trash2, Search, User } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.groups);
        if (res.data.groups.length > 0 && !selectedGroup) {
          loadGroupDetails(res.data.groups[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users/students');
      if (res.data.success) {
        setStudents(res.data.students);
        if (res.data.students.length > 0) {
          setSelectedStudentId(res.data.students[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      if (res.data.success) {
        setSelectedGroup(res.data.group);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups', {
        name: newGroupName,
        description: newGroupDesc || undefined,
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      fetchGroups();
      if (res.data.group) {
        loadGroupDetails(res.data.group.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка создания группы');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedStudentId) return;

    try {
      await api.post(`/groups/${selectedGroup.id}/students/${selectedStudentId}`);
      setShowAddStudentModal(false);
      loadGroupDetails(selectedGroup.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка добавления ученика');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedGroup) return;
    try {
      await api.delete(`/groups/${selectedGroup.id}/students/${studentId}`);
      loadGroupDetails(selectedGroup.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-7 h-7 text-purple-600" /> Группы учеников
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Формирование учебных классов и привязка учеников к тестированиям
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Создать группу
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Список групп ({groups.length})
          </h3>
          <div className="space-y-2">
            {groups.map((g) => {
              const isSelected = selectedGroup?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => loadGroupDetails(g.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <h4 className="font-bold text-sm">{g.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {g.description || 'Без описания'}
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-purple-600 flex items-center gap-2">
                    <span>Учеников: {g._count?.members ?? g.members?.length ?? 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Group Details & Members */}
        <div className="md:col-span-2">
          {selectedGroup ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedGroup.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedGroup.description || 'Учебная группа'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Добавить ученика
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Состав группы ({selectedGroup.members?.length || 0})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  {selectedGroup.members?.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {m.student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {m.student.phone}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveStudent(m.studentId)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Удалить из группы"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(!selectedGroup.members || selectedGroup.members.length === 0) && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      В этой группе пока нет добавленных учеников
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-400 border border-dashed rounded-2xl">
              Выберите группу для просмотра состава
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Новая учебная группа
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название группы
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Например: 11-А класс (Профиль)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Описание
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Подготовка к вступительным экзаменам..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Добавить ученика в {selectedGroup?.name}
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Выберите ученика
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
