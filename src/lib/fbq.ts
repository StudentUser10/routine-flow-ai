// Meta Pixel helper – thin wrapper so we don't scatter `window.fbq` everywhere
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}
