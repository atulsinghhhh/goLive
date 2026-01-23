import Link from "next/link";
import Image from "next/image";

interface StreamCardProps {
    stream: {
        _id: string;
        title: string;
        category: string;
        agoraChannel: string;
        viewerCount: number;
        thumbnailUrl?: string;
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
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3 transition-all duration-300 group-hover:scale-[1.02] group-hover:translate-y-[-4px] group-hover:shadow-2xl group-hover:shadow-primary/20 border border-border/50 group-hover:border-primary/50">
           {stream.thumbnailUrl ? (
               <Image 
                   src={stream.thumbnailUrl} 
                   alt={stream.title} 
                   fill
                   className="object-cover" 
               />
           ) : (
               <>
                   <div className="absolute inset-0 bg-linear-to-br from-card to-muted group-hover:from-card group-hover:to-card transition-colors"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-4xl font-bold text-muted-foreground/50 group-hover:text-primary transition-colors uppercase tracking-widest">
                           {stream.agoraChannel[0]}
                       </span>
                   </div>
               </>
           )}

           {/* Live Badge */}
           <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
               LIVE
           </div>
           
           {/* Viewer Count */}
           <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1.5 border border-white/10">
               <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></span>
               {stream.viewerCount} viewers
           </div>
        </div>

        {/* Meta */}
        <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-muted shrink-0 relative overflow-hidden flex items-center justify-center border border-border/50 group-hover:border-primary/50 transition-colors">
                 {stream.streamerId?.avatar ? (
                     <Image src={stream.streamerId.avatar} alt={stream.streamerId.username} fill className="object-cover" />
                 ) : (
                     <div className="text-muted-foreground font-bold uppercase text-sm">
                        {stream.streamerId?.username?.[0] || "?"}
                     </div>
                 )}
             </div>
             <div className="overflow-hidden flex-1">
                 <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors leading-tight mb-0.5" title={stream.title}>
                     {stream.title}
                 </h3>
                 <p className="text-sm text-muted-foreground truncate hover:text-foreground transition-colors">
                     {stream.streamerId?.username || "Unknown"}
                 </p>
                 <p className="text-xs text-muted-foreground/60 mt-0.5 truncate uppercase tracking-wider font-semibold">
                     {stream.category}
                 </p>
             </div>
        </div>
      </div>
    </Link>
  );
};
