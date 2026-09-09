'use client';

import type { ReactNode } from 'react';
import { Eye, Pencil, ExternalLink, Trash2, Search } from 'lucide-react';
import {
  Badge,
  Button,
  DealCard,
  Dot,
  Input,
  MetricCard,
  Table,
  type DotColor,
  type TableColumn,
} from '@/components/ui';

interface CompanyRow {
  id: number;
  name: string;
  sector: string;
  city: string;
  status: 'Cliente' | 'Prospect';
  deals: number;
  value: string;
  owner: string;
}

const COMPANY_ROWS: CompanyRow[] = [
  {
    id: 1,
    name: 'Nordika SRL',
    sector: 'Manifattura arredo',
    city: 'Bolzano, IT',
    status: 'Cliente',
    deals: 2,
    value: '46.000 €',
    owner: 'Giulia P.',
  },
  {
    id: 2,
    name: 'Meridiana Group',
    sector: 'Servizi finanziari',
    city: 'Milano, IT',
    status: 'Cliente',
    deals: 1,
    value: '31.000 €',
    owner: 'Federico T.',
  },
  {
    id: 3,
    name: 'Orso Logistics',
    sector: 'Trasporti e logistica',
    city: 'Verona, IT',
    status: 'Prospect',
    deals: 1,
    value: '14.200 €',
    owner: 'Marco R.',
  },
  {
    id: 4,
    name: 'Lumen Interiors',
    sector: 'Interior design',
    city: 'Torino, IT',
    status: 'Cliente',
    deals: 1,
    value: '23.000 €',
    owner: 'Marco R.',
  },
];

const COMPANY_COLUMNS: TableColumn<CompanyRow>[] = [
  {
    key: 'name',
    label: 'Azienda',
    width: '220px',
    render: (row) => (
      <span className="flex flex-col">
        <span className="text-text-primary">{row.name}</span>
        <span className="text-xs text-text-muted">{row.sector}</span>
      </span>
    ),
  },
  { key: 'city', label: 'Sede', width: '140px' },
  {
    key: 'status',
    label: 'Stato',
    width: '120px',
    render: (row) => (
      <span className="flex items-center gap-nl-2xs">
        <Dot color={row.status === 'Cliente' ? 'success' : 'primary'} />
        {row.status}
      </span>
    ),
  },
  { key: 'deals', label: 'Trattative', width: '100px' },
  {
    key: 'value',
    label: 'Valore',
    width: '110px',
    render: (row) => <span className="font-mono">{row.value}</span>,
  },
  { key: 'owner', label: 'Owner', width: '140px' },
  {
    key: 'id',
    label: 'Azioni',
    render: (row) => (
      <span className="flex items-center gap-nl-4xs">
        {[
          { Icon: Eye, label: `Vedi ${row.name}` },
          { Icon: Pencil, label: `Modifica ${row.name}` },
          { Icon: ExternalLink, label: `Apri ${row.name}` },
          { Icon: Trash2, label: `Elimina ${row.name}` },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={(event) => event.stopPropagation()}
            className="flex size-[30px] items-center justify-center rounded-icon text-text-secondary hover:bg-surface-3 hover:text-text-primary"
          >
            <Icon size={15} strokeWidth={1.8} />
          </button>
        ))}
      </span>
    ),
  },
];

function ExpandedField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-nl-4xs">
      <span className="text-label uppercase tracking-label text-text-muted">{label}</span>
      <span className="text-body text-text-secondary">{children}</span>
    </div>
  );
}

function renderExpandedCompany(row: CompanyRow) {
  return (
    <>
      <ExpandedField label="Referente principale">
        Giulia Peretti
        <br />
        g.peretti@{row.name.toLowerCase().split(' ')[0]}.it
      </ExpandedField>
      <ExpandedField label="Dati societari">
        P.IVA IT02114550214
        <br />
        84 dipendenti
      </ExpandedField>
      <ExpandedField label="Sede">{row.city}</ExpandedField>
      <ExpandedField label="Relazione">
        Cliente dal marzo 2023
        <br />
        <span className="font-mono text-success">{row.value} lifetime</span>
      </ExpandedField>
    </>
  );
}

