import { config } from '../../lib/config';
import { AuroraMark } from './logo';

export function Footer() {
  return (
    <footer className="glass site-footer">
      <span className="footer-brand">
        <AuroraMark size={20} />
        Aurora · zero-knowledge attendance on Midnight
      </span>
      <span>Compact v0.23 · {config.network.toUpperCase()}</span>
    </footer>
  );
}
