"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validators/profile";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

const INPUT =
  "w-full rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20";

export default function ProfilePage() {
  const t = useTranslations("account");
  const common = useTranslations("common");
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            reset({ name: data.user.name || "", phone: data.user.phone || "" });
          }
        });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, email: user?.email, name: data.name }),
      });
      await refresh();
      toast.success(t("editProfile"));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl">{t("editProfile")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Email</label>
          <input
            value={user?.email || ""}
            readOnly
            className={`${INPUT} opacity-60`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Name</label>
          <input
            {...register("name")}
            className={`${INPUT} ${errors.name ? "!border-[color:var(--color-danger)]" : ""}`}
          />
          {errors.name && <p className="mt-1 text-xs text-[color:var(--color-danger)]">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Phone</label>
          <input {...register("phone")} className={INPUT} />
        </div>
        <Button type="submit" color="primary" isLoading={loading}>{common("save")}</Button>
      </form>
    </div>
  );
}
