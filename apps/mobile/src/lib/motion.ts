import { useReducedMotion } from 'react-native-reanimated';
import { useSettings } from '@/state/settings';

/** True when animations should be minimised (system setting or in-app override). */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const pref = useSettings((s) => s.motion);
  if (pref === 'reduced') return true;
  if (pref === 'full') return false;
  return system;
}
