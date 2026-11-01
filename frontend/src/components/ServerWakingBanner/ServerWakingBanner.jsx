import { useSyncExternalStore } from "react";
import {
  getServerWakingSnapshot,
  subscribeServerWaking,
} from "../../services/api";

const ServerWakingBanner = () => {
  const isWaking = useSyncExternalStore(
    subscribeServerWaking,
    getServerWakingSnapshot,
  );

  if (!isWaking) return null;

  return (
    <div
      role="status"
      className="bg-accent/10 px-4 py-2 text-center text-[13px] text-accent-soft"
    >
      Despertando el servidor… el hosting gratuito puede tardar hasta 30
      segundos en responder la primera vez.
    </div>
  );
};

export default ServerWakingBanner;
