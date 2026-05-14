/**
 * Level Definitions for Chinese Chess Tutorial 2.0
 * 20 levels across 4 chapters
 */

const LEVELS = [
  // ===== Chapter 1: 棋子学堂 (1-5) =====
  {
    id: 1, name: "初识将帅", subtitle: "认识九宫格", chapter: 1, type: "tutorial",
    description: "将帅是棋盘上最重要的棋子，只能在九宫格内一格一格地移动。试着把红帅向上走一步！",
    objective: { type: "move_to", piece: "rK", target: [7, 4] },
    position: "5k3/9/9/9/9/9/9/9/9/4K4",
    hints: ["将帅只能在九宫内移动", "每次只能走一格，横竖都可以", "点击红帅，再点击它上方的格子"],
    starSteps: [2, 3, 5], allowedPieces: ["rK"], aiDepth: 1
  },
  {
    id: 2, name: "車行直线", subtitle: "車的走法", chapter: 1, type: "tutorial",
    description: "車可以横竖走任意格。用车吃掉右边的黑卒！",
    objective: { type: "capture", piece: "bP", at: [9, 8] },
    position: "4k4/9/9/9/9/9/9/3K5/9/R7p",
    hints: ["車走直线，不限格数", "点击红車，再点击黑卒的位置"],
    starSteps: [1, 2, 4], allowedPieces: ["rR"], aiDepth: 0
  },
  {
    id: 3, name: "馬走日字", subtitle: "馬的走法", chapter: 1, type: "tutorial",
    description: "馬走'日'字。从(9,1)跳到(7,2)吃掉黑卒！",
    objective: { type: "capture", piece: "bP", at: [7, 2] },
    position: "4k4/9/9/9/9/9/9/2p6/3K5/1N7",
    hints: ["馬走日字：先直走两格，再斜走一格", "看看能不能从(9,1)跳到(7,2)"],
    starSteps: [1, 2, 4], allowedPieces: ["rN"], aiDepth: 0
  },
  {
    id: 4, name: "隔山打牛", subtitle: "炮的吃子", chapter: 1, type: "tutorial",
    description: "炮吃子时必须隔着一个棋子（炮架）。用炮隔着自己的兵吃掉黑卒！",
    objective: { type: "capture", piece: "bP", at: [9, 5] },
    position: "4k4/9/9/9/9/9/9/3K5/9/1C1P1p3",
    hints: ["炮吃子需要'隔山打牛'", "自己的兵(9,3)就是'炮架'", "点击红炮，再点击黑卒(9,5)"],
    starSteps: [1, 2, 4], allowedPieces: ["rC"], aiDepth: 0
  },
  {
    id: 5, name: "小卒过河", subtitle: "兵的走法", chapter: 1, type: "tutorial",
    description: "兵每次只能向前走一步，过河后才能左右走。合理用兵，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/9/9/4P4/9/9/3K5",
    hints: ["兵只能向前走，每次一格", "过了楚河汉界（第5条线）才能左右走"],
    starSteps: [2, 3, 5], allowedPieces: null, aiDepth: 0
  },

  // === New Chapter 1 additions: 蹩脚马, 象, 士, 老将照面 ===
  {
    id: 6, name: "蹩脚马", subtitle: "马的蹩腿", chapter: 1, type: "tutorial",
    description: "黑马正在将军，帅被双士困住无路可逃！利用蹩马腿规则解围，最终将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "5k3/9/9/9/9/9/4n4/3A3R1/3KA4/4p4",
    hints: ["帅被双士困在角落无法移动，必须用车塞蹩马腿解围", "车移到(7,4)塞住蹩马腿，马跳不动了", "解围后再用車馬配合将死黑方"],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 1
  },
  {
    id: 7, name: "象眼迷雾", subtitle: "塞象眼+象的走法", chapter: 1, type: "tutorial",
    description: "象走田字，象眼被塞则不能动。马跳(1,5)蒙双象眼，車馬配合将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3k1ab2/4a4/2R1b4/6N2/9/9/9/9/9/4K4",
    hints: ["马跳到(1,5)，这个位置同时是两只象的象眼", "象眼被塞后，象就不能动了", "再用車逐个吃掉两只象"],
    starSteps: [3, 5, 7], allowedPieces: null, aiDepth: 0
  },
  {
    id: 8, name: "士守九宫", subtitle: "士象防守", chapter: 1, type: "defensive",
    description: "帅被士象围在九宫动弹不得，黑方双車虎视眈眈。用士象守住要道，撑过6步！",
    objective: { type: "survive_n_moves", n: 6 },
    position: "3aka3/9/9/6P2/5r3/9/4P4/4B4/5r3/2BAKA3",
    hints: ["士象守住九宫要道，提前移动封堵黑車进攻线路", "注意双車错杀法，移动士象时不要自毁防线", "九宫内的子力是最后屏障，不要轻易移动帅"],
    starSteps: [6, 8, 10], allowedPieces: null, aiDepth: 3, aiAggressive: true
  },
  {
    id: 9, name: "老将照面", subtitle: "将帅不照面", chapter: 1, type: "tutorial",
    description: "将帅不能在同一直线且中间无子（照面）。黑車隔红車将军失败，轮到红方反攻将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/9/9/9/9/9/r1RK5",
    hints: ["将帅不能在同一列中间无子时照面", "红車挡住黑車后，红方反攻", "注意帅移动时不要制造照面"],
    starSteps: [2, 4, 6], allowedPieces: null, aiDepth: 1
  },

  // ===== Chapter 2: 攻其不备 =====
  {
    id: 10, name: "車的威风", subtitle: "单车破双士", chapter: 2, type: "offensive",
    description: "单车破双士是经典残局。用车的威力撕开士的防线，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3k1a3/4a4/9/9/9/9/4R4/9/9/4K4",
    hints: ["車控制要道，逐步压缩黑将活动空间", "先用車牵着黑士走，伺机将军", "注意不要被黑士挡住車的路线"],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 2
  },
  {
    id: 11, name: "馬踏联营", subtitle: "双馬配合", chapter: 2, type: "offensive",
    description: "两个馬配合起来威力更大。用双馬消灭两个黑卒！",
    objective: { type: "capture_all", pieces: ["bP", "bP"] },
    position: "4k4/9/9/9/9/9/9/p1p6/9/1N1N1K3",
    hints: ["双馬配合，各司其职", "左边的馬吃左边的卒，右边的馬吃右边的卒"],
    starSteps: [2, 3, 5], allowedPieces: ["rN"], aiDepth: 1
  },
  {
    id: 12, name: "吃子大作战", subtitle: "多子配合", chapter: 2, type: "offensive",
    description: "合理运用車馬炮，吃掉所有黑卒！",
    objective: { type: "capture_all", pieces: ["bP", "bP", "bP"] },
    position: "4k4/9/9/9/9/4C3p/9/2N5p/9/R4K2p",
    hints: ["車适合远距离直线吃子", "馬适合跳过障碍", "炮需要炮架才能吃子"],
    starSteps: [3, 4, 7], allowedPieces: null, aiDepth: 1
  },
  {
    id: 13, name: "双車错", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "两个車配合起来威力巨大。吃掉黑将！",
    objective: { type: "capture", piece: "bK" },
    position: "4k4/R7R/9/9/9/9/9/9/9/3K5",
    hints: ["先用一个車将军，逼黑将移动", "另一个車在另一路完成击杀"],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 1
  },
  {
    id: 14, name: "馬后炮", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "马跳到将的前面将军，炮在马的后面形成杀势。完成馬后炮杀法！",
    objective: { type: "check", targetColor: "black" },
    position: "4k4/9/9/2N1C4/9/9/9/9/9/3K5",
    hints: ["馬后炮是马做炮架、炮隔马打将", "马跳到(2,4)做炮架，炮隔马将死黑将"],
    starSteps: [2, 3, 5], allowedPieces: null, aiDepth: 2
  },
  {
    id: 15, name: "重炮杀", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "两个炮在同一条线上，前面的炮做炮架，后面的炮将军。完成重炮杀！",
    objective: { type: "check", targetColor: "black" },
    position: "3aka3/9/4C4/9/9/3C5/9/9/9/4K4",
    hints: ["两个炮在同一条线上", "后面的炮隔前面的炮打将"],
    starSteps: [1, 2, 3], allowedPieces: null, aiDepth: 2
  },

  // ===== Chapter 3: 守中带攻 =====

  {
    id: 16, name: "弃車保帅", subtitle: "垫将解围", chapter: 3, type: "defensive",
    description: "黑方炮打将！危急时刻，只能用车解围。舍车保帅！",
    objective: { type: "escape_check", withinMoves: 2 },
    position: "4k4/9/9/9/9/9/9/9/3Rn4/c1n1K4",
    hints: ["此关只能使用红车", "把红车走到(9,3)垫将", "炮隔黑马吃掉红车后帅就安全了"],
    starSteps: [1, 2, 3], allowedPieces: ["rR"], aiDepth: 2, aiAggressive: true
  },

  {
    id: 17, name: "兵贵神速", subtitle: "兵的妙用", chapter: 4, type: "offensive",
    description: "兵虽然走得慢，但过河后威力大增。用兵配合其他子力完成杀局！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "9/4k4/4N4/9/4P4/9/9/9/9/3K5",
    hints: ["兵向前走一步可以将军", "用馬配合也能将军"],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 3
  },
  {
    id: 18, name: "双鬼拍门", subtitle: "残局杀法", chapter: 4, type: "offensive",
    description: "車控制直线封锁逃路，馬灵活跳跃贴身将军，車馬配合完成绝杀！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/9/9/9/9/9/R2K2N2",
    hints: [ "車控制直线封锁黑将逃路", "馬跳到将旁边配合将军", "車封馬将，双管齐下" ],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 3
  },
  {
    id: 19, name: "車馬冷着", subtitle: "综合残局", chapter: 4, type: "offensive",
    description: "黑方双士护卫严密，红方車馬兵三子联攻。需要巧妙腾挪配合，撕开防线将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3aka3/9/9/4N4/9/4P4/9/9/4R4/3K5",
    hints: [ "車馬兵三子配合，逐步压缩黑将空间", "先用车控制要道，馬兵伺机将军", "注意黑方士象的防守作用" ],
    starSteps: [3, 4, 7], allowedPieces: null, aiDepth: 4
  },
  {
    id: 20, name: "终极挑战", subtitle: "最后的考验", chapter: 4, type: "offensive",
    description: "車馬炮三子联攻，黑方士象全死守。运用所学，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3aka3/9/b3b4/9/1C3N2R/9/9/9/9/3K5",
    hints: [ "炮可借士打将，車馬跟进压缩黑将空间", "先破士象再锁将，三步三星更佳", "注意象在中路的防守作用" ],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 4
  }
];

