import React from "react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    isPositive?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export function MetricsCard({ title, value, subtext, isPositive, className, icon }: MetricsCardProps) {
    return (
        <div className={cn("p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700 transition-colors", className)}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
                {icon && <div className="text-zinc-500">{icon}</div>}
            </div>
            <div>
                <div className="text-3xl font-bold text-white mb-1">
                    {value}
                </div>
                {subtext && (
                    <div className={cn("text-xs flex items-center gap-1 font-medium",
                        isPositive === true ? "text-emerald-400" :
                            isPositive === false ? "text-rose-400" : "text-zinc-500"
                    )}>
                        {isPositive !== undefined && (
                            <span>{isPositive ? '↗' : '↘'}</span>
                        )}
                        {subtext}
                    </div>
                )}
            </div>
        </div>
    );
}
