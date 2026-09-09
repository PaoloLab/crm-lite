'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface TableColumn<T> {
  key: Extract<keyof T, string>;
  label: string;
  /** Larghezza CSS fissa (es. "200px"). Senza, la colonna occupa lo spazio residuo (1fr). */
  width?: string;
  /** Rendering custom della cella. Senza, viene mostrato String(row[key]). */
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Se presente, ogni riga diventa espandibile tramite il chevron. */
  renderExpanded?: (row: T) => ReactNode;
  /** Chiavi (da rowKey) delle righe aperte inizialmente. */
  defaultExpandedKeys?: Array<string | number>;
}

const CHEVRON_COLUMN_WIDTH = '22px';

export function Table<T>({
  columns,
  rows,
  rowKey,
  renderExpanded,
  defaultExpandedKeys,
}: TableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(
    () => new Set(defaultExpandedKeys)
  );

  function toggle(key: string | number) {
    setExpandedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const gridTemplateColumns = [
    renderExpanded ? CHEVRON_COLUMN_WIDTH : null,
    ...columns.map((column) => column.width ?? '1fr'),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-1">
      <div
        className="grid items-center gap-nl-md bg-surface-2 px-nl-lg py-nl-sm"
        style={{ gridTemplateColumns }}
      >
        {renderExpanded && <span aria-hidden="true" />}
        {columns.map((column) => (
          <span
            key={column.key}
            className="truncate text-label uppercase tracking-label text-text-muted"
          >
            {column.label}
          </span>
        ))}
      </div>

      {rows.map((row) => {
        const key = rowKey(row);
        const isOpen = renderExpanded ? expandedKeys.has(key) : false;

        return (
          <div key={key} className="border-t border-border-subtle">
            <div
              className="grid items-center gap-nl-md px-nl-lg py-nl-sm text-body text-text-primary hover:bg-surface-2"
              style={{ gridTemplateColumns }}
            >
              {renderExpanded && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? 'Comprimi riga' : 'Espandi riga'}
                  className="flex size-[22px] items-center justify-center text-text-muted"
                >
                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={[
                      'transition-transform duration-150',
                      isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                </button>
              )}
              {columns.map((column) => (
                <span key={column.key} className="truncate">
                  {column.render ? column.render(row) : String(row[column.key])}
                </span>
              ))}
            </div>

            {renderExpanded && isOpen && (
              <div className="grid grid-cols-4 gap-nl-xl bg-surface-2 pt-nl-lg pr-nl-lg pb-nl-xl pl-nl-expand-indent">
                {renderExpanded(row)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
