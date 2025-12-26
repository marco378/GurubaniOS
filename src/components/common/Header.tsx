'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Controller Interface', href: '/controller-interface', icon: 'CommandLineIcon' },
    { name: 'Projector Display', href: '/projector-display', icon: 'TvIcon' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className={`w-full bg-surface border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-smooth hover:opacity-80">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground leading-tight">
              Gurbani Presenter
            </span>
            <span className="text-xs text-text-secondary leading-tight">
              Sacred Display System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-smooth font-medium text-sm
                ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-elevated'
                    : 'text-text-secondary hover:text-foreground hover:bg-muted'
                }
              `}
              target={item.name === 'Projector Display' ? '_blank' : undefined}
              rel={item.name === 'Projector Display' ? 'noopener noreferrer' : undefined}
            >
              <Icon name={item.icon as any} size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
          aria-label="Toggle menu"
        >
          <Icon name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-smooth font-medium text-sm
                  ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-elevated'
                      : 'text-text-secondary hover:text-foreground hover:bg-muted'
                  }
                `}
                target={item.name === 'Projector Display' ? '_blank' : undefined}
                rel={item.name === 'Projector Display' ? 'noopener noreferrer' : undefined}
              >
                <Icon name={item.icon as any} size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;