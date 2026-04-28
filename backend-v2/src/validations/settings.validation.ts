import { z } from "zod";

export const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(0).max(2000),
});

export const businessHourSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isClosed: z.coerce.boolean().default(false),
});

export type SettingInput = z.infer<typeof settingSchema>;
export type BusinessHourInput = z.infer<typeof businessHourSchema>;
