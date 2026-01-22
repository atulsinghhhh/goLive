
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2, Save, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Local state for form
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        bio: "",
        avatar: ""
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
             setFormData({
                username: session.user.username || "",
                name: session.user.name || "",
                bio: session.user.bio || "",
                avatar: session.user.image || ""
            });
        }
    }, [session]);

    if (!mounted) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Signature
            const signRes = await fetch("/api/upload/signature", { method: "POST" });
            const signData = await signRes.json();
            
            if (!signData.signature) throw new Error("Failed to get signature");

            // 2. Upload to Cloudinary
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("api_key", signData.apiKey);
            uploadData.append("timestamp", signData.timestamp.toString());
            uploadData.append("signature", signData.signature);
            uploadData.append("folder", "twitch-clone");

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
                method: "POST",
                body: uploadData
            });
            const result = await uploadRes.json();

            if (result.secure_url) {
                setFormData(prev => ({ ...prev, avatar: result.secure_url }));
            }

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                // Update session
                await update({
                    user: {
                        name: formData.name,
                        image: formData.avatar,
                        username: formData.username
                    }
                });
                router.refresh();
                alert("Profile updated!");
                router.push(`/u/${formData.username}`);
            } else {
                alert("Update failed");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex justify-center">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-8 h-fit">
                <h1 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-4">Profile Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group">
                            {formData.avatar ? (
                                <Image src={formData.avatar} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <UserIcon size={32} />
                                </div>
                            )}
                            <div 
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold">Profile Picture</h3>
                            <p className="text-sm text-zinc-400 mb-2">Must be JPEG, PNG, or GIF.</p>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-purple-400 hover:text-purple-300 font-bold"
                            >
                                Upload New Picture
                            </button>
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-1">Username</label>
                            <input 
                                type="text" 
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-1">Display Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-1">Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                rows={4}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-800">
                        <button 
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
