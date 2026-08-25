import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  loading?: boolean;
  block?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', block ? 'btn-block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled ?? loading} {...rest}>
      {loading && <span className={`spinner${variant === 'primary' ? '' : ' spinner--light'}`} aria-hidden="true" />}
      {children}
    </button>
  );
}
