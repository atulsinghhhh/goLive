import Link from "next/link";

interface StreamCardProps {
    stream: {
        _id: string;
        title: string;
        category: string;
        agoraChannel: string;
        viewerCount: number;
        streamerId: {
            username: string;
        };
    };
}

export const StreamCard = ({ stream }: StreamCardProps) => {
  return (
    <Link href={`/stream/${stream.agoraChannel}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail Placeholder */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2 transition-transform group-hover:translate-y-[-4px] group-hover:shadow-xl group-hover:shadow-purple-900/20 border border-zinc-800 group-hover:border-purple-600/50">
           {/* Gradient or Image */}
           <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900 group-hover:from-zinc-800 group-hover:to-zinc-800 transition-colors"></div>
           
           {/* Center Channel Initial */}
           <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-4xl font-bold text-zinc-700 group-hover:text-purple-500 transition-colors uppercase">
                   {stream.agoraChannel[0]}
               </span>
           </div>

           {/* Live Badge */}
           <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
               LIVE
           </div>
           
           {/* Viewer Count */}
           <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
               {stream.viewerCount} viewers
           </div>
        </div>

        {/* Meta */}
        <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-white font-bold uppercase text-sm">
                 {stream.streamerId?.username?.[0] || "?"}
             </div>
             <div className="overflow-hidden">
                 <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors" title={stream.title}>
                     {stream.title}
                 </h3>
                 <p className="text-sm text-gray-400 truncate">
                     {stream.streamerId?.username || "Unknown"}
                 </p>
                 <p className="text-xs text-gray-500 mt-0.5">
                     {stream.category}
                 </p>
             </div>
        </div>
      </div>
    </Link>
  );
};
