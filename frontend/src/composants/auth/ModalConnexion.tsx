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
  const [afficherPassword, setAfficherPassword] = useState(false);

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
            <div className="relative">
              <input
                type={afficherPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setAfficherPassword(!afficherPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {afficherPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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
