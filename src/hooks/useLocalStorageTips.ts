import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: "note" | "code" | "checklist";
  createdAt: number;
}

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "deploy_notes_v1";
const REMOTE_URL = import.meta.env.VITE_REMOTE_URL;

// ⚙️ URL de tu JSON remoto (por ejemplo, un archivo en GitHub)


export function useLocalStorageTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // si existe en el LS lo pasamos a tips
    if(stored){
      try {
        const parsed = JSON.parse(stored) as Tip[];
        setTips(parsed);
        setLoading(false);
        toast.success("Datos cargados desde LocalStorage , utilice Actualizar desde si quiere sync");
        console.log("Datos cargados desde LocalStorage")
      } catch {
        console.warn("Error leyendo localStorage, se limpiara");
        localStorage.removeItem(STORAGE_KEY)
      }
      // si no existe el LS llamamos a la url
    } else{
      console.log("🌐 Descargando datos iniciales desde Gist...")
      fetch(REMOTE_URL , {cache : "no-store"})
      .then((res) => res.json())
      .then((data) => {
        // verificamos que sea un array y lo pasamos a tips y al LS
        if(Array.isArray(data)){
          setTips(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          toast.success("Datos cargados desde Gist");
        } else{
          throw new Error("Formato remoto no valido");
        }
      })
      .catch((err)=>{
        console.error("❌ Error cargando desde Gist:", err);
        setError("No se pudieron obtener los datos iniciales.");
      })
      .finally(()=> setLoading(false)); // terminamos de cargar
    }
  }, []); // se ejecuta cuando se monta el componente
  
  // se ejecuta cada vez que cambian los tips o el loading
  // pasamos los items al LS
  useEffect(() => {
    if (!loading && tips.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tips));
    }
  }, [tips, loading]);

  return { tips, setTips, loading, error };
}
