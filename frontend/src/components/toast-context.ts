import { createContext, useContext } from "react";

export type ShowToast = (message: string) => void;

export const ToastContext = createContext<ShowToast>(() => {});

/** Show a short confirmation message, e.g. toast("Project deleted"). */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}
