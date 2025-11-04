import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { toast } from "sonner";
import {
  Clipboard,
  Download,
  Filter,
  ListFilter,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { useLocalStorageTips } from "./hooks/useLocalStorageTips";

// Tip type definition
interface Tip {
  id: string;
  title: string;
  content: string; // plain text or code
  category: string; // e.g., "Git", "Docker", "CI/CD", "Linux", "Node", etc.
  tags: string[];
  type: "note" | "code" | "checklist";
  createdAt: number;
}

function formatMultiline(text: string) {
  return text.split("\n").map((line, i) => (
    <div key={i} className="font-mono text-sm whitespace-pre-wrap leading-6">
      {line}
    </div>
  ));
}

// =======================================================
// TIP CARD
// =======================================================
function TipCard({
  tip,
  onDelete,
  onCopy,
  onEdit,
}: {
  tip: Tip;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onEdit: (tip: Tip) => void;
}) {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col border-2
    ${
      tip.type === "note"
        ? "border-amber-500" // 🟡 notas
        : tip.type === "checklist"
        ? "border-emerald-500" // 🟢 checklist
        : tip.type === "code"
        ? "border-sky-500" // 🔵 código
        : "border-border" // por defecto (neutro)
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 justify-between">
          <CardTitle className="text-base font-semibold">{tip.title}</CardTitle>
          <div className="flex items-center gap-2">
            {tip.type !== "note" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCopy(tip.content)}
                title="Copiar"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(tip)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(tip.id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary">{tip.category}</Badge>
          {tip.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <pre
          className={`rounded-lg p-3 ${
            tip.type === "code" ? "bg-muted" : "bg-transparent"
          }`}
        >
          {formatMultiline(tip.content)}
        </pre>
      </CardContent>
    </Card>
  );
}

// =======================================================
// EDIT DIALOG
// =======================================================
function EditTipDialog({
  tip,
  onSave,
  onClose,
}: {
  tip: Tip;
  onSave: (t: Tip) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(tip.title);
  const [content, setContent] = useState(tip.content);
  const [category, setCategory] = useState(tip.category);
  const [tags, setTags] = useState(tip.tags.join(", "));
  const [type, setType] = useState<Tip["type"]>(tip.type);

  function guardar() {
    const actualizado = {
      ...tip,
      title,
      content,
      category,
      tags: tags.split(",").map((t) => t.trim()),
      type,
    };
    onSave(actualizado);
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Tip</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <p>Titulo</p>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p>Categoria</p>
            <Input
              placeholder="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
             <p>Tags (separados por comas)</p>
            <Input
              placeholder="Tags (separadas por comas)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
           <div className="flex items-center gap-3 text-sm mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="edit-type"
                checked={type === "note"}
                onChange={() => setType("note")}
              />
              Nota
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="edit-type"
                checked={type === "code"}
                onChange={() => setType("code")}
              />
              Código
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="edit-type"
                checked={type === "checklist"}
                onChange={() => setType("checklist")}
              />
              Checklist
            </label>
          </div>
          <p>Contenido</p>
          <Textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={guardar}>Guardar cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =======================================================
// APP PRINCIPAL
// =======================================================
export default function DeployNotesApp() {
  const { tips, setTips, loading, error } = useLocalStorageTips();
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tab, setTab] = useState("todo");
  const [tipEditando, setTipEditando] = useState<Tip | null>(null);

  // -----------------------------------
  // SINCRONIZACIÓN CON GIST
  // -----------------------------------

  async function syncConGist(tips: Tip[]) {
    try {
      await fetch("/api/update-gist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tips }),
      });
      toast.success("Gist sincronizado con éxito");
    } catch (err) {
      toast.error("No se pudo sincronizar con el Gist");
      console.log(err);
    }
  }

  // -----------------------------------
  // HANDLERS
  // -----------------------------------
  function handleDelete(id: string) {
    setTips((prev) => {
      const nuevos = prev.filter((t) => t.id !== id);
      syncConGist(nuevos); // 🔄 sincroniza después de eliminar
      toast.success("Tip eliminado y sincronizado");
      return nuevos;
    });
  }

  function handleEdit(editedTip: Tip) {
    setTips((prev) => {
      const nuevos = prev.map((t) => (t.id === editedTip.id ? editedTip : t));
      syncConGist(nuevos); // 🔄 sincroniza después de editar
      toast.success("Tip actualizado y sincronizado");
      return nuevos;
    });
  }

  function handleCopy(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => toast("Copiado al portapapeles"));
  }

  function handleAdd(tip: Tip) {
    setTips((prev) => {
      const nuevos = [tip, ...prev];
      syncConGist(nuevos);
      return nuevos;
    });
    toast("Tip agregado");
  }

  // -----------------------------------
  // FILTRADO Y ESTADO
  // -----------------------------------

  const categories = useMemo(
    () => Array.from(new Set(tips.map((t) => t.category))).sort(),
    [tips]
  );
  const tags = useMemo(
    () => Array.from(new Set(tips.flatMap((t) => t.tags))).sort(),
    [tips]
  );

  if (loading) return <div className="p-8 text-center">Cargando tips...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const filtered = tips.filter((t) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      [t.title, t.content, t.category, t.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchesCat =
      selectedCats.length === 0 || selectedCats.includes(t.category);
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => t.tags.includes(tag));
    const matchesTab = tab === "todo" ? true : t.type === tab;
    return matchesQuery && matchesCat && matchesTags && matchesTab;
  });

  async function actualizarDesdeNube() {
    toast.info("Actualizando desde Gist...");
    try {
      const res = await fetch(import.meta.env.VITE_REMOTE_URL, {
        cache: "no-store",
      });
      if (!res.ok){
        toast.error(`HTTP ${res.status}`)
        throw new Error(`HTTP ${res.status}`); // si no existe una respuesta buena mostramos el error
      } 
      const data = await res.json();
      if (Array.isArray(data)) {
        setTips(data);
        localStorage.setItem(
          import.meta.env.VITE_STORAGE_KEY,
          JSON.stringify(data)
        );
        toast.success("Datos actualizados desde la nube");
        localStorage.setItem("deploy_notes_last_sync", new Date().toISOString());
      }
    } catch (err) {
      toast.error("No se pudo actualizar desde la nube");
      console.error("Error al sincronizar desde Gist:", err);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(tips, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deploy-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Tip[];
        console.log(data);
        if (!Array.isArray(data)) throw new Error("Formato inválido");
        setTips(data);
        toast("Importado correctamente");
      } catch (e) {
        toast("No se pudo importar el archivo");
        console.log(`Error en importJSON : ${e}`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Mis Tips de Deploy
            </h1>
            <p className="text-muted-foreground">
              Tu página rápida para comandos, checklists y notas de despliegue.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AddTipDialog onAdd={handleAdd} categories={categories} />
            <Button
              variant="secondary"
              onClick={exportJSON}
              title="Exportar JSON"
            >
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
            <label className="inline-flex items-center gap-2">
              <input
                type="file"
                className="hidden"
                accept="application/json"
                onChange={(e) =>
                  e.target.files &&
                  e.target.files[0] &&
                  importJSON(e.target.files[0])
                }
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" /> Importar
                </span>
              </Button>
            </label>
            {/*    <Button variant="destructive" onClick={handleResetToDefaults} title="Restaurar ejemplos">
              <RefreshCw className="h-4 w-4 mr-2" /> Restaurar
            </Button> */}
            <Button variant="outline" onClick={actualizarDesdeNube}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualizar desde 🌐
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <Separator className="my-4" />

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <Input
              placeholder="Buscar (título, contenido, tag, categoría)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="todo">Todo</TabsTrigger>
                <TabsTrigger value="code">Código</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="note">Notas</TabsTrigger>
              </TabsList>
            </Tabs>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ListFilter className="h-4 w-4" /> Categorías
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-64 overflow-auto"
              >
                {categories.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c}
                    checked={selectedCats.includes(c)}
                    onCheckedChange={(v) =>
                      setSelectedCats((prev) =>
                        v ? [...prev, c] : prev.filter((x) => x !== c)
                      )
                    }
                  >
                    {c}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" /> Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-64 overflow-auto"
              >
                {tags.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    checked={selectedTags.includes(t)}
                    onCheckedChange={(v) =>
                      setSelectedTags((prev) =>
                        v ? [...prev, t] : prev.filter((x) => x !== t)
                      )
                    }
                  >
                    {t}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {(selectedCats.length > 0 || selectedTags.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCats([]);
                  setSelectedTags([]);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onEdit={(t) => setTipEditando(t)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16">
              No hay resultados con esos filtros.
            </div>
          )}
        </section>
        {tipEditando && (
          <EditTipDialog
            tip={tipEditando}
            onSave={(nuevo) => {
              handleEdit(nuevo);
              setTipEditando(null);
            }}
            onClose={() => setTipEditando(null)}
          />
        )}
        <footer className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <span className="font-mono">{tips.length}</span> tips guardados
          </div>
          <div className="flex items-center gap-2">
            <span>Atajo: </span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border">/</kbd>
            <span>para enfocar búsqueda</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Última sincronización:{" "}
            {new Date(localStorage.getItem("deploy_notes_last_sync") || Date.now()).toLocaleString()}
          </div>
        </footer>
      </div>
    </div>
  );
}

function AddTipDialog({
  onAdd,
  categories,
}: {
  onAdd: (t: Tip) => void;
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "General");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<Tip["type"]>("note");
  const [content, setContent] = useState("");

  function submit() {
    if (!title.trim()) return toast("Agrega un título");
    if (!content.trim()) return toast("Agrega contenido");

    const tip: Tip = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      category: category.trim() || "General",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      type,
      createdAt: Date.now(),
    };

    onAdd(tip);
    toast.success("Tip agregado y sincronizado");
    setOpen(false);
    resetForm();
  }

    function resetForm() {
      setTitle("");
      setContent("");
      setTags("");
      setCategory(categories[0] ?? "General");
      setType("note");
    }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/") {
        const input = document.querySelector<HTMLInputElement>(
          "input[placeholder^='Buscar']"
        );
        input?.focus();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo tip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar tip</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Categoría (Git/Docker/Node/Infra…)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              placeholder="Tags (coma separadas)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={type === "note"}
                onChange={() => setType("note")}
              />
              Nota
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={type === "code"}
                onChange={() => setType("code")}
              />
              Código
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={type === "checklist"}
                onChange={() => setType("checklist")}
              />
              Checklist
            </label>
          </div>
          <Textarea
            rows={8}
            placeholder={
              type === "code"
                ? "Pega aquí tu snippet…"
                : "Escribe tu nota o checklist (una línea por ítem)…"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} className="gap-2">
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
