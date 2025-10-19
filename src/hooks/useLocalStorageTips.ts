import { useEffect, useState } from "react";

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: "note" | "code" | "checklist";
  createdAt: number;
}



// ⚙️ URL de tu JSON remoto (por ejemplo, un archivo en GitHub)


export function useLocalStorageTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTips() {
      try {
        // 1️⃣ Si hay algo en localStorage, usarlo primero
        const saved = localStorage.getItem(import.meta.env.VITE_STORAGE_KEY);
        if (saved) {
          setTips(JSON.parse(saved));
          setLoading(false);
        }

        // 2️⃣ Intentar actualizar desde la URL remota
        const response = await fetch(import.meta.env.VITE_REMOTE_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo cargar el JSON remoto");
        const remoteData = await response.json();
        if (Array.isArray(remoteData)) {
          setTips(remoteData);
          localStorage.setItem(import.meta.env.VITE_STORAGE_KEY, JSON.stringify(remoteData));
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los tips");
      } finally {
        setLoading(false);
      }
    }

    loadTips();
  }, []);

  // 3️⃣ Cada vez que cambien los tips, actualizar localStorage
  useEffect(() => {
    if (tips.length > 0) {
      localStorage.setItem(import.meta.env.VITE_STORAGE_KEY, JSON.stringify(tips));
    }
  }, [tips]);

  return { tips, setTips, loading, error };
}
