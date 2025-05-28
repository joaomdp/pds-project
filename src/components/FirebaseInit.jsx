import { useEffect, useState } from "react";
import { inicializarFirebase } from "../services/initFirebase";

export default function FirebaseInit({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Iniciando Firebase...");
        await inicializarFirebase();
        console.log("Firebase inicializado com sucesso!");
        setIsInitialized(true);
      } catch (err) {
        console.error("Erro ao inicializar Firebase:", err);
        setError(err.message);
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro ao inicializar o sistema
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando o sistema...</p>
        </div>
      </div>
    );
  }

  return children;
}
