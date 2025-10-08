export default function PiedDePage() {
  return (
    <footer className="bg-[#333] text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🍷 WineShop</h3>
            <p className="text-gray-400">Votre cave en ligne de vins d'exception</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white">Accueil</a></li>
              <li><a href="/catalogue" className="hover:text-white">Catalogue</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-gray-400">Email: contact@wineshop.fr</p>
            <p className="text-gray-400">Tél: +33 1 23 45 67 89</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 WineShop. Tous droits réservés. L'abus d'alcool est dangereux pour la santé.</p>
        </div>
      </div>
    </footer>
  );
}