const ACHIEVEMENTS = [
  { id: "first_step", name: "第一步", desc: "完成第一关", icon: "👣", condition: (s) => s.completedLevels.length >= 1 },
  { id: "novice", name: "小棋手", desc: "完成5关", icon: "🎯", condition: (s) => s.completedLevels.length >= 5 },
  { id: "intermediate", name: "棋艺初成", desc: "完成10关", icon: "♟️", condition: (s) => s.completedLevels.length >= 10 },
  { id: "master", name: "象棋大师", desc: "完成全部20关", icon: "👑", condition: (s) => s.completedLevels.length >= 20 },
  { id: "perfect", name: "完美主义", desc: "任意一关获得3星", icon: "⭐", condition: (s) => Object.values(s.levelStars).some(v => v === 3) },
  { id: "all_perfect", name: "全满星", desc: "所有关卡获得3星", icon: "🌟", condition: (s) => Object.values(s.levelStars).filter(v => v === 3).length >= 20 },
  { id: "speed_demon", name: "速度之星", desc: "在5步内完成第11关", icon: "⚡", condition: (s) => s.levelSteps[11] && s.levelSteps[11] <= 5 },
  { id: "no_hint", name: "独立思考", desc: "不使用提示完成任意一关", icon: "💡", condition: (s) => s.noHintLevels && s.noHintLevels.length >= 1 },
  { id: "persistent", name: "百折不挠", desc: "某一关尝试了5次以上", icon: "🔥", condition: (s) => Object.values(s.levelAttempts).some(a => a >= 5) },
  { id: "defender", name: "铁壁防守", desc: "完成任意防守关", icon: "🛡️", condition: (s) => LEVELS.filter(l => l.type === 'defensive').some(l => s.completedLevels.includes(l.id)) }
];

const PIECE_NAMES = {
  'rK': '帅', 'rA': '仕', 'rB': '相', 'rR': '俥', 'rN': '傌', 'rC': '炮', 'rP': '兵',
  'bK': '将', 'bA': '士', 'bB': '象', 'bR': '车', 'bN': '马', 'bC': '炮', 'bP': '卒'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEVELS, ACHIEVEMENTS, PIECE_NAMES };
}
