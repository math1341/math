import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Users,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  ShieldAlert,
  Search,
  Lock,
  Unlock,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/admin');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        params: { search: search || undefined, role: roleFilter || undefined },
      });
      if (res.data.success) {
        setUsers(res.data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAudit = async () => {
    try {
      const res = await api.get('/audit', { params: { limit: 50 } });
      if (res.data.success) {
        setAuditLogs(res.data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers(), fetchAudit()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await api.patch(`/users/${userId}/toggle-block`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u)),
        );
        fetchStats();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка изменения статуса');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Кабинет Администратора ProTest
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Управление платформой, мониторинг пользователей и статистика
        </p>
      </div>

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Всего пользователей</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalUsers}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Преподавателей</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalTeachers}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Вопросов в базе</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalQuestions}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Сдано тестов</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalAttempts}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Пользователи
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" /> Журнал действий (Audit Log)
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Поиск по имени или телефону..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setTimeout(fetchUsers, 50);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Все роли</option>
              <option value="ADMIN">Администраторы</option>
              <option value="TEACHER">Преподаватели</option>
              <option value="STUDENT">Ученики</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Ф.И.О.</th>
                  <th className="px-4 py-3">Телефон</th>
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Дата создания</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {u.fullName}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : u.role === 'TEACHER'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isBlocked ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Заблокирован
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Активен
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleBlock(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ml-auto ${
                            u.isBlocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Разблокировать
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Заблокировать
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            История системных действий
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    [{log.action}]
                  </span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                  {log.user && (
                    <span className="text-slate-400 ml-2">
                      (Пользователь: {log.user.fullName} • {log.user.phone})
                    </span>
                  )}
                </div>
                <div className="text-slate-400 shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
