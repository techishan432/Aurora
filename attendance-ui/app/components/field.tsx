import type { InputHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
};

export function Field({ id, label, hint, className, ...inputProps }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className={`input${className ? ` ${className}` : ''}`} {...inputProps} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
