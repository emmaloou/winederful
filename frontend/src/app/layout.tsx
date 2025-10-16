import { AuthProvider } from '@/contexts/AuthContext';
import { PanierProvider } from '@/contexts/PanierContext';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>WineShop - Vins d'Exception</title>
      </head>
      <body className="min-h-screen bg-neutral-50 text-gray-900">
        <AuthProvider>
          <PanierProvider>
            {/* === simple global header/nav === */}
            <header className="bg-white shadow-sm">
              <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
                <a href="/" className="font-semibold text-lg">🍷 WineShop</a>

                <div className="flex items-center gap-4 text-sm">
                  <a href="/catalogue" className="hover:underline">Catalogue</a>
                  <a href="/panier" className="hover:underline">Panier</a>
                  <a href="/compte/kyc" className="text-rose-700 hover:underline font-medium">
                    Vérification d’âge
                  </a>
                </div>
              </nav>
            </header>

            {/* === page content === */}
            <main className="p-6">{children}</main>
          </PanierProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
