/**
 * MonospacePoetry v2 - Database Schema
 * 
 * Using JSON file storage for simplicity (can migrate to proper DB later)
 * Each work is stored as a separate JSON file in /.data/works/
 */

// Work schema (TypeScript types for reference)
const WorkSchema = {
  // === REQUIRED ===
  id: "uuid",                           // system-generated, immutable
  title: "string (max 80 chars)",
  body: "string (max 80 cols)",
  created_at: "ISO 8601",
  updated_at: "ISO 8601",

  // === IDENTITY ===
  authors: ["array of strings"],        // supports co-creation
  author_keys: ["array of Ed25519 public keys"],  // for verification

  // === EPISTEMIC STANCE ===
  confidence: "number 0.0-1.0 | null",
  epistemic_mode: "assertion | speculation | fiction | ritual | witness | derived | null",

  // === STATE ===
  state: "draft | finished | sealed | burned",
  burned_at: "ISO 8601 | null",

  // === LINEAGE ===
  parents: ["array of work ids"],
  parent_type: "fork | response | continuation | contradiction | null",
  
  // === TEMPORAL ===
  cadence: "daily | weekly | seasonal | once | null",
  decay: {
    type: "permanent | fades | expires | mutates",
    at: "ISO 8601 | null",
    mutations: ["array of mutation objects"]
  },
  revision_window_hours: "number | null",  // 0 = immediate immutability
  
  // === CONSTRAINTS ===
  reply_mode: "open | constrained | closed",
  allowed_operations: ["read", "fork", "annotate", "witness"],
  
  // === FORMAT ===
  width: "number (default 80)",
  charset: "ascii | unicode | box",
  whitespace_significant: "boolean",
  license: "string (CC0, CC-BY, etc)",
  
  // === VERIFICATION ===
  body_hash: "SHA-256 of body",
  signature: "Ed25519 signature | null",
  witnessed_by: [{
    key: "Ed25519 public key",
    signature: "base64",
    at: "ISO 8601"
  }],
  
  // === METRICS ===
  witness_count: "number",
  fork_count: "number",
  children: ["array of work ids"]
};

// Author schema (for tracking scarcity)
const AuthorSchema = {
  id: "uuid",
  key: "Ed25519 public key | null",
  name: "string",
  created_at: "ISO 8601",
  
  // Scarcity tracking
  posts_this_epoch: "number",
  epoch_start: "ISO 8601",
  last_post_at: "ISO 8601 | null",
  silence_until: "ISO 8601 | null",
  
  // Witness tracking
  witnesses_today: "number",
  witness_date: "ISO 8601 (date only)",
  
  // Settings
  posts_per_epoch: "number (default 3)",
  epoch_duration_days: "number (default 7)",
  silence_after_post_hours: "number (default 24)",
  witnesses_per_day: "number (default 10)"
};

// Lineage graph edge
const LineageEdge = {
  from: "work id (parent)",
  to: "work id (child)",
  type: "fork | response | continuation | contradiction",
  created_at: "ISO 8601"
};

module.exports = { WorkSchema, AuthorSchema, LineageEdge };
