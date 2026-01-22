"use client";

import type { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export const createAgoraClient = async (): Promise<IAgoraRTCClient | null> => {
  if (typeof window === "undefined") return null;
  
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

  return AgoraRTC.createClient({ 
    mode: "live", 
    codec: "vp8" 
  });
};

