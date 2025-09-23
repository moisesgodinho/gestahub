// src/app/layout.js
import { Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Header from "@/components/Header";
import { UserProvider } from "@/context/UserContext";
import ResponsiveNav from "@/components/ResponsiveNav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "GestaHub",
  description: "Sua jornada da maternidade, semana a semana.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 pb-16 md:pb-0`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  try {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme) { return savedTheme; }
                    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    return prefersDark ? 'dark' : 'light';
                  } catch (e) { return 'light'; }
                }
                const theme = getInitialTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <UserProvider>
          <div className="main-layout-container flex-grow flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
          </div>
          <ResponsiveNav />
          {/* O rodapé foi removido daqui */}
        </UserProvider>
      </body>
    </html>
  );
}
