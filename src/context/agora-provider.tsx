"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { createAgoraClient } from "../lib/agora/client";

interface AgoraContextType {
  client: IAgoraRTCClient | null;
}

const AgoraContext = createContext<AgoraContextType>({ client: null });

export const useAgora = () => useContext(AgoraContext);

export function AgoraProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  useEffect(() => {
    let agoraClient: IAgoraRTCClient | null = null;

    const init = async () => {
      agoraClient = await createAgoraClient();
      setClient(agoraClient);
    };

    init();

    return () => {
      // agoraClient?.leave(); // Optional cleanup if needed, but usually handled by components leave() logic
    };
  }, []);

  return (
    <AgoraContext.Provider value={{ client }}>
      {children}
    </AgoraContext.Provider>
  );
}
