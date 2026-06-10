// ============================================================
// 词根词缀数据库
// ============================================================

import type { WordRoot, WordAffix } from './types';

export const WORD_ROOTS: WordRoot[] = [
  { id: 'r001', root: 'spect', meaning: '看；观察', origin: 'Latin specere', exampleWords: ['h049', 'h053'], description: '表示"看"的词根，常见于与视觉、观察相关的词汇中。如：perspective（透视→观点）、prospect（向前看→前景）、inspect（向内看→检查）' },
  { id: 'r002', root: 'dict', meaning: '说；预言', origin: 'Latin dicere', exampleWords: [], description: '表示"说"的词根。如：predict（预先说→预测）、dictate（口述）、contradict（反着说→反驳）' },
  { id: 'r003', root: 'duc/duct', meaning: '引导；带领', origin: 'Latin ducere', exampleWords: [], description: '表示"引导"的词根。如：introduce（引入→介绍）、produce（向前引→生产）、reduce（向后引→减少）' },
  { id: 'r004', root: 'ject', meaning: '投掷；扔', origin: 'Latin jacere', exampleWords: [], description: '表示"投掷"的词根。如：reject（扔回→拒绝）、project（向前投→项目/投影）、inject（向内投→注射）' },
  { id: 'r005', root: 'cept', meaning: '拿；取', origin: 'Latin capere', exampleWords: ['h020'], description: '表示"拿取"的词根。如：concept（共同拿到一起→概念）、accept（向拿→接受）、except（向外拿→除了）' },
  { id: 'r006', root: 'tain', meaning: '保持；握住', origin: 'Latin tenere', exampleWords: ['h060'], description: '表示"保持"的词根。如：sustain（在下面支撑→维持）、maintain（手中保持→维护）、retain（向后保持→保留）' },
  { id: 'r007', root: 'form', meaning: '形状；形式', origin: 'Latin forma', exampleWords: ['h061'], description: '表示"形状"的词根。如：transform（跨越改变形状→转变）、reform（再次成形→改革）、inform（赋予形状→通知）' },
  { id: 'r008', root: 'var', meaning: '变化', origin: 'Latin varius', exampleWords: ['h064'], description: '表示"变化"的词根。如：variety（多样性）、various（各种各样的）、variable（可变的）' },
  { id: 'r009', root: 'ven/vent', meaning: '来；到达', origin: 'Latin venire', exampleWords: [], description: '表示"来"的词根。如：convention（一起来→大会/惯例）、prevent（预先来→预防）、intervene（在中间来→干预）' },
  { id: 'r010', root: 'posit/pos', meaning: '放置；安放', origin: 'Latin ponere', exampleWords: [], description: '表示"放置"的词根。如：compose（放在一起→组成）、dispose（分开放→处理）、propose（向前放→提议）' },
  { id: 'r011', root: 'sequ', meaning: '跟随', origin: 'Latin sequi', exampleWords: ['h070'], description: '表示"跟随"的词根。如：consequence（一起跟随→后果）、sequence（跟随→顺序）、subsequent（在后面跟随→随后的）' },
  { id: 'r012', root: 'gen', meaning: '产生；种类', origin: 'Latin genus', exampleWords: ['h041'], description: '表示"产生"的词根。如：generate（产生）、general（普遍的）、genius（天生的→天才）' },
  { id: 'r013', root: 'tract', meaning: '拉；拖', origin: 'Latin trahere', exampleWords: ['h002'], description: '表示"拉"的词根。如：abstract（拉开→抽象的）、attract（向拉→吸引）、extract（向外拉→提取）' },
  { id: 'r014', root: 'volve', meaning: '滚动；转动', origin: 'Latin volvere', exampleWords: ['h037'], description: '表示"滚动"的词根。如：evolve（向外滚→进化）、involve（向内滚→涉及）、revolve（反复滚→旋转）' },
  { id: 'r015', root: 'ply/pli', meaning: '折叠；倍', origin: 'Latin plicare', exampleWords: ['h043'], description: '表示"折叠"的词根。如：imply（向内折→暗示）、reply（折回→回复）、complicated（折在一起的→复杂的）' },
  { id: 'r016', root: 'priv', meaning: '私人的；个体的', origin: 'Latin privatus', exampleWords: ['h075'], description: '表示"私人"的词根。如：deprive（剥夺私人权利→剥夺）、privacy（隐私）、privilege（私人法律→特权）' },
  { id: 'r017', root: 'sci', meaning: '知道；知识', origin: 'Latin scire', exampleWords: ['h021'], description: '表示"知道"的词根。如：conscious（知道的→有意识的）、science（知识→科学）、prescient（预先知道→有预见性的）' },
  { id: 'r018', root: 'dom', meaning: '统治；控制', origin: 'Latin dominus', exampleWords: ['h027', 'h028'], description: '表示"统治"的词根。如：domestic（统治家的→国内的）、dominant（统治的→占主导地位的）、dominate（统治→支配）' },
  { id: 'r019', root: 'merg', meaning: '沉；浸', origin: 'Latin mergere', exampleWords: ['h030'], description: '表示"沉没"的词根。如：emerge（从沉没中出来→出现）、immerge（沉入→浸入）、submerge（沉到下面→淹没）' },
  { id: 'r020', root: 'tribut', meaning: '给予；分配', origin: 'Latin tribuere', exampleWords: ['h022'], description: '表示"给予"的词根。如：contribute（共同给予→贡献）、distribute（分散给予→分配）、attribute（给予→归因于）' },
];

