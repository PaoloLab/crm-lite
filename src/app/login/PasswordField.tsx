'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui';

// Unico pezzo client di questa pagina: serve solo per lo stato locale
// mostra/nascondi password. Il form resta un Server Component con la sua
// server action invariata (vedi app/login/page.tsx).
export function PasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col">
      <span className="mb-nl-3xs text-label uppercase tracking-label text-text-muted">Password</span>
      <Input
        name="password"
        type={visible ? 'text' : 'password'}
        variant="login"
        placeholder="••••••••"
        required
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? 'Nascondi password' : 'Mostra password'}
            className="pointer-events-auto hover:text-text-secondary"
          >
            {visible ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
          </button>
        }
      />
    </label>
  );
}
