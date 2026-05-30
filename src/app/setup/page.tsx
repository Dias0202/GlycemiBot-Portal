"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/client";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    license_number: "",
    specialty: "",
    setup_key: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.setup_key) {
      setError("Nome, e-mail, senha e chave de configuração são obrigatórios");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.portal.setup(
        {
          name: form.name,
          email: form.email,
          password: form.password,
          license_number: form.license_number || undefined,
          specialty: form.specialty || undefined,
        },
        form.setup_key,
      );
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
            <Activity size={18} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-semibold text-slate-900">GlycomiBot</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-semibold text-slate-900">Criar Conta Médico</h1>
          <p className="mb-6 text-sm text-slate-500">
            Configuração inicial do Portal Clínico. Requer chave de configuração.
          </p>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={40} className="text-green-500" />
              <p className="font-medium text-slate-800">Conta criada com sucesso!</p>
              <p className="text-sm text-slate-500">Redirecionando para o login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Nome completo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Dr. Gabriel Dias"
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="medico@clinica.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">
                  CRM / Número de registro{" "}
                  <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={form.license_number}
                  onChange={set("license_number")}
                  placeholder="CRM/SP 000000"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">
                  Especialidade{" "}
                  <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={set("specialty")}
                  placeholder="Endocrinologia"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Chave de configuração</label>
                <input
                  type="password"
                  value={form.setup_key}
                  onChange={set("setup_key")}
                  placeholder="Fornecida pelo administrador"
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-violet-500 focus:bg-white"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition-opacity hover:bg-violet-700 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Criando conta…
                  </span>
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
