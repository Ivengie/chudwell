import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ModalContext = createContext(null);

// One popup at a time: openModal("book", { id: 3 })
export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const openModal = useCallback((name, props = {}) => setModal({ name, props }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ modal, openModal, closeModal }), [modal, openModal, closeModal]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export const useModal = () => useContext(ModalContext);
