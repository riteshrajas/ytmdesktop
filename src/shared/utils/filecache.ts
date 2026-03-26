import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile, access } from "fs/promises";
import { join } from "path";
import { base64 } from "@shared/utils/base64";
import { app } from "electron";
import Encryption from "encryption.js";

const cachePath = join(app.getPath("userData"), "cache");
if (!existsSync(cachePath)) mkdirSync(cachePath);

export async function cacheWithFile<T>(fn: () => Promise<T>, key: string): Promise<T> {
	const enc = new Encryption({ secret: base64.encode(key) });
	const cacheFile = join(cachePath, key + ".ytm");
	const exists = await access(cacheFile)
		.then(() => true)
		.catch(() => false);
	if (exists) {
		return enc.decrypt(await readFile(cacheFile, "utf8"));
	}
	const result = (await fn()) as T;
	await writeFile(cacheFile, enc.encrypt(result));
	return result;
}
