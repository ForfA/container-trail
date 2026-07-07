// sprites.js — pixel-grid parser + canvas renderer + sprite definitions
(function () {
  var PALETTE = { "#": "#000", "+": "#888", "-": "#ccc", "o": "#fff", ".": null };

  function parse(rows) {
    var w = rows[0].length, h = rows.length, px = [];
    for (var y = 0; y < h; y++) {
      if (rows[y].length !== w) throw new Error("ragged sprite");
      for (var x = 0; x < w; x++) {
        var c = rows[y][x];
        if (!(c in PALETTE)) throw new Error("bad char: " + c);
        px.push(PALETTE[c]);
      }
    }
    return { w: w, h: h, px: px };
  }

  var store = {};
  function define(id, rows) { store[id] = parse(rows); }
  function get(id) { return store[id]; }

  function draw(ctx, id, x, y, scale) {
    var s = store[id];
    for (var i = 0; i < s.px.length; i++) {
      if (!s.px[i]) continue;
      ctx.fillStyle = s.px[i];
      ctx.fillRect(x + (i % s.w) * scale, y + Math.floor(i / s.w) * scale, scale, scale);
    }
  }

  function el(id, scale) {
    var s = store[id];
    var c = document.createElement("canvas");
    c.className = "pixel-canvas";
    c.width = s.w * scale; c.height = s.h * scale;
    draw(c.getContext("2d"), id, 0, 0, scale);
    return c;
  }

  // --- Sprite definitions (16-wide unless noted) ---
  // Carl: squarish Claude-Code-avatar-like body, always wearing a brim hat.
  define("carl", [
    "....########....",
    "..############..",
    "....########....",
    "....#oooooo#....",
    "....#o#oo#o#....",
    "....#oooooo#....",
    "....#oo##oo#....",
    "....########....",
    "...##########...",
    "..##o######o##..",
    "..##o######o##..",
    "....########....",
    "....###..###....",
    "....###..###....",
    "....###..###....",
    "...####..####...",
  ]);
  define("carl-hat-tip", [
    "..########......",
    "############....",
    "..########......",
    "....#oooooo#....",
    "....#o#oo#o#....",
    "....#oooooo#....",
    "....#oo##oo#....",
    "....########....",
    "...##########...",
    "..##o######o##..",
    "..##o######o##..",
    "....########....",
    "....###..###....",
    "....###..###....",
    "....###..###....",
    "...####..####...",
  ]);
  define("crate", [
    "################",
    "#--------------#",
    "#-############-#",
    "#-#..........#-#",
    "#-#..........#-#",
    "#-############-#",
    "#--------------#",
    "################",
  ]);
  define("pod", [
    "....########....",
    "..##--------##..",
    ".#------------#.",
    ".#--########--#.",
    ".#--#......#--#.",
    ".#--########--#.",
    ".#------------#.",
    "..##--------##..",
    "....########....",
  ]);
  define("monolith", [
    "....########....",
    "...##++++++##...",
    "...#++++++++#...",
    "...#++#..#++#...",
    "...#++++++++#...",
    "...#++#..#++#...",
    "...#++++++++#...",
    "...#++#..#++#...",
    "...#++++++++#...",
    "...##++++++##...",
    "..############..",
  ]);
  define("town", [
    "......##........",
    ".....####.......",
    "..############..",
    "..#--#----#--#..",
    "..#--#-##-#--#..",
    "..############..",
  ]);
  // Mentors 1-8: 12x12 variants, each with a distinct headgear/silhouette.
  define("mentor1", [
    "..########..",
    ".#++++++++#.",
    "..#oooooo#..",
    "..#o#oo#o#..",
    "..#oooooo#..",
    "..########..",
    ".##########.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor2: hooded hermit — full dark hood, narrow eye slits, no bare face.
  define("mentor2", [
    "...######...",
    "..#++++++#..",
    ".#++++++++#.",
    ".#+#....#+#.",
    ".#++++++++#.",
    "..#++++++#..",
    ".##########.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor3: wide-hat rancher — full-width brim over a plain crown.
  define("mentor3", [
    "############",
    ".#--------#.",
    "..#++++++#..",
    "..#oooooo#..",
    "..#o#oo#o#..",
    "..########..",
    ".##########.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor4: merchant with cap — small flat cap, coated torso.
  define("mentor4", [
    "....####....",
    "...#++++#...",
    "..#++++++#..",
    "..#oooooo#..",
    "..#o#oo#o#..",
    "..########..",
    ".#--------#.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor5: engineer with goggles — wide dark-rimmed lenses across the face.
  define("mentor5", [
    "..########..",
    ".##++++++##.",
    ".#++++++++#.",
    ".#o##..##o#.",
    ".#o##..##o#.",
    "..########..",
    ".##########.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor6: helmswoman — pale headscarf, wheel-spoke emblem on the chest.
  define("mentor6", [
    "..########..",
    ".#oooooooo#.",
    "..#++++++#..",
    "..#o#oo#o#..",
    "..#oooooo#..",
    "..########..",
    ".#-#o##o#-#.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor7: tall drover — plain hat, long striped coat over the legs.
  define("mentor7", [
    "..########..",
    ".#++++++++#.",
    "..#oooooo#..",
    "..#o#oo#o#..",
    "..#oooooo#..",
    "..########..",
    ".###----###.",
    ".#o######o#.",
    ".#--------#.",
    ".#--....--#.",
    "..##....##..",
    ".###....###.",
  ]);
  // mentor8: lookout with spyglass — raised sighting mark, squinting brow.
  define("mentor8", [
    ".....#......",
    "..########..",
    ".#++++++++#.",
    "..#o#--#o#..",
    "..#oooooo#..",
    "..########..",
    ".##########.",
    ".#o######o#.",
    "..########..",
    "..##....##..",
    "..##....##..",
    ".###....###.",
  ]);
  // Tokens 1-8: 8x8 emblems, each a distinct icon.
  // token1: broken monolith — jagged crack splitting the slab.
  define("token1", [
    "..####..",
    ".#++++#.",
    ".#++.+#.",
    ".#+.++#.",
    ".#++.+#.",
    ".#+.++#.",
    ".##++##.",
    "..####..",
  ]);
  // token2: canyon walls — two rock faces with an open gap between.
  define("token2", [
    "##....##",
    "##....##",
    "#-....-#",
    "#-....-#",
    "#-....-#",
    "#-....-#",
    "##....##",
    "##....##",
  ]);
  // token3: whale/crate — a windowed shipping crate.
  define("token3", [
    "########",
    "#------#",
    "#-####-#",
    "#-#..#-#",
    "#-#..#-#",
    "#-####-#",
    "#------#",
    "########",
  ]);
  // token4: stacked layers — alternating horizontal image layers.
  define("token4", [
    "########",
    "#++++++#",
    "########",
    "#------#",
    "########",
    "#++++++#",
    "########",
    "#------#",
  ]);
  // token5: bridge — deck spanning two piers.
  define("token5", [
    "........",
    ".#....#.",
    ".#....#.",
    "########",
    "..#..#..",
    "..#..#..",
    "..#..#..",
    "..#..#..",
  ]);
  // token6: ship wheel — hub and spokes.
  define("token6", [
    "..####..",
    ".#+##+#.",
    "#++##++#",
    "########",
    "########",
    "#++##++#",
    ".#+##+#.",
    "..####..",
  ]);
  // token7: three pods — three paired blocks in a row.
  define("token7", [
    "##.##.##",
    "##.##.##",
    "........",
    "##.##.##",
    "##.##.##",
    "........",
    "##.##.##",
    "##.##.##",
  ]);
  // token8: shield — rounded top tapering to a point.
  define("token8", [
    ".######.",
    ".#++++#.",
    ".#+oo+#.",
    ".#+oo+#.",
    ".#++++#.",
    "..#++#..",
    "..#++#..",
    "...##...",
  ]);

  var API = { parse: parse, define: define, get: get, draw: draw, el: el };
  if (typeof window !== "undefined") window.Sprites = API;
  if (typeof module !== "undefined") module.exports = API;
})();
