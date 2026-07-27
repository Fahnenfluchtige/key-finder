const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

const appUrl = `file:///${path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/")}`;
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

async function openPage(browser, viewport = { width: 390, height: 844 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(appUrl);
  return page;
}

async function clickFret(page, label) {
  await page.getByRole("button", { name: label, exact: true }).click();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });

  const page = await openPage(browser);
  await clickFret(page, "B, лад 1, нота C");
  await clickFret(page, "e, лад 0, нота E");
  await clickFret(page, "G, лад 0, нота G");

  assert.equal(await page.locator("#fretboard .fret-button.is-picked").count(), 3);
  assert.equal(await page.locator("#fretboard .fret-button.is-selected").count(), 0);
  assert.equal(await page.locator(".chord-card .result-title").first().textContent(), "C");

  await page.locator("#center-select").selectOption("C");
  assert.equal(await page.locator("#detail-title").textContent(), "C major");
  assert.equal(await page.locator("#triad-row .degree-card").count(), 7);
  assert.equal(await page.locator("#seventh-row .degree-card").count(), 7);

  const beforeDrag = await page.locator("#fretboard-scroll").evaluate((el) => el.scrollLeft);
  await page.locator("#fretboard-scroll").evaluate((el) => {
    el.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 300, bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 80, bubbles: true }));
    el.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, clientX: 80, bubbles: true }));
  });
  const afterDrag = await page.locator("#fretboard-scroll").evaluate((el) => el.scrollLeft);
  assert.ok(afterDrag > beforeDrag, "drag should scroll the main fretboard");

  await page.getByRole("button", { name: "Бас", exact: true }).click();
  await page.locator("#tuning-select").selectOption("bass-drop-d");
  assert.equal(await page.locator("#active-tuning-label").textContent(), "D A D G");
  assert.equal(await page.locator("#fretboard .fret-button").count(), 64);

  await page.getByRole("button", { name: "Библиотека аккордов" }).click();
  await page.locator("#library-root-select").selectOption("C");
  await page.locator("#library-mode-select").selectOption("mixolydian");
  await page.locator("#library-extension-select").selectOption("ninth");
  assert.equal(await page.locator("#library-map-title").textContent(), "I C9");

  const legend = await page.locator("#interval-legend").textContent();
  ["1", "3", "5", "b7", "9"].forEach((label) => assert.ok(legend.includes(label), `missing ${label}`));
  assert.ok((await page.locator("#library-map-board .is-tone").count()) > 0);
  assert.ok((await page.locator("#voicing-grid .voicing-card").count()) > 0);

  const theory = await page.evaluate(() => {
    const api = window.__KEY_FINDER_TESTS__;
    const cMajor = api.notesForScale("C", { intervals: [0, 2, 4, 5, 7, 9, 11] });
    const cMixolydian = api.chordFromScaleDegree(["C", "D", "E", "F", "G", "A", "A#"], 0, "ninth");
    return { cMajor, cMixolydian };
  });
  assert.deepEqual(theory.cMajor, ["C", "D", "E", "F", "G", "A", "B"]);
  assert.deepEqual(theory.cMixolydian.notes, ["C", "E", "G", "A#", "D"]);
  assert.equal(theory.cMixolydian.symbol, "C9");

  await page.close();
  await browser.close();
  console.log("All Key Finder tests passed.");
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