export const WORD_AFFIXES: WordAffix[] = [
  { id: 'a001', affix: 'trans-', type: 'prefix', meaning: '跨越；转变', exampleWords: ['h061'], description: '表示"跨越、转变"。如：transform（转变形式）、transport（跨越运输）、translate（跨越语言→翻译）' },
  { id: 'a002', affix: 'inter-', type: 'prefix', meaning: '在...之间；相互', exampleWords: ['h045'], description: '表示"在...之间"。如：interpret（在两者之间→解释）、international（国家之间→国际的）、interact（相互行动→互动）' },
  { id: 'a003', affix: 're-', type: 'prefix', meaning: '再次；回', exampleWords: ['h056'], description: '表示"再次、回"。如：reveal（回看→揭示）、review（再看→复习）、reform（再次形成→改革）' },
  { id: 'a004', affix: 'pre-', type: 'prefix', meaning: '在...之前', exampleWords: ['h052'], description: '表示"在...之前"。如：predominant（之前就统治的→主要的）、predict（预先说→预测）、prevent（预先来→预防）' },
  { id: 'a005', affix: 'con-/com-', type: 'prefix', meaning: '共同；一起', exampleWords: ['h019', 'h020', 'h022', 'h070', 'h071'], description: '表示"共同、一起"。如：comprehensive（全部抓住的→综合的）、concept（共同拿到→概念）、contribute（共同给予→贡献）' },
  { id: 'a006', affix: 'de-', type: 'prefix', meaning: '向下；去除', exampleWords: ['h025', 'h029', 'h030', 'h075'], description: '表示"向下、去除"。如：derive（从源头向下引→源于）、eliminate（赶出去→消除）、emerge（从浸没中出来→出现）' },
  { id: 'a007', affix: 'ex-', type: 'prefix', meaning: '向外；超出', exampleWords: ['h038', 'h039'], description: '表示"向外"。如：exploit（向外展开→利用）、expose（向外放→暴露）、expand（向外展开→扩展）' },
  { id: 'a008', affix: 'in-/im-', type: 'prefix', meaning: '向内；不', exampleWords: ['h042', 'h043', 'h044', 'h046'], description: '表示"向内"或"不"。如：implement（向内填满→实施）、imply（向内折→暗示）、inevitable（不可逃避的→必然的）' },
  { id: 'a009', affix: '-tion/-sion', type: 'suffix', meaning: '名词后缀；表示动作或状态', exampleWords: ['h073'], description: '将动词变为名词。如：controversy的争议状态、education（教育）、information（信息）' },
  { id: 'a010', affix: '-ment', type: 'suffix', meaning: '名词后缀；表示行为或结果', exampleWords: ['h042'], description: '将动词变为名词。如：implement（工具/实施）、development（发展）、achievement（成就）' },
  { id: 'a011', affix: '-able/-ible', type: 'suffix', meaning: '形容词后缀；能...的', exampleWords: ['h015'], description: '表示"能够...的"。如：available（可获得的）、flexible（灵活的）、possible（可能的）' },
  { id: 'a012', affix: '-ful', type: 'suffix', meaning: '形容词后缀；充满...的', exampleWords: [], description: '表示"充满...的"。如：meaningful（有意义的）、successful（成功的）、powerful（强大的）' },
];

/** 获取所有词根 */
export function getAllRoots(): WordRoot[] {
  return WORD_ROOTS;
}

/** 获取所有词缀 */
export function getAllAffixes(): WordAffix[] {
  return WORD_AFFIXES;
}
