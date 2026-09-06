import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');

function slugify(base: string): string {
  return base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'imagen';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = slugify(path.basename(file.originalname, ext));
    let name = `${base}${ext}`;
    // Si ya existe un archivo con ese nombre, le agrega un sufijo corto en vez de sobrescribirlo
    if (fs.existsSync(path.join(uploadsDir, name))) {
      name = `${base}-${crypto.randomBytes(3).toString('hex')}${ext}`;
    }
    cb(null, name);
  }
});

const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.has(ext)) return cb(new Error('Formato de imagen no permitido (usa jpg, png, webp o gif)'));
    cb(null, true);
  }
});