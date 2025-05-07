import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DropdownMenu.module.scss';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  focusTrap?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, items, align = 'left', focusTrap = false }) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Keyboard navigation
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? 0 : (prev + 1) % items.length;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? items.length - 1 : (prev - 1 + items.length) % items.length;
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex !== null && !items[focusedIndex].disabled) {
          items[focusedIndex].onClick();
          setOpen(false);
        }
      } else if (e.key === 'Tab') {
        setOpen(false);
      }
    },
    [open, items, focusedIndex]
  );

  // Focus trap (optional)
  useEffect(() => {
    if (!open || !focusTrap) return;
    const menu = menuRef.current;
    if (!menu) return;
    const focusable = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    if (focusable.length && focusedIndex !== null) {
      focusable[focusedIndex].focus();
    }
  }, [open, focusedIndex, focusTrap]);

  // Focus first item when menu opens
  useEffect(() => {
    if (open) setFocusedIndex(0);
    else setFocusedIndex(null);
  }, [open]);

  return (
    <div className={styles.dropdown}>
      <button
        ref={buttonRef}
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="dropdown-menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        type="button"
      >
        {label}
        <span className={styles.arrow} aria-hidden>▾</span>
      </button>
      {open && (
        <ul
          className={styles.menu + ' ' + styles[align]}
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          tabIndex={-1}
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, idx) => (
            <li
              key={item.label}
              role="menuitem"
              tabIndex={focusedIndex === idx ? 0 : -1}
              aria-disabled={item.disabled}
              className={
                styles.menuItem +
                (focusedIndex === idx ? ' ' + styles.focused : '') +
                (item.disabled ? ' ' + styles.disabled : '')
              }
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              onMouseEnter={() => setFocusedIndex(idx)}
              onFocus={() => setFocusedIndex(idx)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 