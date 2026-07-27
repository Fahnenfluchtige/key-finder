(function () {
  "use strict";

  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const NOTE_INDEX = Object.fromEntries(NOTE_NAMES.map((note, index) => [note, index]));
  const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const FRETS = Array.from({ length: 16 }, (_, index) => index);
  const KEYBOARD_NOTES = {
    KeyA: "C",
    KeyW: "C#",
    KeyS: "D",
    KeyE: "D#",
    KeyD: "E",
    KeyF: "F",
    KeyT: "F#",
    KeyG: "G",
    KeyY: "G#",
    KeyH: "A",
    KeyU: "A#",
    KeyJ: "B"
  };

  const TUNINGS = {
    guitar: [
      {
        id: "guitar-standard",
        name: "Standard",
        label: "E A D G B E",
        strings: [
          { label: "e", note: "E" },
          { label: "B", note: "B" },
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "E", note: "E" }
        ]
      },
      {
        id: "guitar-drop-d",
        name: "Drop D",
        label: "D A D G B E",
        strings: [
          { label: "e", note: "E" },
          { label: "B", note: "B" },
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "D", note: "D" }
        ]
      },
      {
        id: "guitar-dadgad",
        name: "DADGAD",
        label: "D A D G A D",
        strings: [
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "D", note: "D" }
        ]
      },
      {
        id: "guitar-open-g",
        name: "Open G",
        label: "D G D G B D",
        strings: [
          { label: "D", note: "D" },
          { label: "B", note: "B" },
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "G", note: "G" },
          { label: "D", note: "D" }
        ]
      }
    ],
    bass: [
      {
        id: "bass-standard",
        name: "Standard",
        label: "E A D G",
        strings: [
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "E", note: "E" }
        ]
      },
      {
        id: "bass-drop-d",
        name: "Drop D",
        label: "D A D G",
        strings: [
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "D", note: "D" }
        ]
      },
      {
        id: "bass-bead",
        name: "BEAD",
        label: "B E A D",
        strings: [
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "E", note: "E" },
          { label: "B", note: "B" }
        ]
      },
      {
        id: "bass-5-string",
        name: "5-string",
        label: "B E A D G",
        strings: [
          { label: "G", note: "G" },
          { label: "D", note: "D" },
          { label: "A", note: "A" },
          { label: "E", note: "E" },
          { label: "B", note: "B" }
        ]
      }
    ]
  };

  const SCALE_TYPES = [
    { id: "major", name: "major", family: "core", intervals: [0, 2, 4, 5, 7, 9, 11], chords: true },
    { id: "natural-minor", name: "natural minor", family: "core", intervals: [0, 2, 3, 5, 7, 8, 10], chords: true },
    { id: "dorian", name: "dorian", family: "core", intervals: [0, 2, 3, 5, 7, 9, 10], chords: true },
    { id: "phrygian", name: "phrygian", family: "core", intervals: [0, 1, 3, 5, 7, 8, 10], chords: true },
    { id: "lydian", name: "lydian", family: "core", intervals: [0, 2, 4, 6, 7, 9, 11], chords: true },
    { id: "mixolydian", name: "mixolydian", family: "core", intervals: [0, 2, 4, 5, 7, 9, 10], chords: true },
    { id: "locrian", name: "locrian", family: "core", intervals: [0, 1, 3, 5, 6, 8, 10], chords: true },
    { id: "harmonic-minor", name: "harmonic minor", family: "minor", intervals: [0, 2, 3, 5, 7, 8, 11], chords: true },
    { id: "melodic-minor", name: "melodic minor", family: "minor", intervals: [0, 2, 3, 5, 7, 9, 11], chords: true },
    { id: "major-pentatonic", name: "major pentatonic", family: "color", intervals: [0, 2, 4, 7, 9], chords: false },
    { id: "minor-pentatonic", name: "minor pentatonic", family: "color", intervals: [0, 3, 5, 7, 10], chords: false },
    { id: "blues", name: "blues", family: "color", intervals: [0, 3, 5, 6, 7, 10], chords: false }
  ];

  const CHORD_TYPES = [
    { suffix: "", name: "major", intervals: [0, 4, 7] },
    { suffix: "m", name: "minor", intervals: [0, 3, 7] },
    { suffix: "5", name: "power chord", intervals: [0, 7] },
    { suffix: "dim", name: "diminished", intervals: [0, 3, 6] },
    { suffix: "aug", name: "augmented", intervals: [0, 4, 8] },
    { suffix: "sus2", name: "suspended 2", intervals: [0, 2, 7] },
    { suffix: "sus4", name: "suspended 4", intervals: [0, 5, 7] },
    { suffix: "6", name: "sixth", intervals: [0, 4, 7, 9] },
    { suffix: "m6", name: "minor sixth", intervals: [0, 3, 7, 9] },
    { suffix: "7", name: "dominant seventh", intervals: [0, 4, 7, 10] },
    { suffix: "maj7", name: "major seventh", intervals: [0, 4, 7, 11] },
    { suffix: "m7", name: "minor seventh", intervals: [0, 3, 7, 10] },
    { suffix: "mMaj7", name: "minor major seventh", intervals: [0, 3, 7, 11] },
    { suffix: "m7b5", name: "half-diminished", intervals: [0, 3, 6, 10] },
    { suffix: "dim7", name: "diminished seventh", intervals: [0, 3, 6, 9] },
    { suffix: "add9", name: "add nine", intervals: [0, 4, 7, 14] },
    { suffix: "madd9", name: "minor add nine", intervals: [0, 3, 7, 14] },
    { suffix: "9", name: "ninth", intervals: [0, 4, 7, 10, 14] },
    { suffix: "maj9", name: "major ninth", intervals: [0, 4, 7, 11, 14] },
    { suffix: "m9", name: "minor ninth", intervals: [0, 3, 7, 10, 14] }
  ];

  const MODE_TRANSLATIONS = {
    major: "мажор",
    "natural minor": "натуральный минор",
    dorian: "дорийский",
    phrygian: "фригийский",
    lydian: "лидийский",
    mixolydian: "миксолидийский",
    locrian: "локрийский",
    "harmonic minor": "гармонический минор",
    "melodic minor": "мелодический минор",
    "major pentatonic": "мажорная пентатоника",
    "minor pentatonic": "минорная пентатоника",
    blues: "блюзовая гамма"
  };

  const EXTENSION_STEPS = {
    triad: [0, 2, 4],
    seventh: [0, 2, 4, 6],
    ninth: [0, 2, 4, 6, 8]
  };

  const state = {
    counts: Object.fromEntries(NOTE_NAMES.map((note) => [note, 0])),
    history: [],
    selectedPositions: new Set(),
    instrument: "guitar",
    tuningId: "guitar-standard",
    centerNote: "",
    bassNote: "",
    filter: "all",
    selectedScaleKey: "",
    scalePinned: false,
    tab: "finder",
    libraryRoot: "C",
    libraryMode: "major",
    libraryDegree: 0,
    libraryExtension: "triad"
  };

  const elements = {
    selectedChips: document.querySelector("#selected-chips"),
    resultsList: document.querySelector("#results-list"),
    chordMatchPanel: document.querySelector("#chord-match-panel"),
    chordResults: document.querySelector("#chord-results"),
    emptyState: document.querySelector("#empty-state"),
    detailPanel: document.querySelector("#detail-panel"),
    detailTitle: document.querySelector("#detail-title"),
    detailNotes: document.querySelector("#detail-notes"),
    triadRow: document.querySelector("#triad-row"),
    seventhRow: document.querySelector("#seventh-row"),
    fretboard: document.querySelector("#fretboard"),
    fretboardScroll: document.querySelector("#fretboard-scroll"),
    visibleWindowLabel: document.querySelector("#visible-window-label"),
    tuningSelect: document.querySelector("#tuning-select"),
    centerSelect: document.querySelector("#center-select"),
    bassSelect: document.querySelector("#bass-select"),
    activeInstrumentTitle: document.querySelector("#active-instrument-title"),
    activeTuningLabel: document.querySelector("#active-tuning-label"),
    undoButton: document.querySelector("#undo-button"),
    clearButton: document.querySelector("#clear-button"),
    libraryRootSelect: document.querySelector("#library-root-select"),
    libraryModeSelect: document.querySelector("#library-mode-select"),
    libraryDegreeSelect: document.querySelector("#library-degree-select"),
    libraryExtensionSelect: document.querySelector("#library-extension-select"),
    libraryScaleTitle: document.querySelector("#library-scale-title"),
    libraryScaleNotes: document.querySelector("#library-scale-notes"),
    libraryDegreeGrid: document.querySelector("#library-degree-grid"),
    libraryMapTitle: document.querySelector("#library-map-title"),
    libraryMapNotes: document.querySelector("#library-map-notes"),
    libraryMapScroll: document.querySelector("#library-map-scroll"),
    libraryMapBoard: document.querySelector("#library-map-board"),
    intervalLegend: document.querySelector("#interval-legend"),
    voicingTitle: document.querySelector("#voicing-title"),
    voicingGrid: document.querySelector("#voicing-grid")
  };

  function transpose(note, semitones) {
    return NOTE_NAMES[(NOTE_INDEX[note] + semitones + 120) % 12];
  }

  function activeTuning() {
    return TUNINGS[state.instrument].find((tuning) => tuning.id === state.tuningId) || TUNINGS[state.instrument][0];
  }

  function notesForScale(root, scaleType) {
    return scaleType.intervals.map((interval) => transpose(root, interval));
  }

  function scaleTypeById(id) {
    return SCALE_TYPES.find((scaleType) => scaleType.id === id) || SCALE_TYPES[0];
  }

  function noteAt(stringNote, fret) {
    return transpose(stringNote, fret);
  }

  function uniqueSelectedNotes() {
    return NOTE_NAMES.filter((note) => state.counts[note] > 0);
  }

  function lastNote() {
    const last = state.history[state.history.length - 1];
    return last ? last.note : "";
  }

  function commonNotes() {
    const maxCount = Math.max(...Object.values(state.counts));
    if (maxCount <= 1) return [];
    return NOTE_NAMES.filter((note) => state.counts[note] === maxCount);
  }

  function addNote(note, source, positionKey) {
    state.counts[note] += 1;
    state.history.push({ type: positionKey ? "position" : "note", note, source, positionKey });
  }

  function removeOne(note) {
    if (!state.counts[note]) return;
    const historyIndex = state.history.map((entry) => entry.note).lastIndexOf(note);
    const entry = historyIndex >= 0 ? state.history.splice(historyIndex, 1)[0] : null;
    if (entry && entry.positionKey) state.selectedPositions.delete(entry.positionKey);
    state.counts[note] = Math.max(0, state.counts[note] - 1);
    if (state.bassNote === note && state.counts[note] === 0) state.bassNote = "";
    render();
  }

  function togglePosition(note, positionKey) {
    if (state.selectedPositions.has(positionKey)) {
      state.selectedPositions.delete(positionKey);
      const historyIndex = state.history.findLastIndex((entry) => entry.positionKey === positionKey);
      if (historyIndex >= 0) state.history.splice(historyIndex, 1);
      state.counts[note] = Math.max(0, state.counts[note] - 1);
      if (state.bassNote === note && state.counts[note] === 0) state.bassNote = "";
    } else {
      state.selectedPositions.add(positionKey);
      addNote(note, state.instrument, positionKey);
      if (state.instrument === "bass") state.bassNote = note;
    }
    state.scalePinned = false;
    render();
  }

  function scoreScale(root, scaleType, selectedNotes) {
    const scaleNotes = notesForScale(root, scaleType);
    const scaleSet = new Set(scaleNotes);
    const selectedSet = new Set(selectedNotes);
    const matched = selectedNotes.filter((note) => scaleSet.has(note));
    const outside = selectedNotes.filter((note) => !scaleSet.has(note));
    const missing = scaleNotes.filter((note) => !selectedSet.has(note));
    const reasons = [];

    let score = matched.length * 12 - outside.length * 18 - missing.length * 1.4;

    if (state.centerNote) {
      if (state.centerNote === root) {
        score += 26;
        reasons.push("выбранная тоника совпала");
      } else if (scaleSet.has(state.centerNote)) {
        score += 4;
        reasons.push("выбранная тоника есть в ладу");
      } else {
        score -= 8;
      }
    }

    if (state.bassNote) {
      if (state.bassNote === root) {
        score += 10;
        reasons.push("бас совпал с корнем");
      } else if (state.bassNote === transpose(root, 7)) {
        score += 4;
        reasons.push("бас на пятой ступени");
      } else if (scaleSet.has(state.bassNote)) {
        score += 2;
        reasons.push("бас есть в ладу");
      } else {
        score -= 6;
      }
    }

    const recent = lastNote();
    if (recent) {
      if (recent === root) {
        score += 7;
        reasons.push("последний клик был на корне");
      } else if (!scaleSet.has(recent)) {
        score -= 3;
      }
    }

    commonNotes().forEach((note) => {
      if (note === root) {
        score += 5;
        reasons.push("корень встречается чаще");
      } else if (scaleSet.has(note)) {
        score += 2;
      }
    });

    if (outside.length === 0 && missing.length === 0) {
      score += 18;
      reasons.unshift("выбраны все ноты лада");
    } else if (outside.length === 0) {
      reasons.unshift(`совпало ${matched.length} из ${scaleNotes.length}`);
    }

    const matchRatio = selectedNotes.length ? matched.length / selectedNotes.length : 0;
    const coverageRatio = matched.length / scaleNotes.length;
    const penalty = outside.length ? outside.length * 9 : 0;
    const intentBoost = Math.max(0, score) / 9;
    const confidence = Math.max(0, Math.min(100, Math.round(matchRatio * 58 + coverageRatio * 30 + intentBoost - penalty)));

    return {
      key: `${root}:${scaleType.id}`,
      root,
      scaleType,
      title: `${root} ${scaleType.name}`,
      translated: `${root} ${MODE_TRANSLATIONS[scaleType.name]}`,
      scaleNotes,
      matched,
      outside,
      missing,
      reasons,
      rawScore: score,
      confidence
    };
  }

  function allResults() {
    const selectedNotes = uniqueSelectedNotes();
    if (!selectedNotes.length) return [];

    return NOTE_NAMES.flatMap((root) =>
      SCALE_TYPES
        .filter((scaleType) => state.filter === "all" || scaleType.family === state.filter)
        .map((scaleType) => scoreScale(root, scaleType, selectedNotes))
    )
      .sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return b.rawScore - a.rawScore;
      })
      .slice(0, 10);
  }

  function notesForChord(root, chordType) {
    return [...new Set(chordType.intervals.map((interval) => transpose(root, interval)))];
  }

  function selectedNotesForChord() {
    const notes = uniqueSelectedNotes();
    if (state.bassNote && !notes.includes(state.bassNote)) return [...notes, state.bassNote];
    return notes;
  }

  function scoreChord(root, chordType, selectedNotes) {
    const chordNotes = notesForChord(root, chordType);
    const chordSet = new Set(chordNotes);
    const selectedSet = new Set(selectedNotes);
    const matched = selectedNotes.filter((note) => chordSet.has(note));
    const outside = selectedNotes.filter((note) => !chordSet.has(note));
    const missing = chordNotes.filter((note) => !selectedSet.has(note));
    const reasons = [];
    const rootIsPresent = selectedSet.has(root);
    const bassIsInChord = state.bassNote && chordSet.has(state.bassNote);
    const slashBass = bassIsInChord && state.bassNote !== root ? state.bassNote : "";

    let score = matched.length * 18 - missing.length * 11 - outside.length * 20;

    if (outside.length === 0 && missing.length === 0) {
      score += 26;
      reasons.push("точное совпадение");
    } else if (outside.length === 0) {
      score += 7;
      reasons.push(`совпало ${matched.length} из ${chordNotes.length}`);
    }

    if (rootIsPresent) {
      score += 8;
      reasons.push("корень звучит");
    }

    if (state.bassNote) {
      if (state.bassNote === root) {
        score += 12;
        reasons.push("бас на корне");
      } else if (bassIsInChord) {
        score += 8;
        reasons.push("бас дает обращение");
      } else {
        score -= 9;
        reasons.push("бас вне аккорда");
      }
    }

    const recent = lastNote();
    if (recent) {
      if (recent === root) {
        score += 5;
        reasons.push("последний клик был на корне");
      } else if (chordSet.has(recent)) {
        score += 2;
      } else {
        score -= 4;
      }
    }

    commonNotes().forEach((note) => {
      if (note === root) score += 4;
      else if (chordSet.has(note)) score += 2;
    });

    if (state.centerNote === root) score += 4;

    const matchRatio = selectedNotes.length ? matched.length / selectedNotes.length : 0;
    const coverageRatio = matched.length / chordNotes.length;
    const confidence = Math.max(
      0,
      Math.min(100, Math.round(matchRatio * 48 + coverageRatio * 38 + Math.max(0, score) / 8 - outside.length * 12))
    );
    const baseTitle = `${root}${chordType.suffix}`;

    return {
      root,
      chordType,
      title: slashBass ? `${baseTitle}/${slashBass}` : baseTitle,
      subtitle: chordType.name,
      chordNotes,
      matched,
      outside,
      missing,
      reasons,
      confidence,
      rawScore: score
    };
  }

  function chordMatches() {
    const selectedNotes = selectedNotesForChord();
    if (selectedNotes.length < 2) return [];

    return NOTE_NAMES.flatMap((root) => CHORD_TYPES.map((chordType) => scoreChord(root, chordType, selectedNotes)))
      .filter((result) => result.matched.length >= 2 && result.confidence >= 34)
      .sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        if (a.outside.length !== b.outside.length) return a.outside.length - b.outside.length;
        if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
        return b.rawScore - a.rawScore;
      })
      .slice(0, 6);
  }

  function triadSuffix(root, third, fifth) {
    const thirdInterval = (NOTE_INDEX[third] - NOTE_INDEX[root] + 12) % 12;
    const fifthInterval = (NOTE_INDEX[fifth] - NOTE_INDEX[root] + 12) % 12;
    if (thirdInterval === 4 && fifthInterval === 7) return "";
    if (thirdInterval === 3 && fifthInterval === 7) return "m";
    if (thirdInterval === 3 && fifthInterval === 6) return "dim";
    if (thirdInterval === 4 && fifthInterval === 8) return "aug";
    if (thirdInterval === 2 && fifthInterval === 7) return "sus2";
    if (thirdInterval === 5 && fifthInterval === 7) return "sus4";
    return "sus";
  }

  function seventhSuffix(root, third, fifth, seventh) {
    const triad = triadSuffix(root, third, fifth);
    const seventhInterval = (NOTE_INDEX[seventh] - NOTE_INDEX[root] + 12) % 12;
    if (triad === "" && seventhInterval === 11) return "maj7";
    if (triad === "" && seventhInterval === 10) return "7";
    if (triad === "m" && seventhInterval === 10) return "m7";
    if (triad === "m" && seventhInterval === 11) return "mMaj7";
    if (triad === "dim" && seventhInterval === 10) return "m7b5";
    if (triad === "dim" && seventhInterval === 9) return "dim7";
    return `${triad}7`;
  }

  function chordFromScaleDegree(scaleNotes, degree, extension) {
    const steps = EXTENSION_STEPS[extension];
    const notes = steps.map((step) => scaleNotes[(degree + step) % scaleNotes.length]);
    const root = notes[0];
    const suffix =
      extension === "triad"
        ? triadSuffix(root, notes[1], notes[2])
        : seventhSuffix(root, notes[1], notes[2], notes[3]);
    const symbol = extension === "ninth" ? `${root}${suffix.replace("7", "9")}` : `${root}${suffix}`;
    return {
      degree: ROMAN_NUMERALS[degree] || String(degree + 1),
      symbol,
      root,
      notes,
      extension
    };
  }

  function scaleChords(result, extension) {
    if (!result || !result.scaleType.chords || result.scaleNotes.length !== 7) return [];
    return result.scaleNotes.map((_, degree) => chordFromScaleDegree(result.scaleNotes, degree, extension));
  }

  function intervalLabel(root, note, roleIndex) {
    if (roleIndex === 0) return "1";
    const semitones = (NOTE_INDEX[note] - NOTE_INDEX[root] + 12) % 12;
    if (roleIndex === 1) return semitones === 3 ? "b3" : semitones === 4 ? "3" : semitones === 2 ? "2" : "4";
    if (roleIndex === 2) return semitones === 6 ? "b5" : semitones === 8 ? "#5" : "5";
    if (roleIndex === 3) return semitones === 11 ? "7" : semitones === 9 ? "bb7" : "b7";
    if (roleIndex === 4) return semitones === 1 ? "b9" : semitones === 3 ? "#9" : "9";
    return "?";
  }

  function chordToneMap(chord) {
    return chord.notes.map((note, index) => ({
      note,
      label: intervalLabel(chord.root, note, index),
      isRoot: index === 0
    }));
  }

  function renderTuningOptions() {
    const tunings = TUNINGS[state.instrument];
    elements.tuningSelect.innerHTML = "";
    tunings.forEach((tuning) => {
      const option = document.createElement("option");
      option.value = tuning.id;
      option.textContent = `${tuning.name} (${tuning.label})`;
      elements.tuningSelect.append(option);
    });
    elements.tuningSelect.value = state.tuningId;
  }

  function renderNoteSelect(select, value) {
    select.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "не выбрано";
    select.append(empty);
    NOTE_NAMES.forEach((note) => {
      const option = document.createElement("option");
      option.value = note;
      option.textContent = note;
      select.append(option);
    });
    select.value = value;
  }

  function renderLibrarySelects() {
    elements.libraryRootSelect.innerHTML = "";
    NOTE_NAMES.forEach((note) => {
      const option = document.createElement("option");
      option.value = note;
      option.textContent = note;
      elements.libraryRootSelect.append(option);
    });
    elements.libraryRootSelect.value = state.libraryRoot;

    elements.libraryModeSelect.innerHTML = "";
    SCALE_TYPES.forEach((scaleType) => {
      const option = document.createElement("option");
      option.value = scaleType.id;
      option.textContent = `${scaleType.name} (${MODE_TRANSLATIONS[scaleType.name]})`;
      elements.libraryModeSelect.append(option);
    });
    elements.libraryModeSelect.value = state.libraryMode;
    elements.libraryExtensionSelect.value = state.libraryExtension;
    renderLibraryDegreeSelect();
  }

  function libraryScale() {
    const scaleType = scaleTypeById(state.libraryMode);
    return {
      root: state.libraryRoot,
      scaleType,
      notes: notesForScale(state.libraryRoot, scaleType)
    };
  }

  function libraryChords(extension) {
    const scale = libraryScale();
    if (!scale.scaleType.chords || scale.notes.length !== 7) return [];
    return scale.notes.map((_, degree) => chordFromScaleDegree(scale.notes, degree, extension || state.libraryExtension));
  }

  function renderLibraryDegreeSelect() {
    const chords = libraryChords(state.libraryExtension);
    elements.libraryDegreeSelect.innerHTML = "";

    if (!chords.length) {
      const option = document.createElement("option");
      option.value = "0";
      option.textContent = "для этого лада нет диатонических аккордов";
      elements.libraryDegreeSelect.append(option);
      elements.libraryDegreeSelect.disabled = true;
      return;
    }

    elements.libraryDegreeSelect.disabled = false;
    if (state.libraryDegree >= chords.length) state.libraryDegree = 0;
    chords.forEach((chord, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${chord.degree} ${chord.symbol}`;
      elements.libraryDegreeSelect.append(option);
    });
    elements.libraryDegreeSelect.value = String(state.libraryDegree);
  }

  function renderChips() {
    elements.selectedChips.innerHTML = "";
    const selected = uniqueSelectedNotes();
    if (!selected.length) {
      const empty = document.createElement("span");
      empty.className = "muted";
      empty.textContent = "ничего";
      elements.selectedChips.append(empty);
      return;
    }

    selected.forEach((note) => {
      const chip = document.createElement("button");
      chip.className = "chip-button";
      chip.type = "button";
      chip.textContent = state.counts[note] > 1 ? `${note} x${state.counts[note]}` : note;
      chip.title = "Убрать одно нажатие";
      chip.addEventListener("click", () => removeOne(note));
      elements.selectedChips.append(chip);
    });
  }

  function renderFretboard() {
    const tuning = activeTuning();
    elements.fretboard.innerHTML = "";
    elements.fretboard.style.setProperty("--string-count", String(tuning.strings.length));
    elements.activeInstrumentTitle.textContent = state.instrument === "guitar" ? "Гитара" : "Бас";
    elements.activeTuningLabel.textContent = tuning.label;

    const corner = document.createElement("div");
    corner.className = "fret-label";
    elements.fretboard.append(corner);

    FRETS.forEach((fret) => {
      const label = document.createElement("div");
      label.className = `fret-label${fret === 0 ? " is-open-fret" : ""}`;
      label.textContent = fret;
      elements.fretboard.append(label);
    });

    tuning.strings.forEach((stringInfo, stringIndex) => {
      const stringLabel = document.createElement("div");
      stringLabel.className = "string-label";
      stringLabel.textContent = stringInfo.label;
      elements.fretboard.append(stringLabel);

      FRETS.forEach((fret) => {
        const note = noteAt(stringInfo.note, fret);
        const positionKey = `${state.instrument}:${state.tuningId}:${stringIndex}:${fret}`;
        const button = document.createElement("button");
        button.className = `fret-button${fret === 0 ? " is-open-string" : ""}`;
        button.type = "button";
        button.dataset.note = note;
        button.dataset.positionKey = positionKey;
        button.setAttribute("aria-label", `${stringInfo.label}, лад ${fret}, нота ${note}`);
        if (state.selectedPositions.has(positionKey)) button.classList.add("is-picked");
        if (state.centerNote === note) button.classList.add("is-center");
        if (state.bassNote === note && state.selectedPositions.has(positionKey)) button.classList.add("is-bass");

        const label = document.createElement("span");
        label.textContent = note;
        button.append(label);
        button.addEventListener("click", (event) => {
          if (event.detail !== 0) return;
          togglePosition(note, positionKey);
        });
        elements.fretboard.append(button);
      });
    });
  }

  function renderChordMatches(chords) {
    elements.chordResults.innerHTML = "";
    elements.chordMatchPanel.hidden = chords.length === 0;

    chords.forEach((chord, index) => {
      const card = document.createElement("article");
      card.className = `chord-card${index === 0 ? " is-top" : ""}`;
      appendResultBody(card, chord.title, chord.subtitle, chord.confidence, chord.reasons, chord.chordNotes, chord.missing, chord.outside);
      elements.chordResults.append(card);
    });
  }

  function appendResultBody(card, titleText, subtitleText, confidence, reasons, notes, missing, outside) {
    const main = document.createElement("div");
    main.className = "result-main";

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = titleText;
    const subtitle = document.createElement("div");
    subtitle.className = "result-subtitle";
    subtitle.textContent = subtitleText;
    titleWrap.append(title, subtitle);

    const score = document.createElement("div");
    score.className = "score-pill";
    score.textContent = `${confidence}%`;
    main.append(titleWrap, score);

    const reasonRow = document.createElement("div");
    reasonRow.className = "reason-row";
    (reasons.length ? reasons : ["частичное совпадение"]).slice(0, 4).forEach((reason) => {
      const pill = document.createElement("span");
      pill.className = "reason";
      pill.textContent = reason;
      reasonRow.append(pill);
    });

    const noteRow = document.createElement("div");
    noteRow.className = "note-row";
    notes.forEach((note) => {
      const pill = document.createElement("span");
      pill.className = "note-pill";
      if (missing.includes(note)) pill.classList.add("missing");
      pill.textContent = note;
      noteRow.append(pill);
    });
    outside.forEach((note) => {
      const pill = document.createElement("span");
      pill.className = "note-pill outside";
      pill.textContent = `вне: ${note}`;
      noteRow.append(pill);
    });

    card.append(main, reasonRow, noteRow);
  }

  function renderResults() {
    const results = allResults();
    const chords = chordMatches();
    elements.resultsList.innerHTML = "";
    elements.emptyState.hidden = results.length > 0;
    renderChordMatches(chords);

    const pinnedResult = state.scalePinned ? results.find((result) => result.key === state.selectedScaleKey) : null;
    const selectedResult = pinnedResult || results.find((result) => result.scaleType.chords) || results[0] || null;
    state.selectedScaleKey = selectedResult ? selectedResult.key : "";

    results.forEach((result, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `result-card${index === 0 ? " is-top" : ""}${result.key === state.selectedScaleKey ? " is-chosen" : ""}`;
      appendResultBody(
        card,
        result.title,
        result.translated,
        result.confidence,
        result.reasons,
        result.scaleNotes,
        result.missing,
        result.outside
      );
      card.addEventListener("click", () => {
        state.selectedScaleKey = result.key;
        state.scalePinned = true;
        renderResults();
      });
      elements.resultsList.append(card);
    });

    renderScaleDetails(selectedResult);
  }

  function renderDegreeCards(container, chords) {
    container.innerHTML = "";
    chords.forEach((chord) => {
      const card = document.createElement("div");
      card.className = "degree-card";

      const top = document.createElement("div");
      top.className = "degree-top";
      const degree = document.createElement("span");
      degree.textContent = chord.degree;
      const symbol = document.createElement("strong");
      symbol.textContent = chord.symbol;
      top.append(degree, symbol);

      const notes = document.createElement("div");
      notes.className = "degree-notes";
      notes.textContent = chord.notes.join(" ");
      card.append(top, notes);
      container.append(card);
    });
  }

  function renderScaleDetails(result) {
    elements.detailPanel.hidden = !result;
    elements.triadRow.innerHTML = "";
    elements.seventhRow.innerHTML = "";
    if (!result) return;

    elements.detailTitle.textContent = result.title;
    elements.detailNotes.textContent = result.scaleNotes.join(" ");

    const triads = scaleChords(result, "triad");
    const sevenths = scaleChords(result, "seventh");
    if (!triads.length) {
      const message = document.createElement("div");
      message.className = "degree-card wide";
      message.textContent = "Для этой гаммы удобнее смотреть найденные аккорды из выбранных нот.";
      elements.triadRow.append(message);
      return;
    }

    renderDegreeCards(elements.triadRow, triads);
    renderDegreeCards(elements.seventhRow, sevenths);
  }

  function renderIntervalLegend(tones) {
    elements.intervalLegend.innerHTML = "";
    tones.forEach((tone) => {
      const pill = document.createElement("span");
      pill.className = "legend-pill";
      pill.textContent = `${tone.label} = ${tone.note}`;
      elements.intervalLegend.append(pill);
    });
  }

  function renderToneMap(board, chord) {
    const tuning = activeTuning();
    const tones = chordToneMap(chord);
    const toneByNote = new Map(tones.map((tone) => [tone.note, tone]));
    board.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "fret-label";
    board.append(corner);

    FRETS.forEach((fret) => {
      const label = document.createElement("div");
      label.className = `fret-label${fret === 0 ? " is-open-fret" : ""}`;
      label.textContent = fret;
      board.append(label);
    });

    tuning.strings.forEach((stringInfo) => {
      const stringLabel = document.createElement("div");
      stringLabel.className = "string-label";
      stringLabel.textContent = stringInfo.label;
      board.append(stringLabel);

      FRETS.forEach((fret) => {
        const note = noteAt(stringInfo.note, fret);
        const tone = toneByNote.get(note);
        const cell = document.createElement("button");
        cell.className = `fret-button${fret === 0 ? " is-open-string" : ""}`;
        cell.type = "button";
        cell.tabIndex = -1;
        cell.setAttribute("aria-label", tone ? `${stringInfo.label}, лад ${fret}, ${tone.label} ${note}` : `${stringInfo.label}, лад ${fret}, ${note}`);
        if (tone) {
          cell.classList.add("is-tone");
          if (tone.isRoot) cell.classList.add("is-root");
        }

        const label = document.createElement("span");
        label.textContent = tone ? tone.label : note;
        cell.append(label);
        board.append(cell);
      });
    });
  }

  function generateVoicings(chord) {
    const tuning = activeTuning();
    const tones = chordToneMap(chord);
    const toneByNote = new Map(tones.map((tone) => [tone.note, tone]));
    const required = new Set(chord.notes.slice(0, Math.min(3, chord.notes.length)));
    const targetMinNotes = state.instrument === "bass" ? 2 : 3;
    const targetMaxNotes = state.instrument === "bass" ? Math.min(4, tuning.strings.length) : tuning.strings.length;
    const candidates = [];

    for (let start = 0; start <= 12; start += 1) {
      const end = Math.min(15, start + 4);
      const choices = tuning.strings.map((stringInfo) => {
        const matches = [];
        for (let fret = 0; fret <= 15; fret += 1) {
          if (fret !== 0 && (fret < start || fret > end)) continue;
          const note = noteAt(stringInfo.note, fret);
          const tone = toneByNote.get(note);
          if (tone) matches.push({ fret, note, label: tone.label });
        }
        return [null, ...matches.slice(0, 4)];
      });

      const walk = (stringIndex, picked) => {
        if (stringIndex === choices.length) {
          const notes = picked.filter(Boolean);
          if (notes.length < targetMinNotes || notes.length > targetMaxNotes) return;
          const uniqueNotes = new Set(notes.map((item) => item.note));
          if (![...required].every((note) => uniqueNotes.has(note))) return;
          const fretted = notes.filter((item) => item.fret > 0).map((item) => item.fret);
          const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
          if (span > 4) return;
          const openCount = notes.filter((item) => item.fret === 0).length;
          const hasRootBass = notes[notes.length - 1] && notes[notes.length - 1].note === chord.root;
          const score = uniqueNotes.size * 12 + notes.length * 2 + openCount + (hasRootBass ? 6 : 0) - span * 2;
          const key = picked.map((item) => (item ? item.fret : "x")).join("-");
          candidates.push({ key, picked, score, span, notes: [...uniqueNotes] });
          return;
        }

        choices[stringIndex].forEach((choice) => walk(stringIndex + 1, [...picked, choice]));
      };

      walk(0, []);
    }

    const unique = new Map();
    candidates
      .sort((a, b) => b.score - a.score)
      .forEach((candidate) => {
        if (!unique.has(candidate.key)) unique.set(candidate.key, candidate);
      });
    return [...unique.values()].slice(0, 6);
  }

  function renderMiniBoard(container, voicing) {
    const tuning = activeTuning();
    const fretted = voicing.picked.filter(Boolean).filter((item) => item.fret > 0).map((item) => item.fret);
    const hasOpen = voicing.picked.some((item) => item && item.fret === 0);
    const min = fretted.length ? Math.max(0, Math.min(...fretted) - 1) : 0;
    const max = fretted.length ? Math.min(15, Math.max(...fretted) + 1) : 4;
    const frets = FRETS.slice(min, max + 1);
    if (hasOpen && !frets.includes(0)) frets.unshift(0);
    container.style.setProperty("--mini-fret-count", String(frets.length));
    container.style.setProperty(
      "--mini-fret-columns",
      frets.map((fret) => (fret === 0 ? "30px" : "40px")).join(" ")
    );
    container.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "mini-label";
    container.append(corner);
    frets.forEach((fret) => {
      const label = document.createElement("div");
      label.className = `mini-label${fret === 0 ? " is-open-fret" : ""}`;
      label.textContent = fret;
      container.append(label);
    });

    tuning.strings.forEach((stringInfo, stringIndex) => {
      const stringLabel = document.createElement("div");
      stringLabel.className = "mini-label";
      stringLabel.textContent = stringInfo.label;
      container.append(stringLabel);

      frets.forEach((fret) => {
        const cell = document.createElement("div");
        cell.className = `mini-cell${fret === 0 ? " is-open-string" : ""}`;
        const picked = voicing.picked[stringIndex];
        if (picked && picked.fret === fret) {
          cell.classList.add("is-tone");
          cell.dataset.label = picked.label;
        } else if (!picked) {
          cell.classList.add("is-muted");
          cell.textContent = fret === frets[0] ? "x" : "";
        }
        container.append(cell);
      });
    });
  }

  function renderVoicings(chord) {
    const voicings = generateVoicings(chord);
    elements.voicingGrid.innerHTML = "";
    elements.voicingTitle.textContent = state.instrument === "bass" ? "Басовые варианты" : "Аппликатуры";

    if (!voicings.length) {
      const empty = document.createElement("div");
      empty.className = "voicing-card";
      empty.textContent = "Для этого строя не нашлось компактных вариантов в пределах 0-15 лада.";
      elements.voicingGrid.append(empty);
      return;
    }

    voicings.forEach((voicing, index) => {
      const card = document.createElement("article");
      card.className = "voicing-card";
      const title = document.createElement("strong");
      title.textContent = `Вариант ${index + 1}`;
      const notes = document.createElement("div");
      notes.className = "degree-notes";
      notes.textContent = voicing.notes.join(" ");
      const board = document.createElement("div");
      board.className = "mini-board";
      renderMiniBoard(board, voicing);
      card.append(title, notes, board);
      elements.voicingGrid.append(card);
    });
  }

  function renderLibraryDegreeGrid(chords) {
    elements.libraryDegreeGrid.innerHTML = "";
    if (!chords.length) {
      const message = document.createElement("div");
      message.className = "degree-card wide";
      message.textContent = "Пентатоника и блюзовая гамма здесь показаны как набор нот; диатонические аккорды строятся для 7-нотных ладов.";
      elements.libraryDegreeGrid.append(message);
      return;
    }

    chords.forEach((chord, index) => {
      const card = document.createElement("button");
      card.className = `degree-card${index === state.libraryDegree ? " is-selected" : ""}`;
      card.type = "button";

      const top = document.createElement("div");
      top.className = "degree-top";
      const degree = document.createElement("span");
      degree.textContent = chord.degree;
      const symbol = document.createElement("strong");
      symbol.textContent = chord.symbol;
      top.append(degree, symbol);

      const notes = document.createElement("div");
      notes.className = "degree-notes";
      notes.textContent = chord.notes.join(" ");
      card.append(top, notes);
      card.addEventListener("click", () => {
        state.libraryDegree = index;
        renderLibrary();
      });
      elements.libraryDegreeGrid.append(card);
    });
  }

  function renderLibrary() {
    const scale = libraryScale();
    const scaleName = `${scale.root} ${scale.scaleType.name}`;
    const chords = libraryChords(state.libraryExtension);
    const selectedChord = chords[state.libraryDegree] || null;

    renderLibrarySelects();
    elements.libraryScaleTitle.textContent = scaleName;
    elements.libraryScaleNotes.textContent = scale.notes.join(" ");
    renderLibraryDegreeGrid(chords);

    if (!selectedChord) {
      elements.libraryMapTitle.textContent = scaleName;
      elements.libraryMapNotes.textContent = "Для этой гаммы нет аккордовой карты.";
      elements.intervalLegend.innerHTML = "";
      elements.libraryMapBoard.innerHTML = "";
      elements.voicingGrid.innerHTML = "";
      return;
    }

    const tones = chordToneMap(selectedChord);
    elements.libraryMapTitle.textContent = `${selectedChord.degree} ${selectedChord.symbol}`;
    elements.libraryMapNotes.textContent = selectedChord.notes.join(" ");
    renderIntervalLegend(tones);
    renderToneMap(elements.libraryMapBoard, selectedChord);
    renderVoicings(selectedChord);
  }

  function renderControls() {
    renderTuningOptions();
    renderNoteSelect(elements.centerSelect, state.centerNote);
    renderNoteSelect(elements.bassSelect, state.bassNote);
    document.querySelectorAll(".instrument-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.instrument === state.instrument);
    });
    document.querySelectorAll(".tab-button").forEach((button) => {
      const active = button.dataset.tab === state.tab;
      button.classList.toggle("is-active", active);
      document.querySelector(`#${button.dataset.tab}-view`).hidden = !active;
      document.querySelector(`#${button.dataset.tab}-view`).classList.toggle("is-active", active);
    });
  }

  function render() {
    renderControls();
    renderChips();
    renderFretboard();
    renderResults();
    renderLibrary();
    updateVisibleWindowLabels();
  }

  function clearAll() {
    NOTE_NAMES.forEach((note) => {
      state.counts[note] = 0;
    });
    state.history = [];
    state.selectedPositions.clear();
    state.centerNote = "";
    state.bassNote = "";
    state.selectedScaleKey = "";
    state.scalePinned = false;
    render();
  }

  function undoLast() {
    const last = state.history.pop();
    if (!last) return;
    if (last.positionKey) state.selectedPositions.delete(last.positionKey);
    state.counts[last.note] = Math.max(0, state.counts[last.note] - 1);
    if (state.bassNote === last.note && state.counts[last.note] === 0) state.bassNote = "";
    render();
  }

  function updateVisibleWindowLabels() {
    const updateOne = (scroll, label) => {
      if (!scroll || !label) return;
      const maxScroll = Math.max(1, scroll.scrollWidth - scroll.clientWidth);
      const ratio = scroll.scrollLeft / maxScroll;
      const first = Math.max(0, Math.min(10, Math.round(ratio * 10)));
      label.textContent = `видно ${first}-${first + 5}`;
    };
    updateOne(elements.fretboardScroll, elements.visibleWindowLabel);
  }

  function enableDragScroll(scroll, onTap) {
    let active = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let tapButton = null;

    scroll.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      active = true;
      moved = false;
      tapButton = event.target.closest(".fret-button");
      startX = event.clientX;
      startLeft = scroll.scrollLeft;
      scroll.classList.add("is-dragging");
      scroll.setPointerCapture(event.pointerId);
    });

    scroll.addEventListener("pointermove", (event) => {
      if (!active) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 14) moved = true;
      scroll.scrollLeft = startLeft - delta;
      updateVisibleWindowLabels();
    });

    const stop = (event) => {
      if (!active) return;
      active = false;
      scroll.classList.remove("is-dragging");
      if (scroll.hasPointerCapture(event.pointerId)) scroll.releasePointerCapture(event.pointerId);
      if (!moved && tapButton && onTap) onTap(tapButton);
      scroll.dataset.dragged = moved ? "true" : "false";
      window.setTimeout(() => {
        scroll.dataset.dragged = "false";
      }, 0);
      tapButton = null;
    };

    scroll.addEventListener("pointerup", stop);
    scroll.addEventListener("pointercancel", stop);
    scroll.addEventListener("scroll", updateVisibleWindowLabels);
  }

  function bindControls() {
    elements.undoButton.addEventListener("click", undoLast);
    elements.clearButton.addEventListener("click", clearAll);

    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.tab;
        renderControls();
        updateVisibleWindowLabels();
      });
    });

    document.querySelectorAll(".instrument-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.instrument = button.dataset.instrument;
        state.tuningId = TUNINGS[state.instrument][0].id;
        state.selectedPositions.clear();
        render();
      });
    });

    elements.tuningSelect.addEventListener("change", () => {
      state.tuningId = elements.tuningSelect.value;
      state.selectedPositions.clear();
      render();
    });

    elements.centerSelect.addEventListener("change", () => {
      state.centerNote = elements.centerSelect.value;
      state.scalePinned = false;
      render();
    });

    elements.bassSelect.addEventListener("change", () => {
      state.bassNote = elements.bassSelect.value;
      render();
    });

    elements.libraryRootSelect.addEventListener("change", () => {
      state.libraryRoot = elements.libraryRootSelect.value;
      renderLibrary();
    });

    elements.libraryModeSelect.addEventListener("change", () => {
      state.libraryMode = elements.libraryModeSelect.value;
      state.libraryDegree = 0;
      renderLibrary();
    });

    elements.libraryDegreeSelect.addEventListener("change", () => {
      state.libraryDegree = Number(elements.libraryDegreeSelect.value);
      renderLibrary();
    });

    elements.libraryExtensionSelect.addEventListener("change", () => {
      state.libraryExtension = elements.libraryExtensionSelect.value;
      renderLibrary();
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        state.selectedScaleKey = "";
        state.scalePinned = false;
        document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("is-active", item === button));
        renderResults();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.repeat || event.target.closest("button, select, input")) return;
      const note = KEYBOARD_NOTES[event.code];
      if (note) {
        event.preventDefault();
        addNote(note, "keyboard");
        render();
      }
      if (event.code === "Backspace") {
        event.preventDefault();
        undoLast();
      }
    });

    enableDragScroll(elements.fretboardScroll, (button) => {
      togglePosition(button.dataset.note, button.dataset.positionKey);
    });
    enableDragScroll(elements.libraryMapScroll);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  window.__KEY_FINDER_TESTS__ = {
    transpose,
    notesForScale,
    chordFromScaleDegree,
    intervalLabel,
    generateVoicings,
    state
  };

  bindControls();
  render();
  registerServiceWorker();
})();
