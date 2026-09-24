import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le voyage 3D est la porte d'entrée pour l'instant ; la page de données
  // (descente orbitale) reste en place sur /recit, en attente de sa refonte.
  async redirects() {
    return [
      {source: '/', destination: '/voyage.html', permanent: false},
    ];
  },
};

export default nextConfig;
