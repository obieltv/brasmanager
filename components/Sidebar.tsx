'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UploadCloud, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fornecedores', label: 'Fornecedores', icon: Users },
  { href: '/importar-exportar', label: 'Importar / Exportar', icon: UploadCloud },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8DACE] z-30">
        {/* Logo */}
        <div className="p-6 border-b border-[#E8DACE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9747A] flex items-center justify-center">
              <Gem size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#1A1A2E] leading-none">Brás Manager</h1>
              <p className="text-[10px] text-[#8B7B74] mt-0.5">Gestão de Fornecedores</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#FDF8F4] text-[#C9747A] border border-[#E8DACE]'
                    : 'text-[#8B7B74] hover:bg-[#FDF8F4] hover:text-[#1A1A2E]'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8DACE]">
          <p className="text-[10px] text-[#8B7B74] text-center">Brás Manager © 2025</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8DACE] z-30 flex items-center justify-around px-2 pb-safe">
        {NAV.map((item) => {
          const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-3 text-[10px] font-medium transition-colors',
                active ? 'text-[#C9747A]' : 'text-[#8B7B74]'
              )}
            >
              <item.icon size={20} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
