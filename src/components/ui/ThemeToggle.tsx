import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme } = useDarkMode();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Cambiar tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
