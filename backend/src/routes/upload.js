import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { formidable } from 'formidable';
import { requireAdmin } from '../auth.js';

const router = Router();
const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media';
const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 500;
const ALLOWED_EXT = new Set(['.mp4', '.webm', '.mov', '.m3u8']);

// POST /api/admin/upload/video-file  (multipart, field "file") — admin JWT.
// Stores the file under MEDIA_DIR and returns its public /media/... URL,
// which can be pasted as a part's direct URL for the native TechLand player.
router.post('/video-file', requireAdmin, async (req, res, next) => {
  try {
    await fs.promises.mkdir(MEDIA_DIR, { recursive: true });
    const form = formidable({
      uploadDir: MEDIA_DIR,
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: MAX_MB * 1024 * 1024,
    });
    const [, files] = await form.parse(req);
    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!file?.filepath) return res.status(400).json({ error: 'no_file' });
    const ext = path.extname(file.originalFilename || file.newFilename || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      await fs.promises.unlink(file.filepath).catch(() => {});
      return res.status(400).json({ error: 'invalid_type' });
    }
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    await fs.promises.rename(file.filepath, path.join(MEDIA_DIR, safe));
    res.status(201).json({ url: `/media/${safe}`, size: file.size ?? null });
  } catch (err) {
    const code = err && typeof err === 'object' && 'httpCode' in err ? err.httpCode : null;
    if (code === 413) return res.status(413).json({ error: 'too_large' });
    next(err);
  }
});

export default router;
