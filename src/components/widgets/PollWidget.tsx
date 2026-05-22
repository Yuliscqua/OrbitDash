import React, { useState } from "react";
import { CheckCircle2, TrendingUp, Clock } from "lucide-react";
import type { WidgetConfig, DisplayMode, PollData, PollOption } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { Badge } from "../ui";
import { formatDate } from "../../services/utils";

interface PollWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

export function PollWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: PollWidgetProps) {
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const data = config.data as unknown as PollData;
  const totalVotes = data.options.reduce((s, o) => s + o.votes, 0);

  const handleVote = (optionId: string) => {
    if (data.userVote) return;
    const updated = data.options.map((o) =>
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o
    );
    updateWidgetData(config.id, { options: updated, userVote: optionId });
  };

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid" && (
        <PollGrid data={data} totalVotes={totalVotes} onVote={handleVote} />
      )}
      {mode === "expanded" && (
        <PollExpanded data={data} totalVotes={totalVotes} onVote={handleVote} />
      )}
    </WidgetWrapper>
  );
}

function PollGrid({ data, totalVotes, onVote }: {
  data: PollData; totalVotes: number; onVote: (id: string) => void;
}) {
  const topOption = [...data.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="flex flex-col gap-2 h-full">
      <p className="text-xs font-medium text-primary line-clamp-2 leading-snug">{data.question}</p>

      {data.userVote ? (
        
        <div className="flex flex-col gap-1.5 flex-1 overflow-auto">
          {data.options.map((o) => {
            const pct = totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0;
            const isVoted = o.id === data.userVote;
            const isTop = o.id === topOption?.id;
            return (
              <div key={o.id} className="relative rounded-md overflow-hidden">
                <div
                  className={`absolute inset-0 transition-all duration-700 ${isTop ? "bg-accent/15" : "bg-surface-2"}`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between px-2 py-1">
                  <span className={`text-xs truncate ${isVoted ? "text-accent font-medium" : "text-muted"}`}>
                    {isVoted && <CheckCircle2 size={9} className="inline mr-1" />}
                    {o.text}
                  </span>
                  <span className="text-xs text-muted ml-2 shrink-0 tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted/50 mt-auto">{totalVotes} votes · glisser pour détails</p>
        </div>
      ) : (
        
        <div className="flex flex-col gap-1.5 flex-1 overflow-auto">
          {data.options.map((o) => (
            <button
              key={o.id}
              onClick={(e) => { e.stopPropagation(); onVote(o.id); }}
              className="text-left text-xs px-2.5 py-2 rounded-md bg-surface-2
                hover:bg-accent/10 hover:text-accent border border-transparent
                hover:border-accent/20 text-muted transition-all duration-150"
            >
              {o.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PollExpanded({ data, totalVotes, onVote }: {
  data: PollData; totalVotes: number; onVote: (id: string) => void;
}) {
  const [tab, setTab] = useState<"current" | "history">("current");
  const topOption = [...data.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit">
        {(["current", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md transition-all
              ${tab === t ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-primary"}`}>
            {t === "current" ? "Sondage actuel" : `Historique (${(data.history ?? []).length})`}
          </button>
        ))}
      </div>

      {tab === "current" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-primary">{data.question}</h3>
            <Badge variant={data.userVote ? "success" : "default"}>{totalVotes} votes</Badge>
          </div>
          <div className="flex flex-col gap-2.5">
            {data.options.map((o) => {
              const pct = totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0;
              const isVoted = o.id === data.userVote;
              const isTop = o.id === topOption?.id;
              return (
                <button key={o.id}
                  onClick={() => !data.userVote && onVote(o.id)}
                  disabled={!!data.userVote}
                  className={`relative w-full text-left rounded-lg border overflow-hidden transition-all duration-200
                    ${data.userVote ? "cursor-default" : "hover:border-accent/40 cursor-pointer"}
                    ${isVoted ? "border-accent/40" : "border-border"}`}
                >
                  <div className={`absolute inset-0 transition-all duration-700 ease-out
                    ${isTop ? "bg-accent/10" : "bg-surface-2/50"}`}
                    style={{ width: data.userVote ? `${pct}%` : "0%" }} />
                  <div className="relative flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isVoted && <CheckCircle2 size={14} className="text-accent shrink-0" />}
                      {isTop && !isVoted && <TrendingUp size={14} className="text-amber-400 shrink-0" />}
                      <span className={`text-sm ${isVoted ? "text-accent font-medium" : "text-primary"}`}>{o.text}</span>
                    </div>
                    {data.userVote && (
                      <span className={`text-sm font-semibold ${isTop ? "text-accent" : "text-muted"}`}>{pct}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {!data.userVote && (
            <p className="text-xs text-muted/60 text-center">Cliquez sur une option pour voter</p>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="flex flex-col gap-4">
          {(data.history ?? []).length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Aucun historique disponible</p>
          ) : (
            (data.history ?? []).map((q) => {
              const total = q.options.reduce((s, o) => s + o.votes, 0);
              const top = [...q.options].sort((a, b) => b.votes - a.votes)[0];
              return (
                <div key={q.id} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{q.question}</p>
                    <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                      <Clock size={11} />{formatDate(q.closedAt)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((o) => {
                      const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
                      return (
                        <div key={o.id} className="relative">
                          <div className={`absolute inset-0 rounded ${o.id === top.id ? "bg-accent/10" : "bg-surface-2"}`}
                            style={{ width: `${pct}%` }} />
                          <div className="relative flex justify-between px-2 py-1">
                            <span className={`text-xs ${o.id === top.id ? "text-accent font-medium" : "text-muted"}`}>{o.text}</span>
                            <span className="text-xs text-muted">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted/60">{total} votes au total</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
