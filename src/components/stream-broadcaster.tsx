"use client";

import { useEffect, useRef, useState } from "react";
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { useAgora } from "../context/agora-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";

export const StreamBroadcaster = ({ channelName }: { channelName: string }) => {
  const { data: session } = useSession();
  const { client } = useAgora();
  const router = useRouter();
  
  const [joined, setJoined] = useState(false);
  const [published, setPublished] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  
  const videoRef = useRef<HTMLDivElement>(null);

  // Poll for viewer count
  useEffect(() => {
      if (!published) return;
      
      const interval = setInterval(async () => {
             try {
                 const resp = await fetch(`/api/stream?channelName=${channelName}`);
                 const data = await resp.json();
                 if (data.stream) {
                     setViewerCount(data.stream.viewerCount || 0);
                 }
             } catch (e) {
                 console.error("Failed to fetch viewer count", e);
             }
      }, 5000);
      
      return () => clearInterval(interval);
  }, [published, channelName]);

  // Initialize and Auto-Join
  useEffect(() => {
    if (!client) return;
    
    // Prevent race conditions with a ref
    let isMounted = true;

    const init = async () => {
      try {
        const resp = await fetch(`/api/token?channelName=${channelName}&role=publisher`);
        const data = await resp.json();
        
        if (!data.token) throw new Error("Failed to get token");

        if (!isMounted) return;

        // Check if already connected to avoid INVALID_OPERATION
        if (client.connectionState === "DISCONNECTED") {
             await client.join(process.env.NEXT_PUBLIC_APP_ID!, channelName, data.token, data.uid);
             if (isMounted) setJoined(true);
        }

        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        if (!isMounted) {
            microphoneTrack.close();
            cameraTrack.close();
            return;
        }

        setLocalAudioTrack(microphoneTrack);
        setLocalVideoTrack(cameraTrack);
        
        // Auto-publish nicely
        await client.setClientRole("host");
        await client.publish([microphoneTrack, cameraTrack]);
        if (isMounted) setPublished(true);

        if (videoRef.current) {
          cameraTrack.play(videoRef.current);
        }
      } catch (error) {
        console.error("Failed to initialize stream:", error);
      }
    };

    init();

    return () => {
      isMounted = false;
      localAudioTrack?.close();
      localVideoTrack?.close();
      // Leave purely on unmount
      client.leave().catch(err => console.error("Failed to leave channel", err));
    };
  }, [client, channelName]);

  const toggleMic = async () => {
      if (localAudioTrack) {
          await localAudioTrack.setEnabled(!micOn);
          setMicOn(!micOn);
      }
  };

  const toggleCamera = async () => {
      if (localVideoTrack) {
          await localVideoTrack.setEnabled(!cameraOn);
          setCameraOn(!cameraOn);
      }
  };

  const endStream = async () => {
      try {
          // Get stream ID first to update DB
          const resp = await fetch(`/api/stream?channelName=${channelName}`);
          const data = await resp.json();
          
          if (data.stream?._id) {
               await fetch("/api/stream", {
                  method: "PUT",
                  body: JSON.stringify({ streamId: data.stream._id, isLive: false })
              });
          }
      } catch (e) {
          console.error("Failed to update stream status", e);
      } finally {
          router.push("/dashboard");
      }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 group">
        <div ref={videoRef} className="w-full h-full" />
        
        {/* Overlays */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold animate-pulse">
                LIVE
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-2">
                <Users size={12} /> {viewerCount}
            </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/80 backdrop-blur-lg rounded-full border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={toggleMic}
                className={`p-3 rounded-full transition-colors ${micOn ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
                onClick={toggleCamera}
                className={`p-3 rounded-full transition-colors ${cameraOn ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
                 {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <div className="w-px h-8 bg-zinc-700 mx-2"></div>
            <button 
                onClick={endStream}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors"
            >
                <PhoneOff size={16} /> End Stream
            </button>
        </div>
    </div>
  );
};
