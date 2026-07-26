import './styles.css';
import { Providers } from './providers';
export const metadata = {
  title: 'Private Student Attendance',
  description: 'Privacy-preserving attendance on Midnight',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
