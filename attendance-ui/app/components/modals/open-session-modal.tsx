'use client';

import { Button } from '../button';
import { Field } from '../field';
import { IconRadio } from '../icons';
import { Modal } from '../modal';

const PRESET_COURSES = [
  'CS-401 · Distributed Systems & ZK',
  'BIO-204 · Computational Genomics',
  'MATH-301 · Applied Cryptography',
  'AI-502 · Privacy-Preserving ML',
];

type OpenSessionModalProps = {
  courseCodeInput: string;
  onCourseCodeChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function OpenSessionModal({ courseCodeInput, onCourseCodeChange, onSubmit, onClose }: OpenSessionModalProps) {
  return (
    <Modal title="Open attendance window" onClose={onClose}>
      <p className="modal-body">
        Enter the course code. Aurora hashes it on this device and publishes only a salted 32-byte commitment to the
        Midnight ledger — the plaintext never leaves your browser.
      </p>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field
          id="modal-course-code"
          label="Course code"
          placeholder="e.g. CS-401 · Distributed Systems & ZK"
          value={courseCodeInput}
          onChange={(event) => onCourseCodeChange(event.target.value)}
          required
          autoComplete="off"
        />

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '-4px', marginBottom: '8px' }}>
          {PRESET_COURSES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onCourseCodeChange(preset)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(45, 58, 46, 0.12)',
                background: courseCodeInput === preset ? '#2d3a2e' : 'rgba(255,255,255,0.7)',
                color: courseCodeInput === preset ? '#ffffff' : '#2d3a2e',
                cursor: 'pointer',
              }}
            >
              {preset.split('·')[0]}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={courseCodeInput.trim().length === 0}>
            <IconRadio size={15} />
            Open window
          </Button>
        </div>
      </form>
    </Modal>
  );
}
