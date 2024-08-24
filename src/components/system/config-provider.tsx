"use client";

import { createContext, PropsWithChildren, useCallback, useMemo, useState } from "react";

type Config = {
  interactiveElements: HTMLElement[];
  addInteractiveElements: (...els: Config["interactiveElements"]) => void;
  removeInteractiveElements: (...els: Config["interactiveElements"]) => void;
};

export const ConfigContext = createContext<Config>({} as Config);

type ConfigProviderProps = Readonly<PropsWithChildren>;

export default function ConfigProvider({ children }: ConfigProviderProps) {
  const [interactiveEls, setInteractiveEls] = useState<Config["interactiveElements"]>([]);

  const addInteractiveEls: Config["addInteractiveElements"] = useCallback((...els) => {
    const ids = els.map((el) => el.id);

    setInteractiveEls((pEls) => pEls.filter(({ id }) => !ids.includes(id)).concat(els));
  }, []);

  const removeInteractiveEls: Config["addInteractiveElements"] = useCallback((...els) => {
    const ids = els.map((el) => el.id);

    setInteractiveEls((pEls) => pEls.filter(({ id }) => !ids.includes(id)));
  }, []);

  const initialValues = useMemo<Config>(
    () => ({
      interactiveElements: interactiveEls,
      addInteractiveElements: addInteractiveEls,
      removeInteractiveElements: removeInteractiveEls,
    }),
    [addInteractiveEls, interactiveEls, removeInteractiveEls]
  );

  return <ConfigContext.Provider value={initialValues}>{children}</ConfigContext.Provider>;
}
