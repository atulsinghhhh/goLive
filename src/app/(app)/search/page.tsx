
import { Stream } from "@/model/stream.model";
import { User } from "@/model/user.model";
import dbConnect from "@/lib/db";
import { StreamCard } from "@/components/stream-card";
import Link from "next/link";
import { Search } from "lucide-react";
import Image from "next/image";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  await dbConnect();
  const { q } = await searchParams;

  if (!q) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
            <Search size={48} className="mb-4 opacity-50" />
            <p>Type something to search...</p>
        </div>
    );
  }

  const streams = await Stream.find({ // TODO: WRITE THE BACKEND IN ANOTHER FILES.
    $or: [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
    ],
    isLive: true
  }).populate("streamerId", "username avatar").lean();

  const users = await User.find({
    $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } }
    ]
  }).limit(5).lean();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-foreground">
        Search Results for <span className="text-primary">&quot;{q}&quot;</span>
      </h1>

      {users.length > 0 && (
          <section>
              <h2 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wider">Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user: { _id: string; avatar?: string; username: string; name?: string }) => (
                      <Link 
                        key={user._id.toString()} 
                        href={`/u/${user.username}`}
                        className="flex items-center gap-4 p-4 bg-card hover:bg-muted/50 border border-border rounded-xl transition-colors"
                      >
                          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden relative border border-border">
                              {user.avatar ? (
                                  <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                              ) : (
                                  <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold">
                                      {user.username[0].toUpperCase()}
                                  </div>
                              )}
                          </div>
                          <div>
                              <p className="font-bold text-foreground">{user.username}</p>
                              {user.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
                          </div>
                      </Link>
                  ))}
              </div>
          </section>
      )}

      <section>
          <h2 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wider">Live Streams</h2>
          {streams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {streams.map((stream: { _id: { toString(): string }; title: string; category: string; agoraChannel: string; viewerCount: number; thumbnailUrl?: string; streamerId: { username: string; avatar?: string } }) => (
                      <StreamCard key={stream._id.toString()} stream={{
                          ...stream, 
                          _id: stream._id.toString(),
                          streamerId: {
                              username: stream.streamerId.username,
                              avatar: stream.streamerId.avatar
                          }
                      }} />
                  ))}
              </div>
          ) : (
              <p className="text-muted-foreground italic">No live streams found matching &quot;{q}&quot;.</p>
          )}
      </section>
    </div>
  );
}
