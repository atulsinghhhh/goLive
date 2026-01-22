
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface StreamSetupProps {
  initialTitle?: string;
  initialCategory?: string;
  onSave?: (title: string, category: string) => void;
  isLive?: boolean;
}

export const StreamSetup = ({ initialTitle = "", initialCategory = "Just Chatting", onSave, isLive = false }: StreamSetupProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (newTitle: string, newCategory: string) => {
      setTitle(newTitle);
      setCategory(newCategory);
      setIsDirty(true);
      if (onSave) onSave(newTitle, newCategory);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
    >
      <h2 className="text-xl font-bold text-white mb-6">Stream Info</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(e.target.value, category)}
            placeholder="Enter a catchy title for your stream..."
            className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            disabled={isLive} // Optional: allow editing while live? Twitch allows it. 
          />
          <p className="text-xs text-zinc-600">Catchy titles attract more viewers!</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => handleChange(title, e.target.value)}
            className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
          >
            <option>Just Chatting</option>
            <option>Gaming</option>
            <option>Coding</option>
            <option>Music</option>
            <option>IRL</option>
            <option>Creative</option>
          </select>
        </div>
        
        {/* Visual feedback for unsaved changes could go here if we were doing manual save */}
      </div>
    </motion.div>
  );
};