const DEAL_CARDS: Array<{
  title: string;
  value: string;
  stageColor: DotColor;
  stageLabel: string;
  contact: string;
  tag?: string;
}> = [
  {
    title: 'Rinnovo licenze 2027',
    value: '22.000 €',
    stageColor: 'primary',
    stageLabel: 'Qualificato',
    contact: 'Giulia Peretti',
    tag: 'rinnovo',
  },
  {
    title: 'Modulo produzione',
    value: '24.000 €',
    stageColor: 'warning',
    stageLabel: 'Proposta inviata',
    contact: 'Federico T.',
  },
  {
    title: 'Onboarding piattaforma',
    value: '18.500 €',
    stageColor: 'success',
    stageLabel: 'Vinto',
    contact: 'Marco R.',
    tag: 'enterprise',
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-nl-md rounded-card border border-border-subtle bg-surface-1 p-nl-lg">
      <h2 className="font-display text-lg font-medium text-text-primary">{title}</h2>
      <div className="flex flex-wrap items-center gap-nl-md">{children}</div>
    </section>
  );
}

export default function UiPreviewPage() {
  return (
    <div className="flex flex-col gap-nl-xl p-nl-3xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">UI preview</h1>
        <p className="text-ui text-text-secondary">
          Pagina temporanea per verificare i componenti di base — da cancellare dopo la revisione.
        </p>
      </div>

      <Section title="Button — primario">
        <Button>Salva</Button>
        <Button icon={<Search size={15} strokeWidth={1.8} />}>Cerca</Button>
        <Button disabled>Disabilitato</Button>
      </Section>

      <Section title="Button — secondario">
        <Button variant="secondary">Annulla</Button>
        <Button variant="secondary" icon={<Search size={15} strokeWidth={1.8} />}>
          Filtra
        </Button>
        <Button variant="secondary" disabled>
          Disabilitato
        </Button>
      </Section>

      <Section title="Button — full width (login)">
        <div className="w-full max-w-xs">
          <Button fullWidth>Accedi</Button>
        </div>
      </Section>

      <Section title="Input">
        <div className="flex w-full max-w-xs flex-col gap-nl-md">
          <Input label="Nome azienda" placeholder="Acme S.r.l." />
          <Input label="Valore trattativa" mono placeholder="12.500,00" />
          <Input placeholder="Senza label" />
        </div>
      </Section>

      <Section title="Input — variante login">
        <div className="w-full max-w-xs rounded-card bg-background-deep p-nl-lg">
          <Input variant="login" label="Username" placeholder="mario.rossi" />
        </div>
      </Section>

      <Section title="Badge — delta metrica">
        <Badge variant="delta-positive">+12.4%</Badge>
        <Badge variant="delta-negative">-3.1%</Badge>
      </Section>

      <Section title="Badge — tag">
        <Badge variant="tag">enterprise</Badge>
        <Badge variant="tag">rinnovo</Badge>
      </Section>

      <Section title="Dot — pallini di stato">
        <div className="flex items-center gap-nl-2xs">
          <Dot color="muted" />
          <span className="text-ui text-text-secondary">Nuovo lead</span>
        </div>
        <div className="flex items-center gap-nl-2xs">
          <Dot color="primary" />
          <span className="text-ui text-text-secondary">Qualificato</span>
        </div>
        <div className="flex items-center gap-nl-2xs">
          <Dot color="warning" />
          <span className="text-ui text-text-secondary">Proposta inviata</span>
        </div>
        <div className="flex items-center gap-nl-2xs">
          <Dot color="success" />
          <span className="text-ui text-text-secondary">Vinto</span>
        </div>
        <div className="flex items-center gap-nl-2xs">
          <Dot color="danger" aria-label="Trattativa calda" />
          <span className="text-ui text-text-secondary">Trattativa calda</span>
        </div>
      </Section>

      <Section title="Card — metrica">
        <MetricCard
          label="Valore complessivo"
          value="154.700 €"
          delta={{ direction: 'positive', label: '+12.4%' }}
          sparkline={[8, 12, 10, 14, 13, 16, 18]}
        />
        <MetricCard
          label="Prospect in corso"
          value="3"
          delta={{ direction: 'negative', label: '-1' }}
          sparkline={[6, 7, 9, 8, 6, 5, 4]}
        />
      </Section>

      <Section title="Card — trattativa">
        {DEAL_CARDS.map((deal) => (
          <div key={deal.title} className="w-full max-w-xs">
            <DealCard {...deal} />
          </div>
        ))}
      </Section>

      <section className="flex flex-col gap-nl-md rounded-card border border-border-subtle bg-surface-1 p-nl-lg">
        <h2 className="font-display text-lg font-medium text-text-primary">
          Table — elenco aziende (riga #1 espansa di esempio)
        </h2>
        <Table
          columns={COMPANY_COLUMNS}
          rows={COMPANY_ROWS}
          rowKey={(row) => row.id}
          renderExpanded={renderExpandedCompany}
          defaultExpandedKeys={[1]}
        />
      </section>
    </div>
  );
}
