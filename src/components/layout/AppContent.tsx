"use client";

import { BottomNavBar } from "./BottomNavBar";
import React, { useState, useEffect } from "react";
import { useLinguaLift } from "@/hooks/useLinguaLift";
import { cn } from "@/lib/utils";

export function AppContent({ children }: { children: React.ReactNode }) {
    const { isQuizInProgress } = useLinguaLift();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const showNavBar = isMounted && !isQuizInProgress;
    const mainClassName = cn({
        'pb-24': showNavBar,
    });

    return (
        <div className="min-h-screen">
            <main className={mainClassName}>{children}</main>
            {showNavBar && <BottomNavBar />}
        </div>
    )
}
