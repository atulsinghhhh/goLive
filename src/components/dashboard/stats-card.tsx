
"use client";

import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string; // e.g. "+5%"
  trendColor?: "green" | "red" | "gray";
  delay?: number;
}

export const StatsCard = ({ label, value, icon, trend, trendColor = "green", delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-purple-500/30 transition-colors group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trendColor === "green" ? "bg-green-500/10 text-green-400" : 
            trendColor === "red" ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{label}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};
