
/**
 * ============================================================
 * GOOGLE PRIVATE KEY VALIDATION
 * ============================================================
 *
 * PURPOSE:
 * - Load the shared backend .env file.
 * - Retrieve the Google service account private key.
 * - Clean quotation marks and newline formatting.
 * - Check whether Node.js can decode the private key.
 *
 * This test does not connect to Google Sheets or expose
 * any private credentials.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createPrivateKey } from "node:crypto";

// Locate the shared .env file in the backend folder.
const envPath = fileURLToPath(
  new URL("../../.env", import.meta.url)
);

// Load the environment variables.
dotenv.config({ path: envPath });


/**
 * Remove surrounding quotation marks.
 *
 * Supports standard and smart quotation marks.
 */
function cleanValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "");
}


/**
 * Prepare the private key for Node.js crypto validation.
 */
function preparePrivateKey(value) {

  let key = cleanValue(value)
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!key) {
    throw new Error("Google private key is missing.");
  }

  // Add PEM markers if only the Base64 key content exists.
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {

    const base64Content = key.replace(/\s+/g, "");

    if (!/^[A-Za-z0-9+/]+=*$/.test(base64Content)) {
      throw new Error("Private key contains invalid characters.");
    }

    const lines = base64Content.match(/.{1,64}/g);

    key = [
      "-----BEGIN PRIVATE KEY-----",
      ...lines,
      "-----END PRIVATE KEY-----",
    ].join("\n");
  }

  return key;
}


// ============================================================
// RUN VALIDATION
// ============================================================

try {

  console.log("\nGOOGLE PRIVATE KEY VALIDATION\n");

  // Check the service account email.
  const clientEmail = cleanValue(
    process.env.GOOGLE_CLIENT_EMAIL
  );

  if (!clientEmail) {
    throw new Error("GOOGLE_CLIENT_EMAIL is missing.");
  }

  console.log("PASS: Google service account email loaded.");

  // Retrieve and prepare the private key.
  const privateKey = preparePrivateKey(
    process.env.GOOGLE_PRIVATE_KEY
  );

  console.log("PASS: Google private key loaded.");

  // Ask Node.js to decode and validate the key.
  const parsedKey = createPrivateKey(privateKey);

  // Confirm the key uses the expected RSA algorithm.
  if (parsedKey.asymmetricKeyType !== "rsa") {
    throw new Error("Private key is not an RSA key.");
  }

  console.log("PASS: Private key successfully parsed.");
  console.log("PASS: Private key uses RSA encryption.");

  console.log("\nGoogle private key validation successful.");

} catch (error) {

  console.error("\nGOOGLE PRIVATE KEY VALIDATION FAILED");
  console.error(error.message);

  process.exitCode = 1;
}

