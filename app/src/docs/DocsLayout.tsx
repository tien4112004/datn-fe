import { NavLink, Outlet } from 'react-router-dom';
import { FileText } from 'lucide-react';

const docPages = [
  { to: '/docs/1', label: 'Ingestion', description: 'Quy trình nạp dữ liệu' },
  { to: '/docs/2', label: 'Pipeline', description: 'Suy luận & Thực thi' },
];

export default function DocsLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-24 shrink-0 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4">
          <FileText size={18} className="text-blue-600" />
          <span className="text-sm font-black uppercase tracking-widest text-slate-800">Docs</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {docPages.map((page) => (
            <NavLink
              key={page.to}
              to={page.to}
              className={({ isActive }: { isActive: boolean }) =>
                `rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <p className="text-[12px] font-bold leading-tight">{page.label}</p>
              <p className="text-[10px] font-medium text-slate-400">{page.description}</p>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
