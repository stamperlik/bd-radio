import React, { createContext, useEffect, useMemo, useState } from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

export interface VisibilityProviderValue {
  setVisible: (visible: boolean) => void;
  visible: boolean;
}

export const VisibilityCtx = createContext<VisibilityProviderValue>(
  {} as VisibilityProviderValue
);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);

  useNuiEvent<boolean>("setVisible", setVisible);

  useEffect(() => {
    if (!visible) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (["Escape"].includes(e.code)) {
        if (!isEnvBrowser()) {
          fetchNui("hideFrame");
        }
      }
    };

    window.addEventListener("keydown", keyHandler);

    return () => window.removeEventListener("keydown", keyHandler);
  }, [visible]);

  const value = useMemo(() => {
    return {
      visible,
      setVisible,
    };
  }, [visible]);

  return (
    <VisibilityCtx.Provider value={value}>
      <div
        style={{ visibility: visible ? "visible" : "hidden" }}
        className="h-[100vh]"
      >
        {children}
      </div>
    </VisibilityCtx.Provider>
  );
};
