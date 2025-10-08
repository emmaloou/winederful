'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  ouvert: boolean;
  onFermer: () => void;
}

export default function ModalConnexion({ ouvert, onFermer }: Props) {
  const { connexion, inscription } = useAuth();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  if (!ouvert) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      if (mode === 'connexion') {
        await connexion(email, password);
      } else {
        await inscription(email, password, name);
      }
      onFermer();
      // Réinitialiser
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Bouton fermer */}
        <button
          onClick={onFermer}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#8B1538] mb-2">
            {mode === 'connexion' ? 'Connexion' : 'Inscription'}
          </h2>
          <p className="text-gray-600">
            {mode === 'connexion'
              ? 'Connectez-vous à votre compte'
              : 'Créez votre compte WineShop'}
          </p>
        </div>

        {/* Erreur */}
        {erreur && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {erreur}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'inscription' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                placeholder="Votre nom"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
              placeholder="••••••••"
            />
            {mode === 'inscription' && (
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            )}
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-bold hover:bg-[#6B0F2A] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {chargement
              ? 'Chargement...'
              : mode === 'connexion'
              ? 'Se connecter'
              : "S'inscrire"}
          </button>
        </form>

        {/* Basculer mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'connexion' ? 'inscription' : 'connexion');
              setErreur('');
            }}
            className="text-[#8B1538] hover:underline text-sm"
          >
            {mode === 'connexion'
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
