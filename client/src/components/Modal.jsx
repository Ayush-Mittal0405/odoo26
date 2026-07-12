import { useState } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} glass-elevated rounded-2xl p-6 animate-fade-in border border-white/10`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      {children}
      {error && <p className="text-xs text-eco-rose">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 rounded-xl bg-surface-base border border-border-default text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-eco-green/50 focus:ring-1 focus:ring-eco-green/20 transition-all ${className}`}
      {...props}
    />
  );
}

export function Select({ options = [], className = '', ...props }) {
  return (
    <select
      className={`w-full px-4 py-2.5 rounded-xl bg-surface-base border border-border-default text-text-primary text-sm focus:outline-none focus:border-eco-green/50 focus:ring-1 focus:ring-eco-green/20 transition-all ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-eco-green to-eco-green-dark text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    secondary: 'bg-surface-elevated text-text-primary border border-border-default hover:bg-surface-hover',
    danger: 'bg-eco-rose/10 text-eco-rose hover:bg-eco-rose/20',
  };

  return (
    <button
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
