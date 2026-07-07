// validate.js — schema-check all module content. Usage: node tools/validate.js
"use strict";
const path = require("path");

const KNOWN_DIAGRAMS = ["vm-vs-container", "image-layers", "multi-stage"]; // extend when screens.js gains diagrams

function nonEmpty(errs, where, name, v) {
  if (typeof v !== "string" || v.trim() === "") errs.push(where + ": empty or missing " + name);
}

function checkScene(errs, where, s, opts) {
  if (s.type === "dialogue") {
    if (s.speaker !== "carl" && s.speaker !== "mentor") errs.push(where + ": bad speaker");
    nonEmpty(errs, where, "text", s.text);
  } else if (s.type === "diagram") {
    if (!opts.diagramIds.includes(s.id)) errs.push(where + ": unknown diagram id " + s.id);
    if (!Array.isArray(s.steps) || s.steps.length < 1) errs.push(where + ": diagram needs steps");
    else s.steps.forEach((st, i) => nonEmpty(errs, where + " step " + i, "caption", st.caption));
  } else if (s.type === "terminal") {
    if (!Array.isArray(s.lines) || s.lines.length < 1) errs.push(where + ": terminal needs lines");
    else s.lines.forEach((ln, i) => {
      nonEmpty(errs, where + " line " + i, "cmd", ln.cmd);
      nonEmpty(errs, where + " line " + i, "output", ln.output);
    });
  } else if (s.type === "widget") {
    if (!opts.widgetIds.includes(s.id)) errs.push(where + ": unknown widget id " + s.id);
  } else if (s.type === "vignette") {
    nonEmpty(errs, where, "id", s.id);
    nonEmpty(errs, where, "caption", s.caption);
  } else {
    errs.push(where + ": unknown scene type " + s.type);
  }
}

function checkQuestion(errs, where, q) {
  nonEmpty(errs, where, "prompt", q.prompt);
  nonEmpty(errs, where, "explain", q.explain);
  if (q.type === "mc") {
    if (!Array.isArray(q.options) || q.options.length !== 4) errs.push(where + ": mc needs 4 options");
    else {
      q.options.forEach((o, i) => nonEmpty(errs, where + " option " + i, "text", o));
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
        errs.push(where + ": mc answer out of range");
    }
  } else if (q.type === "tf") {
    if (typeof q.answer !== "boolean") errs.push(where + ": tf answer must be boolean");
  } else if (q.type === "cmd") {
    if (!Array.isArray(q.accept) || q.accept.length < 1) errs.push(where + ": cmd needs accept list");
    else q.accept.forEach((a, i) => nonEmpty(errs, where + " accept " + i, "entry", a));
  } else {
    errs.push(where + ": unknown question type " + q.type);
  }
}

function validateModule(mod, opts) {
  const errs = [];
  const w = "module " + (mod && mod.id);
  if (!mod || typeof mod !== "object") return ["module is not an object"];
  nonEmpty(errs, w, "town", mod.town);
  if (!mod.mentor) errs.push(w + ": missing mentor");
  else {
    nonEmpty(errs, w, "mentor.name", mod.mentor.name);
    nonEmpty(errs, w, "mentor.spriteId", mod.mentor.spriteId);
    nonEmpty(errs, w, "mentor.intro", mod.mentor.intro);
  }
  ["arrival", "departure"].forEach((k) => {
    if (!Array.isArray(mod[k]) || mod[k].length < 1) errs.push(w + ": " + k + " needs >=1 scene");
    else mod[k].forEach((s, i) => checkScene(errs, w + " " + k + "[" + i + "]", s, opts));
  });
  if (!Array.isArray(mod.levels) || mod.levels.length < 1) errs.push(w + ": needs levels");
  else mod.levels.forEach((lv, l) => {
    const lw = w + " level " + (l + 1);
    nonEmpty(errs, lw, "title", lv.title);
    if (!Array.isArray(lv.scenes) || lv.scenes.length < 1) errs.push(lw + ": needs >=1 scene");
    else lv.scenes.forEach((s, i) => checkScene(errs, lw + " scene[" + i + "]", s, opts));
    if (!Array.isArray(lv.questions) || lv.questions.length < 4 || lv.questions.length > 6)
      errs.push(lw + ": needs 4-6 questions");
    if (Array.isArray(lv.questions))
      lv.questions.forEach((q, i) => checkQuestion(errs, lw + " question[" + i + "]", q));
  });
  return errs;
}

function main() {
  global.window = { GameData: { modules: [] } };
  const base = path.join(__dirname, "..");
  const widgetIds = require(path.join(base, "js/widgets.js")).WIDGET_IDS;
  const opts = { widgetIds, diagramIds: KNOWN_DIAGRAMS };
  let all = [];
  let levels = 0, questions = 0;
  for (let n = 1; n <= 8; n++) {
    const mod = require(path.join(base, "data/module" + n + ".js"));
    if (!mod || !mod.levels) { all.push("module" + n + ".js exports nothing (missing module guard?)"); continue; }
    all = all.concat(validateModule(mod, opts));
    levels += mod.levels.length;
    mod.levels.forEach((lv) => { questions += (lv.questions || []).length; });
  }
  if (all.length) {
    all.forEach((e) => console.error("ERROR " + e));
    process.exit(1);
  }
  console.log("OK: 8 modules, " + levels + " levels, " + questions + " questions");
}

if (require.main === module) main();
module.exports = { validateModule, KNOWN_DIAGRAMS };
