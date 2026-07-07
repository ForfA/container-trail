// module1.js — TEMPORARY sample content; replaced wholesale by the module 1 content task
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[0] = {
  id: 1,
  town: "Monolith Gulch",
  mentor: { name: "Old Deb", spriteId: "mentor1", intro: "Been tendin' the Monolith forty years." },
  arrival: [{ type: "vignette", id: "monolith", caption: "The Monolith belches smoke again." }],
  departure: [{ type: "dialogue", speaker: "mentor", text: "Ride west, Carl." }],
  levels: [
    {
      title: "Sample Level",
      scenes: [
        { type: "dialogue", speaker: "mentor", text: "One machine runnin' everything is one machine away from runnin' nothing." },
      ],
      questions: [
        { type: "mc", prompt: "Sample: 2+2?", options: ["3", "4", "5", "22"], answer: 1, explain: "It's 4." },
        { type: "tf", prompt: "Sample: the sky is up.", answer: true, explain: "It is." },
        { type: "mc", prompt: "Sample again: pick B", options: ["A", "B", "C", "D"], answer: 1, explain: "B." },
        { type: "tf", prompt: "Sample: water is dry.", answer: false, explain: "It is wet." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[0];
