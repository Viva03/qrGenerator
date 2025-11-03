import { type QrCode, type InsertQrCode } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getQrCode(id: string): Promise<QrCode | undefined>;
  getAllQrCodes(): Promise<QrCode[]>;
}

export class MemStorage implements IStorage {
  private qrCodes: Map<string, QrCode>;

  constructor() {
    this.qrCodes = new Map();
  }

  async createQrCode(insertQrCode: InsertQrCode): Promise<QrCode> {
    const id = randomUUID();
    const qrCode: QrCode = {
      ...insertQrCode,
      id,
      createdAt: new Date(),
    };
    this.qrCodes.set(id, qrCode);
    return qrCode;
  }

  async getQrCode(id: string): Promise<QrCode | undefined> {
    return this.qrCodes.get(id);
  }

  async getAllQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values());
  }
}

export const storage = new MemStorage();
