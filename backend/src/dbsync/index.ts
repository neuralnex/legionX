import { pollMarketplaceEvents } from "./poller";

export function startDBsyncMonitor() {
  setInterval(async () => {
    try {
      await pollMarketplaceEvents();
      // Optionally: pollSubscriptionExpirations();
    } catch (err) {
      console.error("DBsync monitor error:", err);
    }
  }, 10000); // Every 10s
}


