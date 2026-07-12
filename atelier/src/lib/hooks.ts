import { useEffect, useRef } from "react";

/* Runs `onPulse` whenever the monotonically-incrementing `pulse` counter
   changes. The initial value is treated as "already seen", so the callback
   only fires on subsequent increments — the pattern the store's *Pulse
   fields (windPulse, capturePulse) are built around. */
export function usePulse(pulse: number, onPulse: () => void) {
  const seen = useRef(pulse);
  useEffect(() => {
    if (pulse === seen.current) return;
    seen.current = pulse;
    onPulse();
    // onPulse is intentionally excluded: it is a fresh closure each render,
    // and we only want to react to pulse changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse]);
}
