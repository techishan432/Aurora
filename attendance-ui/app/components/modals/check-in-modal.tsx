'use client';

import { Button } from '../button';
import { Field } from '../field';
import { IconShieldCheck } from '../icons';
import { Modal } from '../modal';

type CheckInModalProps = {
  studentIdInput: string;
  onStudentIdChange: (value: string) => void;
  courseCodeInput: string;
  onCourseCodeChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function CheckInModal({
  studentIdInput,
  onStudentIdChange,
  courseCodeInput,
  onCourseCodeChange,
  onSubmit,
  onClose,
}: CheckInModalProps) {
  return (
    <Modal title="Private check-in" onClose={onClose}>
      <p className="modal-body">
        Your student ID is hashed locally with your private witness. The Midnight ledger receives only a zero-knowledge
        proof and your rotating pseudonym.
      </p>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field
          id="modal-student-id"
          label="Student ID · private witness"
          placeholder="e.g. STU-94021"
          hint="Never leaves this device."
          value={studentIdInput}
          onChange={(event) => onStudentIdChange(event.target.value)}
          required
          autoComplete="off"
        />
        <Field
          id="modal-course-code"
          label="Course code"
          placeholder="e.g. CS-401 · Distributed Systems & ZK"
          value={courseCodeInput}
          onChange={(event) => onCourseCodeChange(event.target.value)}
          required
          autoComplete="off"
        />
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={studentIdInput.trim().length === 0 || courseCodeInput.trim().length === 0}>
            <IconShieldCheck size={15} />
            Generate proof &amp; check in
          </Button>
        </div>
      </form>
    </Modal>
  );
}
