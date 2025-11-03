import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// QR Code generation schema
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  foregroundColor: varchar("foreground_color", { length: 7 }).notNull().default("#000000"),
  backgroundColor: varchar("background_color", { length: 7 }).notNull().default("#ffffff"),
  size: integer("size").notNull().default(300),
  hasLogo: text("has_logo").notNull().default("false"),
  logoData: text("logo_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQrCodeSchema = createInsertSchema(qrCodes, {
  url: z.string().url({ message: "Please enter a valid URL" }),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  size: z.number().min(200).max(400),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = typeof qrCodes.$inferSelect;

// QR Generation Request/Response types
export const qrGenerateRequestSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#000000"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffffff"),
  size: z.number().min(200).max(400).default(300),
  logoData: z.string().optional(),
});

export type QrGenerateRequest = z.infer<typeof qrGenerateRequestSchema>;

export interface QrGenerateResponse {
  id: string;
  qrCodeDataUrl: string;
  url: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  createdAt: Date;
}
