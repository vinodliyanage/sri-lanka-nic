"use client";

import { useState, useCallback } from "react";
import { NIC, Gender, NICType, NICError } from "@sri-lanka/nic";
import { Copy, Check, Shuffle, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

const nicFormSchema = z
  .object({
    format: z.enum([NICType.NEW, NICType.OLD]),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    year: z.coerce.number({ error: "Year is required" }).int("Year must be a whole number"),
    month: z.coerce
      .number({ error: "Month is required" })
      .int()
      .min(1, "Month must be between 1 and 12")
      .max(12, "Month must be between 1 and 12"),
    day: z.coerce
      .number({ error: "Day is required" })
      .int()
      .min(1, "Day must be between 1 and 31")
      .max(31, "Day must be between 1 and 31"),
    letter: z.enum(["V", "X"]),
  })
  .superRefine((data, ctx) => {
    const config = data.format === NICType.NEW ? NIC.defaultConfig.new : NIC.defaultConfig.old;

    if (data.year < config.minimumBirthYear) {
      ctx.addIssue({
        code: "custom",
        path: ["year"],
        message: `Year must be ${config.minimumBirthYear} or later`,
      });
    }

    if (data.year > config.maximumBirthYear) {
      ctx.addIssue({
        code: "custom",
        path: ["year"],
        message: `Year must be ${config.maximumBirthYear} or earlier`,
      });
    }
  });

type NICFormData = z.infer<typeof nicFormSchema>;

export function NICBuilder() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NICFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(nicFormSchema) as any,
    defaultValues: {
      format: NICType.NEW,
      gender: Gender.MALE,
      year: 1995,
      month: 6,
      day: 15,
      letter: "V",
    },
  });

  const format = watch("format");

  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const build = useCallback((data: NICFormData) => {
    setCopied(false);
    try {
      const builder = data.format === NICType.NEW ? NIC.builder.new() : NIC.builder.old();

      const birthday = {
        year: data.year,
        month: data.month,
        day: data.day,
      };

      const gender = data.gender === "MALE" ? Gender.MALE : Gender.FEMALE;

      builder.birthday(birthday).gender(gender);

      if ("letter" in builder) builder.letter(data.letter);

      const result = builder.build();

      setOutput(result);
      setError(null);
    } catch (e) {
      setOutput(null);
      setError(e instanceof NICError ? e.message : "Failed to build NIC");
    }
  }, []);

  const random = useCallback(() => {
    setCopied(false);
    try {
      const nic = NIC.random();
      setOutput(nic);
      setError(null);
    } catch {
      setError("Failed to generate random NIC");
    }
  }, []);

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <form onSubmit={handleSubmit(build)} className="w-full">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Format toggle */}
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Format
          </label>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              onClick={() => setValue("format", NICType.NEW)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                format === NICType.NEW
                  ? "border-accent bg-accent-light font-medium text-accent"
                  : "border-border text-text-secondary hover:border-border-strong"
              }`}
            >
              New (12-digit)
            </button>
            <button
              type="button"
              onClick={() => setValue("format", NICType.OLD)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                format === NICType.OLD
                  ? "border-accent bg-accent-light font-medium text-accent"
                  : "border-border text-text-secondary hover:border-border-strong"
              }`}
            >
              Old (9+1)
            </button>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Gender
          </label>
          <select
            {...register("gender")}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
          </select>
        </div>

        {/* Letter (old only) */}
        {format === NICType.OLD && (
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Letter
            </label>
            <select
              {...register("letter")}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="V">V (Voter)</option>
              <option value="X">X (Non-voter)</option>
            </select>
          </div>
        )}

        {/* Birthday */}
        <div>
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Year
          </label>
          <input
            type="number"
            {...register("year")}
            className={`mt-1.5 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent ${errors.year ? "border-red-500" : "border-border"}`}
          />
          {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Month
            </label>
            <input
              type="number"
              {...register("month")}
              min={1}
              max={12}
              className={`mt-1.5 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent ${errors.month ? "border-red-500" : "border-border"}`}
            />
            {errors.month && <p className="mt-1 text-xs text-red-500">{errors.month.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Day
            </label>
            <input
              type="number"
              {...register("day")}
              min={1}
              max={31}
              className={`mt-1.5 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent ${errors.day ? "border-red-500" : "border-border"}`}
            />
            {errors.day && <p className="mt-1 text-xs text-red-500">{errors.day.message}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-text px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Wrench size={14} />
          Build
        </button>
        <button
          type="button"
          onClick={random}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-bg-secondary"
        >
          <Shuffle size={14} />
          Random
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {output && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-3 animate-in fade-in">
          <p className="flex-1 font-mono text-lg tracking-wider font-medium">{output}</p>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      )}
    </form>
  );
}
