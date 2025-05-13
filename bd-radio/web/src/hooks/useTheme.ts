import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return { theme, setTheme };
};
