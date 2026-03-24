'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { FiGrid, FiShoppingBag, FiFolder, FiClipboard, FiUsers, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push(`/${locale}`);
    }
  }, [user, locale, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted mb-4">Please login as admin</p>
          <Link href={`/${locale}/auth`} className="text-primary hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  const links = [
    { href: `/${locale}/admin/dashboard`, icon: FiGrid, label: t('dashboard') },
    { href: `/${locale}/admin/foods`, icon: FiShoppingBag, label: t('foods') },
    { href: `/${locale}/admin/categories`, icon: FiFolder, label: t('categories') },
    { href: `/${locale}/admin/orders`, icon: FiClipboard, label: t('orders') },
    { href: `/${locale}/admin/users`, icon: FiUsers, label: t('users') },
    { href: `/${locale}/admin/news`, icon: FiFileText, label: t('news') },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:block">
        <div className="p-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6"
          >
            <FiArrowLeft size={16} />
            Back to site
          </Link>
          <div className="mb-6">
            <span className="text-2xl font-bold text-primary">Food</span>
            <span className="text-2xl font-bold text-foreground">Order</span>
            <p className="text-xs text-muted mt-1">Admin Panel</p>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-input hover:text-foreground'
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around py-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                  isActive ? 'text-primary' : 'text-muted'
                }`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
