'use client';

import type { ComponentType } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { GlassCard } from './glass-card';
import {
  IconAlertTriangle,
  IconHash,
  IconLock,
  IconRadio,
  IconRefresh,
  IconShieldCheck,
  IconUserCheck,
  IconZap,
} from './icons';

type ManualGuideProps = {
  isOpen: boolean;
  onOpenSession: () => void;
  onCheckIn: () => void;
};

type Step = {
  title: string;
  copy: string;
};

type Term = {
  icon: ComponentType<{ size?: number }>;
  title: string;
  copy: string;
};

const INSTRUCTOR_STEPS: Step[] = [
  {
    title: 'Connect your Midnight wallet',
    copy: 'Aurora auto-detects your 1AM / Lace extension when the page loads and shows your shielded address in the header. Keys never leave the wallet.',
  },
  {
    title: 'Open an attendance window',
    copy: 'Enter the course code. It is hashed on this device and only a salted 32-byte commitment is published — the plaintext never leaves your browser.',
  },
  {
    title: 'Watch check-ins arrive',
    copy: 'Students prove presence with zero-knowledge proofs. You see counts and rotating pseudonyms — never names or student IDs.',
  },
  {
    title: 'Close and rotate',
    copy: 'Closing the window advances the ledger sequence, unlinking this cohort’s pseudonyms from every future session.',
  },
];

const STUDENT_STEPS: Step[] = [
  {
    title: 'Connect your wallet',
    copy: 'Unlock the 1AM / Lace extension and Aurora connects automatically. Your private witness stays on this device for the whole session.',
  },
  {
    title: 'Wait for an open window',
    copy: 'Check-ins are only accepted while your instructor’s attendance window is open. The home tab shows the live session status.',
  },
  {
    title: 'Check in privately',
    copy: 'Enter your student ID and the course code. Your ID is hashed locally into a private witness and turned into a zero-knowledge proof in four steps.',
  },
  {
    title: 'Keep your receipt',
    copy: 'A confirmation shows your rotating pseudonym. The ledger stores only your proof and nullifier — never your name or student ID.',
  },
];

const GLOSSARY: Term[] = [
  {
    icon: IconHash,
    title: 'Course commitment',
    copy: 'A salted SHA-256 hash of the course code. It is the only course data that reaches the ledger — 32 bytes, irreversible.',
  },
  {
    icon: IconLock,
    title: 'Private witness',
    copy: 'Your student ID, hashed on-device. It is never transmitted anywhere and is only used to derive proofs.',
  },
  {
    icon: IconUserCheck,
    title: 'Rotating pseudonym',
    copy: 'A per-session alias derived from your witness and the sequence number. It changes every session, so attendance can’t be linked over time.',
  },
  {
    icon: IconZap,
    title: 'Nullifier',
    copy: 'A per-session tag that makes double check-ins impossible — without revealing who you are.',
  },
  {
    icon: IconRefresh,
    title: 'Sequence',
    copy: 'The ledger’s counter. It advances every time a window closes, rotating every student pseudonym at once.',
  },
  {
    icon: IconShieldCheck,
    title: 'ZK proof',
    copy: 'The cryptographic argument that you know a valid witness. It verifies without ever revealing the witness itself.',
  },
];

const TROUBLESHOOTING: Term[] = [
  {
    icon: IconAlertTriangle,
    title: '“No Midnight wallet detected”',
    copy: 'Unlock your 1AM / Lace extension and try again — Aurora polls for a wallet for up to six seconds on each attempt.',
  },
  {
    icon: IconAlertTriangle,
    title: '“No attendance session is currently open”',
    copy: 'Check-ins need an open window. Ask your instructor to open one from the home tab, then retry.',
  },
  {
    icon: IconAlertTriangle,
    title: 'Wallet on a different network',
    copy: 'Aurora automatically retries on the network your wallet reports. No action needed — wait for the connection toast.',
  },
];

function GuideSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="row-stack">
      {steps.map((step, index) => (
        <div key={step.title} className="feature-row">
          <span className="feature-icon">
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
          </span>
          <div>
            <p className="feature-title">{step.title}</p>
            <p className="feature-copy">{step.copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TermRows({ terms }: { terms: Term[] }) {
  return (
    <div className="row-stack">
      {terms.map((term) => {
        const Icon = term.icon;
        return (
          <div key={term.title} className="feature-row">
            <span className="feature-icon">
              <Icon size={18} />
            </span>
            <div>
              <p className="feature-title">{term.title}</p>
              <p className="feature-copy">{term.copy}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ManualGuide({ isOpen, onOpenSession, onCheckIn }: ManualGuideProps) {
  return (
    <section className="section" aria-label="User manual">
      <div className="section-head">
        <h2 className="t-headline-lg">User manual</h2>
        <span className="t-body-md text-muted">How Aurora works, and how to use it</span>
      </div>

      <div className="grid-2">
        <GlassCard>
          <div className="card-title-row">
            <h3 className="t-headline-md">For instructors</h3>
            <Badge tone={isOpen ? 'positive' : 'neutral'}>{isOpen ? 'Window open' : 'Window closed'}</Badge>
          </div>
          <GuideSteps steps={INSTRUCTOR_STEPS} />
          <div className="hero-actions">
            <Button onClick={onOpenSession}>
              <IconRadio size={15} />
              Open attendance window
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="card-title-row">
            <h3 className="t-headline-md">For students</h3>
            <Badge tone="info">4-step ZK check-in</Badge>
          </div>
          <GuideSteps steps={STUDENT_STEPS} />
          <div className="hero-actions">
            <Button onClick={onCheckIn} disabled={!isOpen}>
              <IconShieldCheck size={15} />
              Check in privately
            </Button>
            {!isOpen && (
              <span className="field-hint" style={{ alignSelf: 'center' }}>
                Waiting for an open window — ask your instructor to start one.
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="card-title-row">
          <h3 className="t-headline-md">What the ledger stores</h3>
          <Badge tone="info">Glossary</Badge>
        </div>
        <p className="card-copy">
          Every value on-chain is a salted 32-byte commitment or a proof. Nothing personal is ever published — here is
          what each term in the dashboard means.
        </p>
        <div className="grid-2">
          <TermRows terms={GLOSSARY.slice(0, 3)} />
          <TermRows terms={GLOSSARY.slice(3)} />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="card-title-row">
          <h3 className="t-headline-md">Troubleshooting</h3>
          <Badge>Common issues</Badge>
        </div>
        <TermRows terms={TROUBLESHOOTING} />
      </GlassCard>
    </section>
  );
}
