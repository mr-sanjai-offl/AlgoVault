import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="glass-card p-card-padding rounded-xl flex flex-col gap-unit">
      <h2 className="text-label-caps font-label-caps text-on-surface-variant mb-2 uppercase tracking-widestest">{title}</h2>
      <div className="flex flex-col gap-stack-space">
        {children}
      </div>
    </section>
  );
}
