import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { qrGenerateRequestSchema } from "@shared/schema";
import QRCode from "qrcode";
import { z } from "zod";
import sharp from "sharp";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate", upload.single("logo"), async (req, res) => {
    try {
      const { url, foregroundColor, backgroundColor, size, format = "png" } = req.body;

      const parsedData = qrGenerateRequestSchema.parse({
        url,
        foregroundColor: foregroundColor || "#000000",
        backgroundColor: backgroundColor || "#ffffff",
        size: parseInt(size) || 300,
      });

      const qrOptions = {
        color: {
          dark: parsedData.foregroundColor,
          light: parsedData.backgroundColor,
        },
        width: parsedData.size,
        margin: 1,
      };

      let qrCodeDataUrl: string;

      if (format === "svg") {
        const svgString = await QRCode.toString(parsedData.url, {
          ...qrOptions,
          type: "svg",
        });
        qrCodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`;
      } else {
        if (req.file) {
          const qrBuffer = await QRCode.toBuffer(parsedData.url, {
            ...qrOptions,
            type: "png",
          });

          const logoSize = Math.floor(parsedData.size * 0.25);
          const logoPosition = Math.floor((parsedData.size - logoSize) / 2);

          const resizedLogo = await sharp(req.file.buffer)
            .resize(logoSize, logoSize, {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toBuffer();

          const compositeImage = await sharp(qrBuffer)
            .composite([{
              input: resizedLogo,
              top: logoPosition,
              left: logoPosition,
            }])
            .png()
            .toBuffer();

          qrCodeDataUrl = `data:image/png;base64,${compositeImage.toString("base64")}`;
        } else {
          qrCodeDataUrl = await QRCode.toDataURL(parsedData.url, {
            ...qrOptions,
            type: "image/png",
          });
        }
      }

      const savedQrCode = await storage.createQrCode({
        url: parsedData.url,
        foregroundColor: parsedData.foregroundColor,
        backgroundColor: parsedData.backgroundColor,
        size: parsedData.size,
        hasLogo: req.file ? "true" : "false",
        logoData: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` : null,
      });

      res.json({
        id: savedQrCode.id,
        qrCodeDataUrl,
        url: savedQrCode.url,
        size: savedQrCode.size,
        foregroundColor: savedQrCode.foregroundColor,
        backgroundColor: savedQrCode.backgroundColor,
        createdAt: savedQrCode.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          message: error.message,
        });
      }

      console.error("Error generating QR code:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate QR code",
      });
    }
  });

  app.get("/api/qr-codes", async (req, res) => {
    try {
      const qrCodes = await storage.getAllQrCodes();
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({
        message: "Failed to fetch QR codes",
      });
    }
  });

  app.get("/api/qr-codes/:id", async (req, res) => {
    try {
      const qrCode = await storage.getQrCode(req.params.id);
      
      if (!qrCode) {
        return res.status(404).json({
          message: "QR code not found",
        });
      }

      res.json(qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({
        message: "Failed to fetch QR code",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
