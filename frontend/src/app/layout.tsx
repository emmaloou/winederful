import { AuthProvider } from '@/contexts/AuthContext';
import { PanierProvider } from '@/contexts/PanierContext';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>WineShop - Vins d'Exception</title>
      </head>
      <body>
        <AuthProvider>
          <PanierProvider>{children}</PanierProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
