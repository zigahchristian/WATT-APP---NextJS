import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/students/avatars";

// Save base64 to a file (if you need both)
export async function saveBase64ToFile(base64String: string): Promise<string> {
  try {
    // Extract the base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

    // Create buffer from base64
    const buffer = Buffer.from(base64Data, "base64");

    // Create directory if it doesn't exist
    const uploadPath = UPLOAD_DIR;

    await fs.mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_profile.jpg`;
    const filepath = path.join(uploadPath, filename);

    // Save file
    await fs.writeFile(filepath, buffer);

    // Return file path
    return `avatars/${filename}`;
  } catch (error) {
    console.error("Error saving base64 to file:", error);
    throw new Error("Failed to save base64 to file");
  }
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
