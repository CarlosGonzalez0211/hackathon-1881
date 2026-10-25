import assert from "node:assert/strict";
import test from "node:test";
import { birdSlots, EMOTE_SECONDS, emoteSlot } from "../src/athena/fauna";
import { lutGreenUp, tokenSkyGradient, unpackLutStrip } from "../src/athena/sky";

/** Identity 16³ LUT strip, 256×16 RGBA, green growing downward (row 0 = green 0). */
function identityStrip(greenUp: boolean) {
  const size = 16;
  const data = new Uint8Array(size * size * size * 4);
  for (let row = 0; row < size; row++)
    for (let x = 0; x < size * size; x++) {
      const g = greenUp ? size - 1 - row : row;
      const i = (row * size * size + x) * 4;
      data[i] = Math.round(((x % size) / 15) * 255);
      data[i + 1] = Math.round((g / 15) * 255);
      data[i + 2] = Math.round((Math.floor(x / size) / 15) * 255);
      data[i + 3] = 255;
    }
  return data;
}

test("a 256x16 LUT strip unpacks to 3D texel order whichever way green runs", () => {
  for (const greenUp of [false, true]) {
    const strip = identityStrip(greenUp);
    assert.equal(lutGreenUp(strip, 16), greenUp);
    const cube = unpackLutStrip(strip, 16, greenUp);
    // Texel (r=3, g=7, b=11) holds its own coordinates in an identity LUT.
    const at = ((11 * 16 + 7) * 16 + 3) * 4;
    assert.deepEqual(
      [cube[at], cube[at + 1], cube[at + 2]],
      [3, 7, 11].map((v) => Math.round((v / 15) * 255)),
    );
  }
});

test("the token sky gradient runs horizon (bottom) to zenith (top)", () => {
  const rows = tokenSkyGradient(32);
  assert.deepEqual([...rows.slice(0, 3)], [0xf8, 0xf3, 0xe8]); // --athena-sky-horizon
  assert.deepEqual([...rows.slice(-4, -1)], [0x5e, 0x93, 0xb8]); // --athena-sky-zenith
});

test("birds and emotes resolve to kit slots", () => {
  assert.equal(birdSlots["birds/1.drc"], "geometries/birds/1");
  assert.equal(birdSlots["birds/2.drc"], "geometries/birds/2");
  assert.equal(emoteSlot(0), "slot:emote/0");
  assert.equal(EMOTE_SECONDS, 2);
});
