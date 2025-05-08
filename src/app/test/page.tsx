import { AppButton } from '@/components/button/AppButton';
import React from 'react';

export default function TestPage() {
    return (
        <main style={{ padding: 32 }}>
            {/* Primary */}
            <AppButton variant="primary" size="small">Primary Small Hover</AppButton>

            {/* Secondary */}
            <AppButton variant="secondary" size="large" state="idle">Secondary Large Idle</AppButton>

            {/* Destructive */}
            <AppButton variant="destructive" size="small">Destructive Small</AppButton>
        </main>
    );
}