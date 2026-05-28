"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Activity, LogOut, Users, TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw } from "lucide-react";
import { api, type PatientSummary, type PractitionerMe } from "@/lib/api/client";

const PORTAL_POLL_MS = 60_000;

function GlucoseBadge({ value, trend }: { value: number; trend: string }) {
  let color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value < 70) color = "bg-red-50 text-red-700 border-red-200";
  else if (value > 180) color = "bg-amber-50 text-amber-700 border-amber-200";

  const TrendIcon =
    trend === "rising" || trend === "rising_fast" ? TrendingUp
    : trend === "falling" || trend === "falling_fast" ? TrendingDown
    : Minus;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${color}`}>
      <TrendIcon size={13} strokeWidth={2.5} />
      {value} mg/dL
    </span>
  );
}

function DiabeticTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    type1: "Tipo 1",
    type2: "Tipo 2",
    gestational: "Gestacional",
    other: "Outro",
  };
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {labels[type] ?? type}
    </span>
  );
}

function formatLastSynced(iso: string | null): string {
  if (!iso) return "sem leitura";
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h atrás`;
  return `${Math.round(diffMin / 1440)}d atrás`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<PractitionerMe | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [meData, patientsData] = await Promise.all([
        api.portal.me(),
        api.portal.patients(),
      ]);
      setMe(meData);
      setPatients(patientsData);
      setLastUpdatedAt(new Date());
      setError("");
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        router.replace("/login");
        return;
      }
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadData(), 0);
    const timer = window.setInterval(() => loadData(true), PORTAL_POLL_MS);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadData]);

  async function handleLogout() {
    await api.auth.logout().catch(() => {});
    router.replace("/login");
  }

  const hypoPatientsCount = patients.filter((p) => p.currentGlucose !== null && p.currentGlucose < 70).length;
  const hyperPatientsCount = patients.filter((p) => p.currentGlucose !== null && p.currentGlucose > 180).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-3 w-3 animate-pulse rounded-full bg-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar + Main layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Activity size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-slate-900">GlycemiBot</span>
          </div>

          <nav className="flex-1 p-3">
            <button className="flex w-full items-center gap-3 rounded-lg bg-violet-50 px-3 py-2.5 text-sm font-medium text-violet-700">
              <Users size={16} strokeWidth={2} />
              Pacientes
            </button>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-900">{me?.name ?? "Médico"}</p>
              <p className="text-xs text-slate-500 capitalize">{me?.role ?? "practitioner"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              <LogOut size={14} strokeWidth={2} />
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Pacientes</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {patients.length} pacientes cadastrados
                {lastUpdatedAt ? ` · atualizado às ${lastUpdatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} strokeWidth={2} />
              Atualizar
            </button>
          </div>

          {/* Alert banners */}
          {hypoPatientsCount > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} strokeWidth={2} className="shrink-0" />
              <strong>{hypoPatientsCount} paciente{hypoPatientsCount > 1 ? "s" : ""}</strong> com glicose abaixo de 70 mg/dL (hipoglicemia)
            </div>
          )}
          {hyperPatientsCount > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle size={16} strokeWidth={2} className="shrink-0" />
              <strong>{hyperPatientsCount} paciente{hyperPatientsCount > 1 ? "s" : ""}</strong> com glicose acima de 180 mg/dL (hiperglicemia)
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Patient table */}
          {patients.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Users size={32} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-500">Nenhum paciente cadastrado</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Paciente</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Glicose atual</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Última sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.age} anos</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <DiabeticTypeBadge type={p.diabetesType} />
                      </td>
                      <td className="px-5 py-4">
                        {p.currentGlucose !== null ? (
                          <GlucoseBadge value={p.currentGlucose} trend={p.glucoseTrend} />
                        ) : (
                          <span className="text-xs text-slate-400">Sem dados</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatLastSynced(p.lastSyncedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
