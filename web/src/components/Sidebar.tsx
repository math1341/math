import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  FolderTree,
  FileCheck2,
  Users2,
  ClipboardList,
  History,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300'
    }`;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Основное меню
        </div>

        {/* ADMIN Navigation */}
        {user.role === 'ADMIN' && (
          <>
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Главная панель</span>
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <Users className="w-4 h-4" />
              <span>Пользователи</span>
            </NavLink>
            <NavLink to="/teacher/questions" className={linkClass}>
              <HelpCircle className="w-4 h-4" />
              <span>Банк вопросов</span>
            </NavLink>
            <NavLink to="/teacher/topics" className={linkClass}>
              <FolderTree className="w-4 h-4" />
              <span>Темы (185+)</span>
            </NavLink>
            <NavLink to="/teacher/tests" className={linkClass}>
              <FileCheck2 className="w-4 h-4" />
              <span>Конструктор тестов</span>
            </NavLink>
            <NavLink to="/teacher/groups" className={linkClass}>
              <Users2 className="w-4 h-4" />
              <span>Группы учеников</span>
            </NavLink>
            <NavLink to="/admin/audit" className={linkClass}>
              <ShieldCheck className="w-4 h-4" />
              <span>Журнал действий</span>
            </NavLink>
          </>
        )}

        {/* TEACHER Navigation */}
        {user.role === 'TEACHER' && (
          <>
            <NavLink to="/teacher" end className={linkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Мой кабинет</span>
            </NavLink>
            <NavLink to="/teacher/questions" className={linkClass}>
              <HelpCircle className="w-4 h-4" />
              <span>Банк вопросов</span>
            </NavLink>
            <NavLink to="/teacher/topics" className={linkClass}>
              <FolderTree className="w-4 h-4" />
              <span>Математические темы</span>
            </NavLink>
            <NavLink to="/teacher/tests" className={linkClass}>
              <FileCheck2 className="w-4 h-4" />
              <span>Конструктор тестов</span>
            </NavLink>
            <NavLink to="/teacher/groups" className={linkClass}>
              <Users2 className="w-4 h-4" />
              <span>Мои группы</span>
            </NavLink>
          </>
        )}

        {/* STUDENT Navigation */}
        {user.role === 'STUDENT' && (
          <>
            <NavLink to="/student" end className={linkClass}>
              <ClipboardList className="w-4 h-4" />
              <span>Назначенные тесты</span>
            </NavLink>
            <NavLink to="/student/history" className={linkClass}>
              <History className="w-4 h-4" />
              <span>История попыток</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
        ProTest v1.0 • Образование
      </div>
    </aside>
  );
};
