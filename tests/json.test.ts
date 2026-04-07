import { test } from "node:test";
import assert from "node:assert";
import { stringifyJson } from "../src/main/lib/json/index.ts";

test("stringifyJson", async (t) => {
	await t.test("should stringify an object", () => {
		const obj = { key: "value" };
		const result = stringifyJson(obj);
		assert.strictEqual(result, '{"key":"value"}');
	});

	await t.test("should stringify an array", () => {
		const arr = [1, 2, 3];
		const result = stringifyJson(arr);
		assert.strictEqual(result, "[1,2,3]");
	});

	await t.test("should stringify primitive values", () => {
		assert.strictEqual(stringifyJson("string"), '"string"');
		assert.strictEqual(stringifyJson(123), "123");
		assert.strictEqual(stringifyJson(true), "true");
		assert.strictEqual(stringifyJson(null), "null");
	});

	await t.test("should handle empty objects and arrays", () => {
		assert.strictEqual(stringifyJson({}), "{}");
		assert.strictEqual(stringifyJson([]), "[]");
	});

	await t.test("should handle nested objects", () => {
		const nested = { a: { b: 1 } };
		assert.strictEqual(stringifyJson(nested), '{"a":{"b":1}}');
	});
});
