import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Exo_2, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Exo_2({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-display',
});
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Tech Devs — Gestão de Atividades',
  description: 'Quadro de tarefas da equipe Tech Devs. Coding · Tech · Growth.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
