
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

export const StatsCard = ({ label, value, icon, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Reduced movement
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{label}</h3>
        <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{value}</p>
      </div>
    </motion.div>
  );
};
