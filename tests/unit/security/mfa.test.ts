import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Set ENCRYPTION_KEY before importing mfa module
const VALID_KEY_HEX = "b".repeat(64);

describe("MFA utilities", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  describe("generateTOTPSecret", () => {
    it("returns a base32 secret and otpauth URI", async () => {
      const { generateTOTPSecret } = await import("@/lib/mfa");
      const { secret, uri } = generateTOTPSecret("user@example.com");

      expect(secret).toBeTruthy();
      expect(secret.length).toBeGreaterThan(10);
      expect(uri).toContain("otpauth://totp/");
      expect(uri).toContain("user%40example.com");
      expect(uri).toContain("PMF%20Capital");
    });
  });

  describe("encryptSecret / decryptSecret", () => {
    it("roundtrips a TOTP secret through encrypt/decrypt", async () => {
      const { encryptSecret, decryptSecret } = await import("@/lib/mfa");

      const original = "JBSWY3DPEHPK3PXP";
      const encrypted = encryptSecret(original);
      expect(encrypted).not.toBe(original);
      expect(decryptSecret(encrypted)).toBe(original);
    });
  });

  describe("verifyTOTP", () => {
    it("accepts a valid TOTP code", async () => {
      const { generateTOTPSecret, verifyTOTP } = await import("@/lib/mfa");
      const OTPAuth = await import("otpauth");

      const { secret } = generateTOTPSecret("test@test.com");
      const totp = new OTPAuth.TOTP({
        issuer: "PMF Capital",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
      const validCode = totp.generate();
      expect(verifyTOTP(secret, validCode)).toBe(true);
    });

    it("rejects an invalid TOTP code", async () => {
      const { generateTOTPSecret, verifyTOTP } = await import("@/lib/mfa");
      const { secret } = generateTOTPSecret("test@test.com");
      expect(verifyTOTP(secret, "000000")).toBe(false);
    });
  });

  describe("generateRecoveryCodes", () => {
    it("generates 8 recovery codes with 128-bit entropy", { timeout: 30000 }, async () => {
      const { generateRecoveryCodes } = await import("@/lib/mfa");
      const { plaintext, hashed } = await generateRecoveryCodes();

      expect(plaintext).toHaveLength(8);
      expect(hashed).toHaveLength(8);

      // Each code should be in XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX format
      for (const code of plaintext) {
        expect(code).toMatch(/^[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/);
      }

      // All codes should be unique
      const unique = new Set(plaintext);
      expect(unique.size).toBe(8);

      // Hashes should be bcrypt hashes
      for (const hash of hashed) {
        expect(hash).toMatch(/^\$2[aby]\$/);
      }
    });
  });

  describe("verifyRecoveryCode", () => {
    it("verifies a valid recovery code", { timeout: 30000 }, async () => {
      const { generateRecoveryCodes, verifyRecoveryCode } = await import("@/lib/mfa");
      const { plaintext, hashed } = await generateRecoveryCodes();

      const idx = await verifyRecoveryCode(plaintext[3], hashed);
      expect(idx).toBe(3);
    });

    it("rejects an invalid recovery code", { timeout: 30000 }, async () => {
      const { generateRecoveryCodes, verifyRecoveryCode } = await import("@/lib/mfa");
      const { hashed } = await generateRecoveryCodes();

      const idx = await verifyRecoveryCode("INVALID-CODE-HERE-NOPE", hashed);
      expect(idx).toBe(-1);
    });

    it("accepts codes with dashes stripped", { timeout: 30000 }, async () => {
      const { generateRecoveryCodes, verifyRecoveryCode } = await import("@/lib/mfa");
      const { plaintext, hashed } = await generateRecoveryCodes();

      // Code without dashes should also verify
      const noDashes = plaintext[0].replace(/-/g, "");
      const idx = await verifyRecoveryCode(noDashes, hashed);
      expect(idx).toBe(0);
    });

    it("is case-insensitive", { timeout: 30000 }, async () => {
      const { generateRecoveryCodes, verifyRecoveryCode } = await import("@/lib/mfa");
      const { plaintext, hashed } = await generateRecoveryCodes();

      const lower = plaintext[2].toLowerCase();
      const idx = await verifyRecoveryCode(lower, hashed);
      expect(idx).toBe(2);
    });
  });

  describe("isMFARequired", () => {
    it("returns true when setting is 'true'", async () => {
      const { isMFARequired } = await import("@/lib/mfa");
      const mockDb = {
        systemSetting: {
          findUnique: vi.fn().mockResolvedValue({ value: "true" }),
        },
      };
      expect(await isMFARequired(mockDb)).toBe(true);
    });

    it("returns false when setting is missing", async () => {
      const { isMFARequired } = await import("@/lib/mfa");
      const mockDb = {
        systemSetting: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };
      expect(await isMFARequired(mockDb)).toBe(false);
    });

    it("returns false when setting is 'false'", async () => {
      const { isMFARequired } = await import("@/lib/mfa");
      const mockDb = {
        systemSetting: {
          findUnique: vi.fn().mockResolvedValue({ value: "false" }),
        },
      };
      expect(await isMFARequired(mockDb)).toBe(false);
    });
  });
});
