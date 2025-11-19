import { Router } from "express";
import db from "../db.js"; // import your SQLite database

const router = Router();

// Health check
router.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// GET all links
router.get("/links", (req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT id, code, url, title, clicks FROM links ORDER BY id DESC"
      )
      .all();
    res.json({ links: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// GET single link details
router.get("/link/:code", (req, res) => {
  try {
    const code = req.params.code;
    const link = db
      .prepare("SELECT id, code, url, title, clicks FROM links WHERE code = ?")
      .get(code);

    if (!link) return res.status(404).json({ error: "Link not found" });

    const events = db
      .prepare("SELECT ts, ip FROM events WHERE link_id = ? ORDER BY ts DESC")
      .all(link.id);

    res.json({ link: { ...link, events } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch link details" });
  }
});

// POST create link
router.post("/links", (req, res) => {
  try {
    const { url, code, title } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const shortCode = code || Math.random().toString(36).substring(2, 8);

    db.prepare("INSERT INTO links (code, url, title) VALUES (?, ?, ?)").run(
      shortCode,
      url,
      title || null
    );

    const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;
    res.status(201).json({ code: shortCode, shortUrl });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ error: "Code already exists" });
    } else {
      res.status(500).json({ error: "Failed to create link" });
    }
  }
});

// DELETE a link
router.delete("/link/:code", (req, res) => {
  try {
    const code = req.params.code;
    const link = db.prepare("SELECT id FROM links WHERE code = ?").get(code);

    if (!link) return res.status(404).json({ error: "Link not found" });

    db.prepare("DELETE FROM events WHERE link_id = ?").run(link.id);
    db.prepare("DELETE FROM links WHERE id = ?").run(link.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete link" });
  }
});

router.post("/link/:code/click", (req, res) => {
  try {
    const { code } = req.params;
    const link = db
      .prepare("SELECT id, url, clicks FROM links WHERE code = ?")
      .get(code);

    if (!link) return res.status(404).send("Short link not found");

    db.prepare("INSERT INTO events (link_id, ip) VALUES (?, ?)").run(
      link.id,
      req.ip
    );
    db.prepare("UPDATE links SET clicks = clicks + 1 WHERE id = ?").run(
      link.id
    );

    res.json({ clicks: link.clicks + 1 });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default router;
