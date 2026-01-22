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
            avatar?: string;
        };
    };
}

export const StreamCard = ({ stream }: StreamCardProps) => {
  return (
    <Link href={`/stream/${stream.agoraChannel}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail Placeholder */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2 transition-transform group-hover:translate-y-[-4px] group-hover:shadow-xl group-hover:shadow-primary/20 border border-border group-hover:border-primary/50">
           {/* Gradient or Image */}
           <div className="absolute inset-0 bg-linear-to-br from-card to-muted group-hover:from-card group-hover:to-card transition-colors"></div>
           
           {/* Center Channel Initial */}
           <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-4xl font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase">
                   {stream.agoraChannel[0]}
               </span>
           </div>

           {/* Live Badge */}
           <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
               LIVE
           </div>
           
           {/* Viewer Count */}
           <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
               {stream.viewerCount} viewers
           </div>
        </div>

        {/* Meta */}
        <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-muted shrink-0 relative overflow-hidden flex items-center justify-center border border-border">
                 {stream.streamerId?.avatar ? (
                     <img src={stream.streamerId.avatar} alt={stream.streamerId.username} className="object-cover w-full h-full" />
                 ) : (
                     <div className="text-muted-foreground font-bold uppercase text-sm">
                        {stream.streamerId?.username?.[0] || "?"}
                     </div>
                 )}
             </div>
             <div className="overflow-hidden">
                 <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors" title={stream.title}>
                     {stream.title}
                 </h3>
                 <p className="text-sm text-muted-foreground truncate">
                     {stream.streamerId?.username || "Unknown"}
                 </p>
                 <p className="text-xs text-muted-foreground/80 mt-0.5">
                     {stream.category}
                 </p>
             </div>
        </div>
      </div>
    </Link>
  );
};
