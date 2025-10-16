const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const dayjs = require("dayjs");

const execFileAsync = promisify(execFile);
const app = express();

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// 5 MB, in-memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // quick content-type guard
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Unsupported file type"), ok);
  },
});

// Extract date of birth (FR+EN formats)
function extractDOB(text) {
  // Common FR formats: JJ/MM/AAAA, JJ.MM.AAAA; ISO: YYYY-MM-DD; also DD-MM-YYYY
  const patterns = [
    /\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/, // 31/12/2000 or 31-12-2000 or 31.12.2000
    /\b(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})\b/, // 2000-12-31 or 2000/12/31
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      if (m[1].length === 4) return `${m[1]}-${m[2]}-${m[3]}`; // YYYY-MM-DD
      return `${m[3]}-${m[2]}-${m[1]}`; // DD/MM/YYYY -> YYYY-MM-DD
    }
  }
  return null;
}

function isOfAge(dobISO, years = 18) {
  if (!dobISO) return false;
  const dob = dayjs(dobISO);
  return dob.isValid() && dayjs().diff(dob, "year") >= years;
}

// POST /kyc/verify (multipart/form-data, field: id_image)
app.post("/kyc/verify", upload.single("id_image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "Missing file field 'id_image'" });

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kyc-"));
    const imgPath = path.join(tmpDir, "doc");
    await fs.writeFile(`${imgPath}.jpg`, req.file.buffer);

    // Use French + English for IDs: add "-l fra+eng" (both)
    const { stdout } = await execFileAsync("tesseract", [`${imgPath}.jpg`, "stdout", "-l", "fra+eng"]);

    await fs.rm(tmpDir, { recursive: true, force: true });

    const text = (stdout || "").toString();
    const dobISO = extractDOB(text);
    const ok = isOfAge(dobISO, 18);

    res.json({ ok: true, isOfAge: ok, dobISO, ocrPreview: text.slice(0, 500) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "OCR failed" });
  }
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, "0.0.0.0", () => console.log(`KYC listening on ${PORT}`));
