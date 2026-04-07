import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { base64 } from "@shared/utils/base64";
import { app, safeStorage } from "electron";
import Encryption from "encryption.js";

const cachePath = join(app.getPath("userData"), "cache");
if (!existsSync(cachePath)) mkdirSync(cachePath);
export async function cacheWithFile<T>(fn: () => Promise<T>, key: string): Promise<T> {
	const cacheFile = join(cachePath, key + ".ytm");
	const legacyEnc = new Encryption({ secret: base64.encode(key) });

	if (existsSync(cacheFile)) {
		const rawData = readFileSync(cacheFile);

		// Try safeStorage first
		if (safeStorage.isEncryptionAvailable()) {
			try {
				const decrypted = safeStorage.decryptString(rawData);
				return JSON.parse(decrypted);
			} catch (e) {
				// Failed with safeStorage, try legacy
			}
		}

		// Try legacy
		try {
			const decrypted = legacyEnc.decrypt(rawData.toString("utf8"));
			if (decrypted) {
				// Migrate to safeStorage if available
				if (safeStorage.isEncryptionAvailable()) {
					writeFileSync(cacheFile, safeStorage.encryptString(JSON.stringify(decrypted)));
				}
				return decrypted;
			}
		} catch (e) {
			// Failed legacy
		}
	}

	const result = (await fn()) as T;
	if (safeStorage.isEncryptionAvailable()) {
		writeFileSync(cacheFile, safeStorage.encryptString(JSON.stringify(result)));
	} else {
		writeFileSync(cacheFile, legacyEnc.encrypt(result));
	}
	return result;
}
