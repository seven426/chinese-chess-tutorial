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
    starSteps: [2, 3, 5], allowedPieces: null, aiDepth: 1
  },
  {
    id: 2, name: "車行直线", subtitle: "車的走法", chapter: 1, type: "tutorial",
    description: "車可以横竖走任意格。用车吃掉右边的黑卒！",
    objective: { type: "capture", piece: "bP", at: [6, 7] },
    position: "4k4/9/9/9/9/9/7p1/3K5/9/R8",
    hints: ["車走直线，不限格数", "点击红車，再点击黑卒的位置"],
    starSteps: [1, 2, 4], allowedPieces: null, aiDepth: 2
  },
  {
    id: 3, name: "馬走日字", subtitle: "馬的走法", chapter: 1, type: "tutorial",
    description: "馬走'日'字，一步跳出奇袭！用红馬吃掉黑卒。",
    objective: { type: "capture", piece: "bP", at: [4, 2] },
    position: "4k4/9/9/5N3/2p6/9/9/9/5K3/9",
    hints: ["馬走日字：先直走两格，再斜走一格", "从(3,5)出发，需要两步才能吃到(4,2)的黑卒"],
    starSteps: [1, 2, 4], allowedPieces: null, aiDepth: 2
  },
  {
    id: 4, name: "隔山打牛", subtitle: "炮的吃子", chapter: 1, type: "tutorial",
    description: "炮吃子必须隔一个炮架。双炮借帅做架，隔山打牛将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "5k3/9/9/9/5C3/9/9/9/4p4/1C1K1p3",
    hints: ["炮吃子需要'隔山打牛'——必须隔一个棋子", "炮(9,1)可以隔黑卒(9,5)打到更远的目标", "注意观察炮架的位置"],
    starSteps: [1, 2, 4], allowedPieces: null, aiDepth: 3
  },
  {
    id: 5, name: "小卒过河", subtitle: "兵的走法", chapter: 1, type: "tutorial",
    description: "兵每次只能向前走一步，过河后才能左右走。合理用兵，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/9/9/4P4/9/9/3K5",
    hints: ["兵只能向前走，每次一格", "过了楚河汉界（第5条线）才能左右走"],
    starSteps: [2, 3, 5], allowedPieces: null, aiDepth: 3
  },

  // === New Chapter 1 additions: 蹩脚马, 象, 士, 老将照面 ===
  {
    id: 6, name: "蹩脚马", subtitle: "马的蹩腿", chapter: 1, type: "tutorial",
    description: "黑马正在将军，帅被双士困住无路可逃！利用蹩马腿规则解围，最终将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "5k3/9/5P3/2N6/9/9/4n4/3A3R1/3KA4/4p4",
    hints: ["帅被双士困在角落无法移动，必须用车塞蹩马腿解围", "车移到(7,4)塞住蹩马腿，马跳不动了", "解围后再用車馬配合将死黑方"],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 3
  },
  {
    id: 7, name: "象眼迷雾", subtitle: "塞象眼+象的走法", chapter: 1, type: "tutorial",
    description: "象走田字，象眼被塞则不能动。马跳关键位置蒙住双象眼，車馬配合将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3k1ab2/4a4/2R1b4/5PN2/9/9/9/9/9/4K4",
    hints: ["马跳到(1,5)，这个位置同时是两只象的象眼", "象眼被塞后，象就不能动了", "再用車逐个吃掉两只象"],
    starSteps: [3, 5, 7], allowedPieces: null, aiDepth: 3
  },
  {
    id: 8, name: "士守九宫", subtitle: "士象防守", chapter: 1, type: "defensive",
    description: "帅被士象围在九宫动弹不得，黑方双車虎视眈眈。用士象守住要道，撑过6步！",
    objective: { type: "survive_n_moves", n: 6 },
    position: "3aka3/9/9/6P2/5r3/9/4P4/4B4/5r3/2BAKA3",
    hints: ["士象守住九宫要道，提前移动封堵黑車进攻线路", "注意双車错杀法，移动士象时不要自毁防线", "九宫内的子力是最后屏障，不要轻易移动帅"],
    starSteps: [6, 8, 10], allowedPieces: null, aiDepth: 3
  },
  {
    id: 9, name: "老将照面", subtitle: "将帅不照面", chapter: 1, type: "tutorial",
    description: "将帅不能在同一直线且中间无子（照面）。红車挡住黑車将军，帅安全后双車反攻。注意帅移动时不要制造将帅照面！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/9/9/9/9/9/r1RK5",
    hints: ["将帅不能在同一列中间无子时照面", "红車挡住黑車后，红方反攻", "注意帅移动时不要制造照面"],
    starSteps: [2, 4, 6], allowedPieces: null, aiDepth: 3
  },

  // ===== Chapter 2: 攻其不备 =====
  {
    id: 10, name: "車的威风", subtitle: "单车破双士", chapter: 2, type: "offensive",
    description: "单车破双士是经典残局。用车的威力撕开士的防线，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3k1a3/4a4/9/9/9/9/4R4/9/9/4K4",
    hints: ["車控制要道，逐步压缩黑将活动空间", "先用車牵着黑士走，伺机将军", "注意不要被黑士挡住車的路线"],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 3
  },
  {
    id: 11, name: "馬踏联营", subtitle: "双馬配合", chapter: 2, type: "offensive",
    description: "黑方双士护将，红方双馬联攻。馬踏联营，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4ka3/4a4/9/9/9/9/9/p1p6/9/1N1N1K3",
    hints: ["双馬配合，互相掩护，逐个击破", "先用一馬将军逼黑将移动，另一馬跟进", "黑士的活动空间有限，马可以绕开"],
    starSteps: [3, 5, 8], allowedPieces: null, aiDepth: 3
  },
  {
    id: 12, name: "钓鱼马", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "钓鱼马是经典杀法——马在对方将旁钓鱼位，配合其他子力完成绝杀！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "2bakab2/5P3/6N2/9/2r6/9/9/9/4p4/5K3",
    hints: ["马跳到(0,5)的钓鱼位，控制黑将的逃路", "兵在(1,5)保护马不被士吃", "马到位后，帅横移控制要道，黑将无路可逃"],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 3
  },
  {
    id: 13, name: "双車错", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "黑方士象全死守，红方双車左右夹击。交替将军，逐个击破防线将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "2baka3/R7R/4b4/9/9/9/9/9/9/3K5",
    hints: ["先用车将军逼黑将移动，另一车封锁逃路", "注意黑方士象的防守，逐个击破", "双車交替将军是关键"],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 3
  },
  {
    id: 14, name: "馬后炮", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "马跳到将的前面将军，炮在马的后面形成杀势。完成馬后炮杀法！",
    objective: { type: "check", targetColor: "black" },
    position: "4k4/9/8r/2N1C4/9/9/9/5n3/9/3K5",
    hints: ["馬后炮是马做炮架、炮隔马打将", "马跳到(2,4)做炮架，炮隔马将死黑将"],
    starSteps: [2, 3, 5], allowedPieces: null, aiDepth: 3
  },
  {
    id: 15, name: "重炮杀", subtitle: "经典杀法", chapter: 2, type: "offensive",
    description: "两个炮在同一条线上，前面的炮做炮架，后面的炮将军。完成重炮杀！",
    objective: { type: "check", targetColor: "black" },
    position: "3akab2/9/4C4/9/9/3C5/9/9/9/4K4",
    hints: ["两个炮在同一条线上", "后面的炮隔前面的炮打将"],
    starSteps: [1, 2, 3], allowedPieces: null, aiDepth: 3
  },

  // ===== Chapter 3: 守中带攻 =====

  {
    id: 16, name: "弃車保帅", subtitle: "垫将解围", chapter: 3, type: "defensive",
    description: "黑方炮打将！帅无路可逃，双车舍一车垫将解围，再反攻将死黑方。学会弃子争先！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "4k4/9/9/9/2R6/9/9/7C1/3Rn4/c1n1K4",
    hints: ["红车(8,3)走到(9,3)垫将，或(4,2)车支援", "炮隔黑马吃掉红车后帅就安全了", "双车配合更容易解围"],
    starSteps: [1, 2, 3], allowedPieces: null, aiDepth: 3
  },

  {
    id: 17, name: "兵贵神速", subtitle: "兵的妙用", chapter: 4, type: "offensive",
    description: "兵虽然走得慢，但过河后威力大增。用兵配合其他子力完成杀局！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "9/4k4/4N4/5a3/4P4/9/9/9/9/3K5",
    hints: ["兵向前走一步可以将军", "用馬配合也能将军"],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 4
  },
  {
    id: 18, name: "双鬼拍门", subtitle: "残局杀法", chapter: 4, type: "offensive",
    description: "双鬼拍门是经典残局——两个兵逼近九宫两侧，配合帅力完成绝杀！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3a1kb2/4a1P2/5P2b/9/9/9/9/9/9/5K3",
    hints: [ "两个兵一左一右逼近九宫，限制黑将活动", "帅横向移动控制要道", "兵帅配合，一步步收紧包围圈" ],
    starSteps: [3, 4, 6], allowedPieces: null, aiDepth: 4
  },
  {
    id: 19, name: "車馬冷着", subtitle: "综合残局", chapter: 4, type: "offensive",
    description: "黑方士象全死守，红方車馬兵三子压境。腾挪配合，层层推进将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "3akab2/9/4b4/4N4/9/4P4/9/9/4R4/3K5",
    hints: [ "車馬兵三子配合，逐步压缩黑将空间", "先用车控制要道，馬兵伺机将军", "注意黑方士象的防守作用" ],
    starSteps: [3, 4, 7], allowedPieces: null, aiDepth: 4
  },
  {
    id: 20, name: "终极挑战", subtitle: "最后的考验", chapter: 4, type: "offensive",
    description: "車馬炮三子联攻，黑方士象全死守。运用所学，将死黑方！",
    objective: { type: "checkmate", targetColor: "black" },
    position: "2baka3/9/b8/9/1C3N2R/9/9/9/9/3K5",
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
