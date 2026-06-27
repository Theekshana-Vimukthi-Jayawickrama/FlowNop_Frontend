import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Sync the latest onClose function reference to avoid stale closures in listeners
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable input field (or fallback to the first focusable element) inside the modal after render
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (focusableElements.length > 0) {
          // Focus the first text input/textarea/select if available to allow immediate typing, fallback to first focusable element
          const editableInput = Array.from(focusableElements).find(
            (el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
          );
          if (editableInput) {
            editableInput.focus();
          } else {
            focusableElements[0].focus();
          }
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Wrapper */}
      <div 
        ref={containerRef}
        className="bg-surface border border-border-color w-full max-w-lg rounded-xl shadow-xl z-10 overflow-hidden transform transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <h3 className="text-base font-bold text-text-main">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-text-muted hover:text-text-main transition-colors cursor-pointer focus:ring-2 focus:ring-primary outline-none"
            type="button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto text-text-main">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
