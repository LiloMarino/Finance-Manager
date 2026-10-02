import { type ReactNode, useCallback, useEffect, useState } from "react";

import { PRIVACY_STORAGE_KEY, PrivacyContext } from "@/shared/hooks/use-privacy";
import { readStored, writeStored } from "@/shared/lib/browser-storage";

/** O modo de ocultar valores: some todo valor em R$ e toda quantidade; percentual e a
forma dos gráficos ficam. Ctrl+Shift+H liga e desliga. */
export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHiddenState] = useState(() => readStored(PRIVACY_STORAGE_KEY) === "1");
  const setHidden = useCallback((next: boolean) => {
    setHiddenState(next);
    writeStored(PRIVACY_STORAGE_KEY, next ? "1" : null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setHiddenState((current) => {
          writeStored(PRIVACY_STORAGE_KEY, current ? null : "1");
          return !current;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <PrivacyContext value={{ hidden, setHidden }}>{children}</PrivacyContext>;
}
