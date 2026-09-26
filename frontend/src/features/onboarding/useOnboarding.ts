import { useCallback } from "react";
import { useLocalState } from "../../lib/localStore";

type OnboardingState = { welcomeSeen: boolean; checklistHidden: boolean };

const INITIAL: OnboardingState = { welcomeSeen: false, checklistHidden: false };

/** First-run flags, per user, kept in the browser. */
export function useOnboarding(userId: string) {
  const [state, setState] = useLocalState<OnboardingState>(`architect.onboarding.${userId}`);

  const markWelcomeSeen = useCallback(() => setState({ ...(state ?? INITIAL), welcomeSeen: true }), [state, setState]);
  const hideChecklist = useCallback(() => setState({ ...(state ?? INITIAL), checklistHidden: true }), [state, setState]);

  return { ...(state ?? INITIAL), markWelcomeSeen, hideChecklist };
}
