"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

export interface TabbedDrawerTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabbedDrawerProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  tabs: TabbedDrawerTab[];
  defaultTab?: string;
  actions?: React.ReactNode;
}

export function TabbedDrawer({
  title,
  description,
  open,
  onClose,
  tabs,
  defaultTab,
  actions,
}: TabbedDrawerProps) {
  const firstTab = defaultTab ?? tabs[0]?.id;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:justify-end sm:p-6",
        open ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "w-full max-w-md transform transition-all duration-300",
          open ? "translate-y-0" : "translate-y-8"
        )}
      >
        <Panel className="pointer-events-auto bg-background/95 shadow-2xl backdrop-blur">
          <PanelHeader className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <PanelTitle>{title}</PanelTitle>
              {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </PanelHeader>
          <PanelContent className="pt-3">
            <Tabs defaultValue={firstTab} className="flex h-full flex-col gap-4">
              <TabsList className="flex w-full gap-2 overflow-x-auto rounded-md bg-muted/40 p-1 text-xs">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="shrink-0 px-3 py-1">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="flex-1 overflow-y-auto">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
