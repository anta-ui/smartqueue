
"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import "./globals.css";
export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
      style={{
        backgroundImage: `url('/images/back2.jpeg')`, // Remplacez par le chemin de votre image
      }}
    >
      {/* Overlay pour assombrir l'image de fond */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-bold mb-4 text-blue-800">Bienvenue sur SmartQueue</h1>
        <p className="text-2xl mb-8 ">
        Rejoignez-nous et optimisez votre temps en gérant vos files d'attente de manière fluide et intelligente.
        </p>

        {/* Boutons */}
        <div className="space-x-4">
          <Link
            href="/register" // Remplacez par votre route d'inscription
            className="bg-blue-800 hover:bg-blue-500 text-white text-xl font-semibold py-4 px-6 rounded-lg transition duration-300"
          >
            S'inscrire
          </Link>
          <Link
            href="/login" // Remplacez par votre route de connexion
            className="bg-blue-800 hover:bg-Blue-500 text-white text-xl font-semibold py-4 px-6 rounded-lg transition duration-300"
          >
            Se Connecter
          </Link>
        </div>
      </div>
    </div>
  );
}