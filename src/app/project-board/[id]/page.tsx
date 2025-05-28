"use client";

import AuthGuard from '@/components/auth/auth-guard';
import { Board } from '@/components/board/Board';

export default function ProjectBoardPage() {
    return (
        <AuthGuard>
            <div>
                <Board />
            </div>
        </AuthGuard>
    );
}