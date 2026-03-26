import { randomBytes } from "node:crypto";
/**
 * Generates a random string of a given size
 */
export function generateRandom(size: number): string {
	return randomBytes(Math.ceil((size * 3) / 4))
		.toString("base64")
		.slice(0, size);
}
