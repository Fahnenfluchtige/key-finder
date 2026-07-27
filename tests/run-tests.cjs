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
  await page.getByRole("button", { name: "Определитель" }).click();
  await page.getByRole("button", { name: "Гитара", exact: true }).click();
  await page.getByRole("button", { name: "Библиотека аккордов" }).click();
  await page.locator("#library-root-select").selectOption("C");
  await page.locator("#library-mode-select").selectOption("mixolydian");
  await page.locator("#library-extension-select").selectOption("ninth");
  assert.equal(await page.locator("#library-map-title").textContent(), "I C9");

  const legend = await page.locator("#interval-legend").textContent();
  ["1", "3", "5", "b7", "9"].forEach((label) => assert.ok(legend.includes(label), `missing ${label}`));
  assert.ok(legend.includes("b7 = Bb"), "C mixolydian should display the flat seventh as Bb");
  assert.ok(!(legend.includes("b7 = A#")), "C mixolydian should not show A# for the flat seventh");
  assert.ok((await page.locator("#library-map-board .is-tone").count()) > 0);
  assert.ok((await page.locator("#voicing-grid .voicing-card").count()) > 0);

  await page.locator("#library-mode-select").selectOption("major");
  await page.locator("#library-extension-select").selectOption("triad");
  await page.locator("#library-degree-select").selectOption("0");
  assert.equal(await page.locator("#library-map-title").textContent(), "I C");
  const cMajorDisplayedNotes = await page.locator("#voicing-grid .voicing-card .degree-notes").evaluateAll((nodes) =>
    nodes.slice(0, 4).map((node) => node.textContent)
  );
  assert.ok(cMajorDisplayedNotes.every((notes) => notes === "C E G"), `C variants should display stable chord-tone order; got ${cMajorDisplayedNotes.join(", ")}`);
  assert.equal(await page.locator("#voicing-grid .voicing-card").first().locator(".string-status.is-open").count(), 2);
  assert.equal(await page.locator("#voicing-grid .voicing-card").first().locator(".string-status.is-muted").count(), 1);
  const cMajorTags = await page.locator("#voicing-grid .voicing-card").first().locator(".voicing-tags").textContent();
  assert.ok(cMajorTags.includes("open"), "C major open shape should be tagged open");
  assert.ok(cMajorTags.includes("easy"), "C major open shape should be tagged easy");

  await page.locator("#library-voicing-filter").selectOption("barre");
  const cMajorBarreCount = await page.locator("#voicing-grid .voicing-card").count();
  assert.ok(cMajorBarreCount > 0, "C major should have barre options in the filtered list");
  const barreTagText = await page.locator("#voicing-grid .voicing-card").first().locator(".voicing-tags").textContent();
  assert.ok(barreTagText.includes("barre"), "barre filter should show barre-tagged voicings");
  await page.locator("#library-voicing-filter").selectOption("all");

  await page.locator("#library-degree-select").selectOption("3");
  assert.equal(await page.locator("#library-map-title").textContent(), "IV F");
  assert.equal(await page.locator("#voicing-grid .voicing-card").first().locator(".mini-cell.is-barre").count(), 6);

  const degreeText = await page.locator("#library-degree-grid").textContent();
  assert.ok(degreeText.includes("Bdim"), "C major triads should include Bdim");
  await page.locator("#library-extension-select").selectOption("seventh");
  const seventhDegreeText = await page.locator("#library-degree-grid").textContent();
  assert.ok(seventhDegreeText.includes("Bm7b5"), "C major seventh chords should include Bm7b5");

  const theory = await page.evaluate(() => {
    const api = window.__KEY_FINDER_TESTS__;
    const cMajor = api.notesForScale("C", { intervals: [0, 2, 4, 5, 7, 9, 11] });
    const cMixolydian = api.chordFromScaleDegree(["C", "D", "E", "F", "G", "A", "A#"], 0, "ninth");
    const cMixolydianDisplay = api.displayNotes(cMixolydian.notes, {
      root: "C",
      scaleType: { id: "mixolydian" }
    });
    api.state.instrument = "guitar";
    api.state.tuningId = "guitar-standard";

    const voicingKeys = (symbol, root, notes, extension = "triad") =>
      api.generateVoicings({ symbol, root, notes, extension }).map((voicing) => voicing.key);
    const firstKey = (symbol, root, notes, extension = "triad") => voicingKeys(symbol, root, notes, extension)[0];
    const firstTags = (symbol, root, notes, extension = "triad") =>
      api.classifyVoicing(api.generateVoicings({ symbol, root, notes, extension })[0]);
    const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteIndex = Object.fromEntries(roots.map((note, index) => [note, index]));
    const transpose = (root, semitones) => roots[(noteIndex[root] + semitones + 120) % 12];
    const majorNotes = (root) => [root, transpose(root, 4), transpose(root, 7)];
    const minorNotes = (root) => [root, transpose(root, 3), transpose(root, 7)];
    const keyFromShape = (shape, offset) => shape.map((fret) => (fret === null ? "x" : String(fret + offset))).join("-");
    const fitsShape = (shape, offset) => shape.every((fret) => fret === null || (fret + offset >= 0 && fret + offset <= 15));
    const cagedShapes = [
      { base: "C", shape: [0, 1, 0, 2, 3, null] },
      { base: "A", shape: [0, 2, 2, 2, 0, null] },
      { base: "G", shape: [3, 0, 0, 0, 2, 3] },
      { base: "E", shape: [0, 0, 1, 2, 2, 0] },
      { base: "D", shape: [2, 3, 2, 0, null, null] }
    ];

    const knownShapes = {
      C: firstKey("C", "C", ["C", "E", "G"]),
      D: firstKey("D", "D", ["D", "F#", "A"]),
      E: firstKey("E", "E", ["E", "G#", "B"]),
      G: firstKey("G", "G", ["G", "B", "D"]),
      A: firstKey("A", "A", ["A", "C#", "E"]),
      Am: firstKey("Am", "A", ["A", "C", "E"]),
      Dm: firstKey("Dm", "D", ["D", "F", "A"]),
      Em: firstKey("Em", "E", ["E", "G", "B"]),
      F: firstKey("F", "F", ["F", "A", "C"]),
      Bm: firstKey("Bm", "B", ["B", "D", "F#"]),
      E7: firstKey("E7", "E", ["E", "G#", "B", "D"], "seventh"),
      Am7: firstKey("Am7", "A", ["A", "C", "E", "G"], "seventh"),
      Fmaj7: firstKey("Fmaj7", "F", ["F", "A", "C", "E"], "seventh"),
      Fsus4: firstKey("Fsus4", "F", ["F", "A#", "C"])
    };

    const knownTags = {
      C: firstTags("C", "C", ["C", "E", "G"]),
      F: firstTags("F", "F", ["F", "A", "C"]),
      Bm: firstTags("Bm", "B", ["B", "D", "F#"])
    };

    const relatedCMajor = {
      C: voicingKeys("C", "C", ["C", "E", "G"]),
      Dm: voicingKeys("Dm", "D", ["D", "F", "A"]),
      Em: voicingKeys("Em", "E", ["E", "G", "B"]),
      F: voicingKeys("F", "F", ["F", "A", "C"]),
      G: voicingKeys("G", "G", ["G", "B", "D"]),
      Am: voicingKeys("Am", "A", ["A", "C", "E"]),
      Bdim: voicingKeys("Bdim", "B", ["B", "D", "F"]),
      Cmaj7: voicingKeys("Cmaj7", "C", ["C", "E", "G", "B"], "seventh"),
      Dm7: voicingKeys("Dm7", "D", ["D", "F", "A", "C"], "seventh"),
      Em7: voicingKeys("Em7", "E", ["E", "G", "B", "D"], "seventh"),
      Fmaj7: voicingKeys("Fmaj7", "F", ["F", "A", "C", "E"], "seventh"),
      G7: voicingKeys("G7", "G", ["G", "B", "D", "F"], "seventh"),
      Am7: voicingKeys("Am7", "A", ["A", "C", "E", "G"], "seventh"),
      Bm7b5: voicingKeys("Bm7b5", "B", ["B", "D", "F", "A"], "seventh")
    };

    const cagedMajor = Object.fromEntries(roots.map((root) => {
      const actual = voicingKeys(root, root, majorNotes(root));
      const expected = cagedShapes
        .map(({ base, shape }) => ({ offset: (noteIndex[root] - noteIndex[base] + 12) % 12, shape }))
        .filter(({ offset, shape }) => fitsShape(shape, offset))
        .map(({ offset, shape }) => keyFromShape(shape, offset));
      return [root, { actual, expected }];
    }));

    const allMinorFirstShapes = Object.fromEntries(roots.map((root) => [
      root,
      firstKey(`${root}m`, root, minorNotes(root))
    ]));

    const qualityMatrix = [
      { suffix: "", extension: "triad", intervals: [0, 4, 7] },
      { suffix: "m", extension: "triad", intervals: [0, 3, 7] },
      { suffix: "7", extension: "seventh", intervals: [0, 4, 7, 10] },
      { suffix: "m7", extension: "seventh", intervals: [0, 3, 7, 10] },
      { suffix: "maj7", extension: "seventh", intervals: [0, 4, 7, 11] },
      { suffix: "sus4", extension: "triad", intervals: [0, 5, 7] },
      { suffix: "dim", extension: "triad", intervals: [0, 3, 6] },
      { suffix: "m7b5", extension: "seventh", intervals: [0, 3, 6, 10] }
    ];
    const playableQualityMatrix = qualityMatrix.flatMap((quality) =>
      roots.map((root) => {
        const notes = quality.intervals.map((interval) => transpose(root, interval));
        const voicing = api.generateVoicings({
          symbol: `${root}${quality.suffix}`,
          root,
          notes,
          extension: quality.extension
        })[0];
        return {
          symbol: `${root}${quality.suffix || " major"}`,
          expectedCore: notes.slice(0, 3),
          key: voicing && voicing.key,
          notes: voicing ? voicing.notes : []
        };
      })
    );

    return { cMajor, cMixolydian, cMixolydianDisplay, knownShapes, knownTags, relatedCMajor, cagedMajor, allMinorFirstShapes, playableQualityMatrix };
  });
  assert.deepEqual(theory.cMajor, ["C", "D", "E", "F", "G", "A", "B"]);
  assert.deepEqual(theory.cMixolydian.notes, ["C", "E", "G", "A#", "D"]);
  assert.equal(theory.cMixolydian.symbol, "C9");
  assert.equal(theory.cMixolydianDisplay, "C E G Bb D");
  assert.deepEqual(theory.knownShapes, {
    C: "0-1-0-2-3-x",
    D: "2-3-2-0-x-x",
    E: "0-0-1-2-2-0",
    G: "3-0-0-0-2-3",
    A: "0-2-2-2-0-x",
    Am: "0-1-2-2-0-x",
    Dm: "1-3-2-0-x-x",
    Em: "0-0-0-2-2-0",
    F: "1-1-2-3-3-1",
    Bm: "2-3-4-4-2-x",
    E7: "0-0-1-0-2-0",
    Am7: "0-1-0-2-0-x",
    Fmaj7: "1-1-2-2-3-1",
    Fsus4: "1-1-3-3-3-1"
  });
  assert.ok(theory.knownTags.C.includes("open"), "C major should be classified as open");
  assert.ok(theory.knownTags.C.includes("easy"), "C major should be classified as easy");
  assert.ok(theory.knownTags.F.includes("barre"), "F major should be classified as barre");
  assert.ok(theory.knownTags.Bm.includes("barre"), "Bm should be classified as barre");
  assert.ok(theory.relatedCMajor.F.includes("1-1-2-3-x-x"), "F easy XX3211 should be present");
  assert.equal(theory.relatedCMajor.Bdim[0], "x-3-4-3-2-x");
  assert.equal(theory.relatedCMajor.Bm7b5[0], "x-3-2-3-2-x");
  assert.equal(theory.relatedCMajor.Dm7[0], "1-1-2-0-x-x");
  assert.equal(theory.relatedCMajor.Em7[0], "0-3-0-2-2-0");
  Object.entries(theory.cagedMajor).forEach(([root, { actual, expected }]) => {
    assert.ok(actual.length > 0, `${root} major should have voicings`);
    expected.forEach((shape) => {
      assert.ok(actual.includes(shape), `${root} major should include CAGED shape ${shape}; got ${actual.join(", ")}`);
    });
  });
  Object.entries(theory.allMinorFirstShapes).forEach(([root, shape]) => {
    assert.ok(shape, `${root} minor should have a first voicing`);
    assert.equal(shape.split("-").length, 6, `${root} minor voicing should cover six strings as slots`);
    shape.split("-").forEach((fret) => {
      if (fret === "x") return;
      assert.ok(Number(fret) >= 0 && Number(fret) <= 15, `${root} minor fret ${fret} should be in 0-15`);
    });
  });
  theory.playableQualityMatrix.forEach((item) => {
    assert.ok(item.key, `${item.symbol} should have a playable voicing`);
    assert.equal(item.key.split("-").length, 6, `${item.symbol} should use six string slots`);
    item.key.split("-").forEach((fret) => {
      if (fret === "x") return;
      assert.ok(Number(fret) >= 0 && Number(fret) <= 15, `${item.symbol} fret ${fret} should be in 0-15`);
    });
    item.expectedCore.forEach((note) => {
      assert.ok(item.notes.includes(note), `${item.symbol} should include core note ${note}; got ${item.notes.join(" ")}`);
    });
  });

  await page.close();
  await browser.close();
  console.log("All Key Finder tests passed.");
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
