/* Family Cyber Ready — trust anchor (hardening).
 * List the coordinator key fingerprint(s) this app may enrol, e.g. ['A1B2-C3D4-E5F6-0718'].
 * Empty list = trust-on-first-use with voice-confirmed fingerprint.
 * After a key rotation, add the new fingerprint here (keep the old one until every phone has rotated). */
window.FCR_TRUST = { fingerprints: [] };
