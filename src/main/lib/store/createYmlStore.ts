import path from "node:path";
import slugify, { SlugifyOptions } from "@shared/slug";
import { base64 } from "@shared/utils/base64";
import { generateRandom } from "@shared/utils/randomString";
import { app, safeStorage } from "electron";
import { ConfOptions as Options, Conf as Store } from "electron-conf/main";
import Encryption from "encryption.js";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { parse as deserialize, stringify as serialize } from "yaml";

const slugifyOptions = {
	lower: true,
	replacement: "_",
	trim: true,
	remove: /[*+~.()'"!:@]/g,
} as SlugifyOptions;
const getStoreUserData = () => app.getPath("userData");
if (!statSync(getStoreUserData(), { throwIfNoEntry: false })) mkdirSync(getStoreUserData(), { recursive: true });
export const createYmlStore = <T extends Record<string, any> = Record<string, any>>(name: string, options: Options<T> = {} as Options<T>) =>
	new Store<T>({
		ext: ".yml",
		...options,
		serializer: {
			read(raw) {
				return deserialize(raw);
			},
			write(value) {
				return serialize(value);
			},
		},
		name,
	});

export const createEncryptedStore = <T extends Record<string, any> = Record<string, any>>(name: string, options: Options<T> = {} as Options<T>) => {
	const encryptionKeyPath = path.join(getStoreUserData(), slugify(name, slugifyOptions) + ".key");
	const legacyEnc = new Encryption({ secret: base64.encode(name) });

	let secret: string | undefined;

	if (existsSync(encryptionKeyPath)) {
		const rawKey = readFileSync(encryptionKeyPath);
		const encryptionKey = rawKey.toString("utf8");

		try {
			// Try to decrypt using safeStorage (new method)
			if (safeStorage.isEncryptionAvailable()) {
				const decrypted = safeStorage.decryptString(rawKey);
				const payload = JSON.parse(decrypted);
				if (payload && payload.name === name && payload.secret) {
					secret = payload.secret;
				}
			}
		} catch (e) {
			// Failed with safeStorage, might be legacy
		}

		if (!secret) {
			try {
				// Try to decrypt using legacy method
				const payload = legacyEnc.decrypt<{ name: string; secret: string }>(encryptionKey);
				if (payload && name === payload?.name && payload.secret) {
					secret = payload.secret;
					// Migrate to safeStorage if available
					if (safeStorage.isEncryptionAvailable()) {
						const encrypted = safeStorage.encryptString(JSON.stringify({ name, secret }));
						writeFileSync(encryptionKeyPath, encrypted);
					}
				}
			} catch (e) {
				// Failed with legacy as well
			}
		}
	}

	if (!secret) {
		secret = generateRandom(32);
		if (safeStorage.isEncryptionAvailable()) {
			const encrypted = safeStorage.encryptString(JSON.stringify({ name, secret }));
			writeFileSync(encryptionKeyPath, encrypted);
		} else {
			// Fallback to legacy if safeStorage is not available (should not happen on desktop usually)
			writeFileSync(encryptionKeyPath, legacyEnc.encrypt({ name, secret }));
		}
	}

	const storeEncryptor = new Encryption({ secret });
	return new Store<T>({
		ext: ".ytm",
		...options,
		serializer: {
			read(raw) {
				return storeEncryptor.decrypt(raw);
			},
			write(value) {
				return storeEncryptor.encrypt(value);
			},
		},
		name,
	});
};
