// src/app/layout.js
import { Poppins } from 'next/font/google';
import "./globals.css";

// Configura a fonte Poppins com os pesos (weights) que vamos usar
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins', // Cria uma variável CSS para a fonte
});

export const metadata = {
  title: "GestaHub",
  description: "Sua jornada da maternidade, semana a semana.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      {/* Aplica a variável da fonte ao body */}
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}