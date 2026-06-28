const state = {
  knowledge: null,
  current: []
};

const spreads = {
  single: {
    name: "单张牌：当下信号",
    count: 1,
    positions: ["当下信号"],
    function: "快速捕捉当前能量，适合日运、临时提醒、一个念头的即时反馈。",
    usage: "先把问题缩成一句话，抽一张后重点看关键词、正逆位和你第一眼被触动的画面。"
  },
  three: {
    name: "三张牌：现状 / 核心 / 建议",
    count: 3,
    positions: ["现状", "核心", "建议"],
    function: "万能小牌阵，适合感情、事业、学业、人际的状态分析。",
    usage: "中间牌是主牌，两侧是修正。先解核心，再看现状如何推向建议。"
  },
  timeline: {
    name: "时间流：过去 / 现在 / 未来",
    count: 3,
    positions: ["过去根源", "现在状态", "未来趋势"],
    function: "看一件事如何发展到现在，以及在当前惯性下会走向哪里。",
    usage: "不要把未来牌当定论，它更像当前路径的延长线。想改变结果，就从现在牌下手。"
  },
  choice: {
    name: "二选一：A 路径 / B 路径",
    count: 6,
    positions: ["A 的现状", "A 的机会", "A 的代价", "B 的现状", "B 的机会", "B 的代价"],
    function: "比较两个选择的能量结构，适合工作机会、关系推进、学习方向。",
    usage: "先在心里明确 A 和 B 分别是什么。不要只看哪边好牌多，要看你能否承担对应代价。"
  },
  relationship: {
    name: "关系镜像：你 / 对方 / 连接",
    count: 7,
    positions: ["你的状态", "对方状态", "表层互动", "隐藏阻碍", "关系资源", "下一步建议", "发展趋势"],
    function: "分析双方状态、互动模式和关系下一步，适合感情与合作关系。",
    usage: "先看双方状态是否同频，再看阻碍和资源。趋势牌只在前面几张成立时才有参考价值。"
  },
  hexagram: {
    name: "六张无牌阵：上看现状，下看发展",
    count: 6,
    positions: ["现状 A", "现状 B", "现状 C", "发展 A", "发展 B", "发展 C"],
    function: "来自你笔记里的通用模板，适合复杂问题和需要上下两层判断的场景。",
    usage: "上三张看目前结构，下三张看发展和建议。大牌权重更高，小牌负责补细节。"
  },
  celtic: {
    name: "凯尔特十字：深度诊断",
    count: 10,
    positions: ["当前处境", "交叉挑战", "显意识目标", "潜意识根源", "过去影响", "近期趋势", "你的姿态", "外界环境", "希望与恐惧", "综合结果"],
    function: "完整拆解一个中长期问题，适合你已经认真思考过、但仍卡住的议题。",
    usage: "按顺序解读，不急着跳到结果牌。第 2、4、8 位经常说明真正卡点。"
  }
};

const positionAdvice = {
  "当下信号": "这一位像一次即时校准，不负责给最终答案，而是指出此刻最该被看见的能量。",
  "现状": "这一位描述问题表层正在呈现的状态，通常是你已经隐约感觉到、但还没有命名的部分。",
  "核心": "这一位是本次牌阵的重心，解释为什么事情会卡在这里，以及真正牵动局面的主因。",
  "建议": "这一位不只是结果提示，更像下一步操作指令：该靠近、等待、切断、修正，还是重新定义问题。",
  "过去根源": "这一位回看旧模式，说明现在的局面不是突然发生，而是由某个惯性一路延伸而来。",
  "现在状态": "这一位代表此刻可被处理的现实入口，比未来牌更重要。",
  "未来趋势": "这一位表示当前惯性继续运行后的趋势，不是定论，而是提醒你哪里可以提前调整。",
  "A 的现状": "这一位看 A 方案的真实起点，它回答的是：这条路现在到底站在哪里。",
  "A 的机会": "这一位看 A 方案能打开什么门，机会越清晰，行动成本也越需要被看见。",
  "A 的代价": "这一位看 A 方案需要承担什么损耗、牺牲或盲区。",
  "B 的现状": "这一位看 B 方案的真实起点，和 A 对照时不要只比好坏，要比适配度。",
  "B 的机会": "这一位看 B 方案能带来什么增长、转机或资源。",
  "B 的代价": "这一位看 B 方案背后的隐性成本，尤其是时间、情绪和长期承诺。",
  "你的状态": "这一位看你在关系里的姿态：你如何感受、期待、防御或投射。",
  "对方状态": "这一位看对方当下能量，不等同于对方全部真实想法，但能提示他/她在关系中的表现方式。",
  "表层互动": "这一位看双方实际互动模式：话怎么说、力怎么使、关系如何被推拉。",
  "隐藏阻碍": "这一位通常比表层互动更关键，它指出未说出口、未处理或被误认的问题。",
  "关系资源": "这一位看这段关系还能依靠什么，可能是感情、现实条件、共同目标或可修复的空间。",
  "下一步建议": "这一位给出最现实的行动方向，优先级高于发展趋势。",
  "发展趋势": "这一位看当前模式延续后的走向。若建议位被执行，趋势有机会被改写。",
  "当前处境": "这一位给整件事定调，是牌阵的入口。",
  "交叉挑战": "这一位表示横在中间的阻力，可能来自外界，也可能来自你自己的处理方式。",
  "显意识目标": "这一位看你以为自己想要什么，常常带有理性层面的叙事。",
  "潜意识根源": "这一位看更深层的动机、恐惧和真正驱动力。",
  "过去影响": "这一位说明旧经验如何塑造现在的判断。",
  "近期趋势": "这一位看短期内最容易出现的变化。",
  "你的姿态": "这一位看你正在用什么姿态面对问题，是主动、回避、控制还是等待。",
  "外界环境": "这一位看他人、环境和现实条件如何配合或干扰你。",
  "希望与恐惧": "这一位往往一体两面：你越想要的，也可能正是你越怕失去的。",
  "综合结果": "这一位是目前路径的综合落点，需要结合前九张一起读。"
};

const elementMeaning = {
  火: "火元素强调行动、欲望、推进和勇气。它多的时候，事情需要动起来；它少的时候，容易想很多却不真正执行。",
  水: "水元素强调情绪、关系、直觉和感受。它多的时候，要重视心里真实的波动；它少的时候，可能缺少共情或情感连接。",
  风: "风元素强调沟通、判断、信息和理性。它多的时候，语言与认知是关键；它少的时候，容易凭感觉行动而缺乏清晰表达。",
  土: "土元素强调现实、资源、身体、承诺和长期积累。它多的时候，答案落在现实条件；它少的时候，需要把想法落地。"
};

const arcanaMeaning = {
  "大阿卡纳": "大牌出现时，问题往往不只是某个小事件，而是阶段、模式、课题或人生主题。",
  "小阿卡纳": "小牌更贴近日常事件，会指出具体情境、行动细节和短期变化。",
  "宫廷牌": "宫廷牌常代表人物、性格姿态或你在事件里采用的角色。"
};

const contextRules = [
  {
    id: "relationship",
    label: "关系 / 感情",
    match: /关系|感情|恋|喜欢|复合|分手|暧昧|对方|他|她|伴侣|婚|桃花|推进|互动/,
    frame: "这次要看的不是单张牌好坏，而是双方的回应节奏、边界、投入程度和这段关系能否被现实行动承接。",
    action: "把牌义落到关系里时，优先看：谁在主动、谁在回避、哪里失衡、下一步该沟通还是该收力。"
  },
  {
    id: "career",
    label: "事业 / 工作",
    match: /工作|事业|职场|项目|老板|同事|客户|offer|跳槽|面试|合作|创业|钱|收入|业务/,
    frame: "这次要看的重点是现实资源、职责边界、推进阻力、协作关系和短期可执行动作。",
    action: "把牌义落到工作里时，优先看：资源够不够、沟通是否清楚、责任是否匹配、下一步怎样降低风险。"
  },
  {
    id: "study",
    label: "学习 / 考试",
    match: /学习|考试|课程|学业|论文|证书|复习|成绩|学校|老师/,
    frame: "这次要看的重点是学习状态、方法是否合适、压力来源和下一步如何提高效率。",
    action: "把牌义落到学习里时，优先看：注意力、方法、执行节奏和是否需要外部指导。"
  },
  {
    id: "choice",
    label: "选择 / 决策",
    match: /选择|选|要不要|该不该|是否|能不能|会不会|还是|A|B|方案|方向/,
    frame: "这次要看的不是替你决定，而是拆出每条路的机会、代价、风险和你真正能承担的部分。",
    action: "把牌义落到选择里时，优先看：哪一边更有资源，哪一边代价更高，哪一边只是情绪上更诱人。"
  },
  {
    id: "self",
    label: "个人状态 / 心理",
    match: /我现在|状态|情绪|焦虑|迷茫|内耗|成长|疗愈|自己|能量|心态/,
    frame: "这次要看的重点是你自己的内在姿态、消耗点、防御方式和恢复能量的入口。",
    action: "把牌义落到个人状态里时，优先看：哪里过度用力，哪里需要休息，哪里需要重新拿回主动权。"
  }
];

const intentRules = [
  { id: "action", label: "行动建议", match: /怎么|如何|推进|处理|行动|建议|下一步|怎么办|改善/ },
  { id: "trend", label: "发展趋势", match: /发展|趋势|未来|接下来|之后|结果|走向/ },
  { id: "reason", label: "原因分析", match: /为什么|原因|根源|卡住|阻碍|问题在哪/ },
  { id: "choice", label: "选择判断", match: /选|选择|要不要|该不该|是否|能不能|会不会|还是/ }
];

const $ = (selector) => document.querySelector(selector);
const cardsEl = $("#cards");
const synthesisEl = $("#synthesis");
const readingTitleEl = $("#readingTitle");
const sourceLinkEl = $("#sourceLink");
const vaultStatusEl = $("#vaultStatus");
const cardTemplate = $("#cardTemplate");
const spreadSelectEl = $("#spread");
const spreadGuideEl = $("#spreadGuide");

const glyphs = {
  火: "△",
  水: "▽",
  风: "◇",
  土: "□"
};

function initSpreadSelect() {
  spreadSelectEl.innerHTML = Object.entries(spreads)
    .map(([id, spread]) => `<option value="${id}">${spread.name}</option>`)
    .join("");
  spreadSelectEl.value = "three";
  renderSpreadGuide();
}

async function loadKnowledge() {
  if (location.protocol === "file:") {
    throw new Error("请用 http://localhost:5177 打开网页，file 模式无法连接 Obsidian。");
  }
  const response = await fetch("/api/knowledge", { cache: "no-store" });
  if (!response.ok) throw new Error("无法读取知识库");
  state.knowledge = await response.json();
  const aiStatus = state.knowledge.aiEnabled ? `AI已启用：${state.knowledge.aiModel}` : "AI未启用";
  vaultStatusEl.textContent = `已连接：${state.knowledge.tarotDir} · ${state.knowledge.cards.length} 张牌 · ${aiStatus}`;
  sourceLinkEl.href = state.knowledge.guidance.source.obsidian;
  sourceLinkEl.hidden = false;
}

function renderSpreadGuide() {
  const spread = spreads[spreadSelectEl.value];
  spreadGuideEl.innerHTML = `
    <div>
      <span class="guide-label">功能</span>
      <p>${spread.function}</p>
    </div>
    <div>
      <span class="guide-label">用法</span>
      <p>${spread.usage}</p>
    </div>
    <div>
      <span class="guide-label">位置</span>
      <p>${spread.positions.join(" · ")}</p>
    </div>
  `;
}

function randomUnit() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

function sampleCards(spread, deckMode, allowReversed) {
  const pool = state.knowledge.cards.filter((card) => deckMode === "78" || card.arcana === "大阿卡纳");
  const shuffled = [...pool].sort(() => randomUnit() - 0.5);
  return shuffled.slice(0, spread.count).map((card, index) => ({
    ...card,
    position: spread.positions[index],
    reversed: allowReversed && crypto.getRandomValues(new Uint32Array(1))[0] % 2 === 0
  }));
}

function reversedHint(card) {
  if (!card.reversed) return card.meaning;
  return `${card.meaning}\n\n逆位提示：把这张牌的能量看作受阻、过度、反向表达或需要重新校准。若原文已有逆位解释，以原文为准。`;
}

function renderCards(cards) {
  cardsEl.className = `cards spread-${cards.length}`;
  cardsEl.innerHTML = "";
  for (const card of cards) {
    const node = cardTemplate.content.cloneNode(true);
    node.querySelector(".number").textContent = card.number;
    node.querySelector(".glyph").textContent = glyphs[card.element] || "◇";
    node.querySelector(".element").textContent = card.element;
    node.querySelector("h3").textContent = card.name;
    node.querySelector(".orientation").textContent = card.reversed ? "逆位" : "正位";
    node.querySelector(".position").textContent = card.position;
    node.querySelector(".keyword").textContent = card.keyword;
    node.querySelector(".meaning").textContent = reversedHint(card);
    const link = node.querySelector(".note-link");
    link.href = card.source.obsidian;
    link.textContent = `打开 ${card.source.file}`;
    cardsEl.appendChild(node);
  }
}

function firstSentence(text) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/[|:*-]/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => line && !/^(属性|内容|领域|正位|逆位|画面|关键词)$/.test(line))
    .filter((line) => !/^#+\s*/.test(line));
  const naturalLine = lines.find((line) => /[，。；：]/.test(line) && line.length > 12) || lines.find((line) => line.length > 12);
  return naturalLine
    ?.split(/[。；;.!?]/)
    .find(Boolean)
    ?.trim() || "";
}

function analyzeQuestion(question, spread) {
  const text = question.trim();
  const domain = contextRules.find((rule) => rule.match.test(text)) || {
    id: "general",
    label: "综合问题",
    frame: "这次要把牌当作对现实处境的切片来看：先看状态，再看阻力，最后落到可执行动作。",
    action: "把牌义落到问题里时，优先看：它说明了什么状态、哪里不顺、下一步能做什么。"
  };
  const intent = intentRules.find((rule) => rule.match.test(text)) || {
    id: spread.count >= 6 ? "diagnosis" : "state",
    label: spread.count >= 6 ? "深度诊断" : "状态分析"
  };
  const subject = text || "当下这个问题";
  const reframed = text
    ? `这次不是泛泛解牌，而是围绕“${subject}”来看：${domain.frame}`
    : `你还没有写具体问题，所以本次只能按“当下状态”读取。想要更贴合，请把问题写成一件具体事。`;
  return { domain, intent, subject, reframed };
}

function contextBridge(card, context) {
  const position = card.position;
  const name = `${card.name}${card.reversed ? "逆位" : "正位"}`;
  const subject = context.subject;

  if (/建议|下一步|你的姿态|现在状态/.test(position)) {
    return `套回“${subject}”，${name}更像在说你现在可以怎么做，而不是事情会自动怎样发生。`;
  }
  if (/阻碍|挑战|代价|恐惧|交叉|隐藏/.test(position)) {
    return `套回“${subject}”，${name}指出的不是表面事件，而是最容易让局面卡住的那一层。`;
  }
  if (/趋势|未来|结果|发展|近期/.test(position)) {
    return `套回“${subject}”，${name}代表当前模式延续后的走向；它是预警和校准点，不是不可改变的判决。`;
  }
  if (/对方|外界/.test(position)) {
    return `套回“${subject}”，${name}更适合看外部回应方式，而不是把它当作对方全部真实想法。`;
  }
  if (/你的|当前|现状|核心/.test(position)) {
    return `套回“${subject}”，${name}是在说明你此刻真正面对的状态，以及它为什么会影响后续推进。`;
  }
  return `套回“${subject}”，${name}是这个位置给出的具体线索，需要和牌阵上下文一起读。`;
}

function domainSpecificReading(card, context) {
  const orientation = card.reversed ? "逆位" : "正位";
  const blocked = card.reversed ? "受阻" : "顺流";
  const topic = context.domain.id;

  if (topic === "relationship") {
    if (card.element === "水") return `${orientation}的水元素落在关系问题里，重点是情绪回应、亲密需求和真实感受；现在这股能量偏${blocked}，所以要看双方是否愿意把感受说清楚。`;
    if (card.element === "风") return `${orientation}的风元素落在关系问题里，重点是沟通、判断和信息透明度；现在最怕的是猜测太多、表达太少。`;
    if (card.element === "火") return `${orientation}的火元素落在关系问题里，重点是主动性、吸引力和推进速度；要分辨这是热情，还是急着改变对方。`;
    if (card.element === "土") return `${orientation}的土元素落在关系问题里，重点是现实承诺、稳定投入和可持续性；好听的话需要被具体行动验证。`;
  }

  if (topic === "career") {
    if (card.element === "土") return `${orientation}的土元素落在工作问题里，重点是资源、收益、流程和结果；这张牌要求你看现实条件够不够。`;
    if (card.element === "风") return `${orientation}的风元素落在工作问题里，重点是信息、汇报、合同、判断和沟通。`;
    if (card.element === "火") return `${orientation}的火元素落在工作问题里，重点是执行力、竞争、推进和项目动能。`;
    if (card.element === "水") return `${orientation}的水元素落在工作问题里，重点是人情、团队氛围、情绪消耗和直觉判断。`;
  }

  if (topic === "choice") {
    return `${orientation}的${card.element}元素落在选择题里，表示这一路径的关键变量是${elementMeaning[card.element]} 你要看自己是否愿意承担它带来的成本。`;
  }

  return `${orientation}的${card.element}元素放到这个问题里，提示你从${elementMeaning[card.element]}这个角度切入，而不是只看牌面吉凶。`;
}

function cardTheme(card) {
  if (card.arcana === "大阿卡纳") {
    const majorThemes = {
      愚者: "重新开始、试探、轻装上阵",
      魔术师: "主动沟通、创造机会、把话说出来",
      女祭司: "观察、克制、先不要急着表态",
      女皇: "滋养、吸引力、让关系自然生长",
      皇帝: "规则、责任、控制边界",
      教皇: "传统、承诺、听取专业或长辈意见",
      恋人: "选择、关系定位、双方是否同向",
      战车: "推进、控制情绪、明确方向",
      力量: "温柔但坚定，不用硬碰硬",
      隐士: "拉开距离、冷静思考、暂时独处",
      命运之轮: "局势变化、时机、不可强控",
      正义: "公平、说清规则、做出判断",
      倒吊人: "暂停、换角度、不要急着推进",
      死神: "结束旧模式、关系转型",
      节制: "慢慢调和、恢复流动",
      恶魔: "执念、欲望、依赖或控制",
      塔: "突发摊牌、旧结构被打破",
      星星: "修复、希望、降低防御",
      月亮: "不确定、误会、暧昧和恐惧",
      太阳: "明朗、公开、积极回应",
      审判: "复盘、重新决定、关系召回",
      世界: "完成、定局、进入下一阶段"
    };
    return majorThemes[card.name] || card.keyword;
  }

  const suitThemes = {
    权杖: "主动性、热情、推进速度",
    圣杯: "情绪回应、亲密感、真实感受",
    宝剑: "沟通、判断、误会、边界",
    星币: "现实投入、时间安排、承诺和稳定性"
  };
  return suitThemes[card.family] || card.keyword;
}

function concreteSituation(card, context) {
  const reversed = card.reversed;
  const theme = cardTheme(card);

  if (context.domain.id === "relationship") {
    const byFamily = {
      权杖: reversed
        ? "具体到关系推进，就是热度或主动性不稳定：可能一阵热、一阵冷，或者想推进但行动跟不上。"
        : "具体到关系推进，就是可以有主动动作：发起见面、制造互动、表达兴趣，但不要用冲动代替确认。",
      圣杯: reversed
        ? "具体到关系推进，就是情绪回应不稳定：可能有好感，但表达别扭，或一方感受很多却没有安全感。"
        : "具体到关系推进，就是感受层面还有连接：适合温和表达真实感受，观察对方是否愿意接住。",
      宝剑: reversed
        ? "具体到关系推进，就是沟通里有卡点：可能误解、猜测、逃避谈清楚，或明明想说却越说越僵。"
        : "具体到关系推进，就是先把话说清：关系定义、边界、顾虑、下一步安排都需要被具体化。",
      星币: reversed
        ? "具体到关系推进，就是现实投入不足：时间、见面、承诺、稳定付出里至少有一项没有跟上。"
        : "具体到关系推进，就是看实际行动：有没有见面安排、是否稳定回复、是否愿意为关系投入时间和资源。"
    };
    const major = card.arcana === "大阿卡纳"
      ? `具体到关系推进，${card.name}${reversed ? "逆位" : "正位"}不是在说“有没有缘分”这么虚，而是在说这段关系目前被“${theme}”主导。${reversed ? "它更像提醒：这件事不能按原来的方式硬推。" : "它更像提醒：顺着这个主题推进，会比单纯追问结果更有效。"}`
      : byFamily[card.family];
    return major;
  }

  if (context.domain.id === "career") {
    const byFamily = {
      权杖: reversed ? "落到工作里，是执行或动力不足：先别扩大战线，把一个动作做完。" : "落到工作里，是可以主动推进项目、争取机会或加快节奏。",
      圣杯: reversed ? "落到工作里，是情绪、人情或团队气氛影响判断：别靠感觉做决定。" : "落到工作里，是团队关系和客户感受可以成为助力。",
      宝剑: reversed ? "落到工作里，是信息不清、沟通误差或判断混乱：先补资料、确认口径。" : "落到工作里，是汇报、谈判、合同和逻辑判断要优先处理。",
      星币: reversed ? "落到工作里，是资源、预算、收益或流程没有跟上：先核算现实成本。" : "落到工作里，是成果、钱、资源和稳定产出正在成为关键。"
    };
    return card.arcana === "大阿卡纳"
      ? `落到工作里，${card.name}${reversed ? "逆位" : "正位"}说明这不是小细节，而是“${theme}”这个大框架在影响结果。`
      : byFamily[card.family];
  }

  if (context.domain.id === "choice") {
    return `落到选择题里，${card.name}${reversed ? "逆位" : "正位"}代表这条路的关键词是“${theme}”。${reversed ? "这一路不是不能走，但要先处理它暴露出的成本或风险。" : "这一路相对可用，但仍要看你是否愿意承担它要求的行动。"}`;
  }

  return `具体到你的问题，${card.name}${reversed ? "逆位" : "正位"}把焦点放在“${theme}”。${reversed ? "先修正这个点，再谈推进。" : "可以顺着这个点采取下一步。"}`;
}

function concreteMove(card, context) {
  if (context.domain.id === "relationship") {
    if (card.family === "宝剑" || /正义|恋人|月亮|女祭司/.test(card.name)) {
      return card.reversed
        ? "具体动作：不要继续靠猜；发一条清楚但不逼迫的信息，问对方近期是否愿意见面或把现状说清。"
        : "具体动作：把你的需求说成事实句，例如“我想知道我们接下来是否继续认真了解”，避免拐弯试探。";
    }
    if (card.family === "星币" || /皇帝|教皇|世界/.test(card.name)) {
      return card.reversed
        ? "具体动作：先看对方有没有实际投入，而不是只听表达；没有时间安排和稳定回应，就先降期待。"
        : "具体动作：把推进落到现实安排，比如约定见面时间、沟通频率，或确认彼此能投入什么。";
    }
    if (card.family === "圣杯" || /女皇|星星|太阳|节制/.test(card.name)) {
      return card.reversed
        ? "具体动作：先安抚情绪，不要在不安里追问答案；用温和表达替代控诉。"
        : "具体动作：可以释放善意和关心，但要观察对方是否也有同等回应。";
    }
    return card.reversed
      ? "具体动作：暂时不要加速推进，先看对方是否主动补上行动。"
      : "具体动作：可以主动制造一次互动，但把目标设成“看回应”，不是马上要结果。";
  }

  if (context.domain.id === "career") {
    if (card.family === "星币") return card.reversed ? "具体动作：先算成本、资源和收益，别急着承诺交付。" : "具体动作：把目标拆成排期、预算、交付物。";
    if (card.family === "宝剑") return card.reversed ? "具体动作：先确认信息源和沟通口径。" : "具体动作：写清方案、边界、责任人。";
    if (card.family === "权杖") return card.reversed ? "具体动作：先收缩任务，不要同时开太多线。" : "具体动作：主动推进一个关键节点。";
    return card.reversed ? "具体动作：先处理团队情绪或合作阻力。" : "具体动作：找关键人沟通，争取支持。";
  }

  return card.reversed ? "具体动作：先暂停，修正这个位置暴露的问题。" : "具体动作：顺着这张牌的关键词做一个小而明确的动作。";
}

function cardEssence(card, context) {
  const orientation = card.reversed ? "逆位" : "正位";
  const theme = cardTheme(card);
  return `${card.name}${orientation}在“${card.position}”位置，放到你的问题里先看“${theme}”。${contextBridge(card, context)} ${concreteSituation(card, context)} ${concreteMove(card, context)}`;
}

function countBy(cards, key) {
  return cards.reduce((acc, card) => {
    acc[card[key]] = (acc[card[key]] || 0) + 1;
    return acc;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}${value}`)
    .join("、");
}

function dominantKey(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "无";
}

function buildCardReadings(cards, context) {
  return cards.map((card, index) => {
    const role = positionAdvice[card.position] || "这一位需要结合牌阵上下文读取。";
    const arcana = arcanaMeaning[card.arcana] || "";
    return `
      <section class="deep-block">
        <h4>${index + 1}. ${card.position}：${card.name}${card.reversed ? "逆位" : "正位"}</h4>
        <p>${role}</p>
        <p>${cardEssence(card, context)}</p>
        <p>${arcana}</p>
      </section>
    `;
  }).join("");
}

function buildRelationship(cards, spread, context) {
  if (spread.count === 1) {
    return `这次只有一张牌，所以重点不是比较，而是把这张牌当作“${context.subject}”里此刻最响的信号。先问：它在提醒你靠近什么，或停止什么？`;
  }

  const first = cards[0];
  const last = cards[cards.length - 1];
  const center = cards[Math.floor(cards.length / 2)];
  const sameElementPairs = cards.slice(1).filter((card) => card.element === first.element).length;
  const reversedChain = cards.filter((card) => card.reversed).map((card) => card.position);

  const lines = [
    `围绕“${context.subject}”，整组牌可以从“${first.position}的${first.name}”读到“${last.position}的${last.name}”：前者像这件事的入口，后者像当前路径的落点。`,
    `中轴牌可看“${center.position}的${center.name}”，它负责解释这件事为什么会从入口走向落点。`
  ];

  if (sameElementPairs > 0) {
    lines.push(`开始牌的${first.element}元素在后续位置重复出现，说明“${context.subject}”的底色会反复回到${first.element}元素主题：${elementMeaning[first.element]}`);
  }
  if (reversedChain.length) {
    lines.push(`逆位集中在${reversedChain.join("、")}，这些位置不是简单变差，而是提示能量流动不顺，最需要先处理。`);
  } else {
    lines.push("没有逆位时，牌阵更像在描述一条相对顺畅的路径。难点不一定少，但信息更直接，行动也更容易落地。");
  }

  return lines.join(" ");
}

function buildQuestionAnswer(cards, spread, context) {
  const adviceCard = cards.find((card) => /建议|下一步|你的姿态|现在状态/.test(card.position)) || cards[Math.min(2, cards.length - 1)];
  const obstacleCard = cards.find((card) => /阻碍|挑战|代价|恐惧|交叉|隐藏/.test(card.position)) || cards.find((card) => card.reversed);
  const trendCard = cards.find((card) => /趋势|未来|结果|发展/.test(card.position)) || cards[cards.length - 1];
  const coreCard = spread.count === 3 ? cards[1] : cards[Math.floor(cards.length / 2)];

  const directVerdict = (() => {
    if (context.domain.id === "relationship" && context.intent.id === "action") {
      if (coreCard.reversed) return `一句话结论：这段关系现在不适合硬推，先处理${coreCard.name}逆位暴露出的卡点，再看对方有没有实际回应。`;
      return `一句话结论：这段关系可以推进，但推进方式要贴着${coreCard.name}正位来做，重点是具体行动和清楚表达，不是情绪试探。`;
    }
    if (context.domain.id === "relationship" && context.intent.id === "trend") {
      return `一句话结论：按现在的互动方式走下去，趋势会由${trendCard.name}${trendCard.reversed ? "逆位" : "正位"}主导；你要观察的不是口头态度，而是回应是否稳定、行动是否跟上。`;
    }
    if (context.domain.id === "career") {
      return `一句话结论：这件事的关键不在想法本身，而在${coreCard.name}${coreCard.reversed ? "逆位" : "正位"}指出的执行条件是否成立。`;
    }
    if (context.domain.id === "choice") {
      return `一句话结论：不要只问“能不能”，要看${coreCard.name}${coreCard.reversed ? "逆位" : "正位"}代表的代价你是否愿意承担。`;
    }
    return `一句话结论：这件事先按${coreCard.name}${coreCard.reversed ? "逆位" : "正位"}指出的核心问题处理，再看后续反馈。`;
  })();

  const answerLead = `${directVerdict} ${concreteSituation(coreCard, context)}`;

  const obstacle = obstacleCard
    ? `最卡的点在${obstacleCard.position}的${obstacleCard.name}${obstacleCard.reversed ? "逆位" : "正位"}：${concreteSituation(obstacleCard, context)}`
    : "这组牌没有明显阻碍位，重点在于把意图落到具体行动。";

  const action = adviceCard
    ? `最可执行的一步看${adviceCard.position}的${adviceCard.name}${adviceCard.reversed ? "逆位" : "正位"}：${concreteMove(adviceCard, context)}`
    : "最可执行的一步，是先把问题拆成一个现实动作。";

  const trend = trendCard
    ? `后续观察${trendCard.position}的${trendCard.name}${trendCard.reversed ? "逆位" : "正位"}：如果现实里出现${cardTheme(trendCard)}相关的变化，就说明牌阵开始应验。`
    : "";

  return `${answerLead} ${obstacle} ${action} ${trend}`;
}

function buildActionPlan(cards, spread, context) {
  const adviceCard = cards.find((card) => /建议|下一步|你的姿态|现在状态/.test(card.position)) || cards[Math.min(2, cards.length - 1)];
  const obstacleCard = cards.find((card) => /阻碍|挑战|代价|恐惧|交叉/.test(card.position)) || cards.find((card) => card.reversed);
  const trendCard = cards.find((card) => /趋势|未来|结果|发展/.test(card.position)) || cards[cards.length - 1];

  const steps = [
    `先做：${adviceCard ? concreteMove(adviceCard, context) : `把“${context.subject}”缩成一个今天能完成的小动作。`} `,
    `先别做：${obstacleCard ? `不要重复${obstacleCard.name}${obstacleCard.reversed ? "逆位" : "正位"}暴露出的旧方式。${concreteSituation(obstacleCard, context)}` : "不要同时问太多层，也不要立刻重复抽同一个问题。"} `,
    `看信号：${trendCard ? `接下来观察现实里是否出现“${cardTheme(trendCard)}”：比如对方是否回应、事情是否落地、资源是否到位、沟通是否变清楚。` : "一周后复盘现实反馈。"}`
  ];

  if (spread.count >= 6) {
    steps.push("这类大牌阵信息量高，建议只选 1-2 个最刺眼的位置先行动，不要一次性把所有牌都变成任务。");
  }

  return steps.map((step) => `<li>${step}</li>`).join("");
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let listTag = null;
  let sectionOpen = false;

  function closeList() {
    if (listTag) {
      html.push(`</${listTag}>`);
      listTag = null;
    }
  }

  function closeSection() {
    closeList();
    if (sectionOpen) {
      html.push("</section>");
      sectionOpen = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      closeSection();
      html.push(`<section class="deep-block"><h4>${escapeHtml(heading[1])}</h4>`);
      sectionOpen = true;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (listTag !== "ul") {
        closeList();
        html.push("<ul>");
        listTag = "ul";
      }
      html.push(`<li>${escapeInlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      if (listTag !== "ol") {
        closeList();
        html.push("<ol>");
        listTag = "ol";
      }
      html.push(`<li>${escapeInlineMarkdown(numbered[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeInlineMarkdown(line)}</p>`);
  }

  closeSection();
  return html.join("\n");
}

function escapeInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function showAiSetupMessage(error) {
  synthesisEl.hidden = false;
  synthesisEl.innerHTML = `
    <h3>AI 解读未启用</h3>
    <section class="deep-block">
      <h4>为什么现在还是不够像真人解读</h4>
      <p>${escapeHtml(error || "本地后端没有检测到 DEEPSEEK_API_KEY 或 OPENAI_API_KEY。")}</p>
      <p>目前网页已经停止使用伪深度模板。要得到真正结合问题和背景的解读，需要在后端启用模型推理。</p>
    </section>
    <section class="deep-block">
      <h4>启用方式</h4>
      <p>在启动服务前设置环境变量：</p>
      <p><code>$env:DEEPSEEK_API_KEY="你的 DeepSeek API Key"</code></p>
      <p>可选：<code>$env:DEEPSEEK_MODEL="deepseek-v4-pro"</code></p>
      <p>也可以使用 OpenAI：<code>$env:OPENAI_API_KEY="你的 OpenAI API Key"</code></p>
      <p>然后重新运行 <code>npm start</code>，刷新页面再抽牌。</p>
    </section>
  `;
}

async function synthesize(question, background, cards, spread) {
  synthesisEl.hidden = false;
  synthesisEl.innerHTML = `
    <h3>AI 正在解读</h3>
    <section class="deep-block">
      <h4>正在结合问题、背景、牌阵和 Obsidian 牌义</h4>
      <p>这一步会交给后端模型推理，不再使用前端模板拼接。</p>
    </section>
  `;

  try {
    const response = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        background,
        spread,
        cards,
        guidance: state.knowledge?.guidance?.spreads || ""
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showAiSetupMessage(data.error || "AI解读失败");
      return;
    }
    synthesisEl.innerHTML = `
      <h3>AI 深度解读</h3>
      ${markdownToHtml(data.reading)}
      <section class="deep-block meta-block">
        <h4>模型</h4>
        <p>${escapeHtml(data.model || "未知")}</p>
      </section>
    `;
  } catch (error) {
    showAiSetupMessage(error.message);
  }
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

async function draw() {
  if (!state.knowledge) return;
  const question = $("#question").value.trim();
  const background = $("#background").value.trim();
  const spread = spreads[spreadSelectEl.value];
  const deckMode = $("#deckMode").value;
  const allowReversed = $("#allowReversed").checked;
  const cards = sampleCards(spread, deckMode, allowReversed);
  state.current = cards;
  readingTitleEl.textContent = `${spread.name}已展开`;
  renderCards(cards);
  await synthesize(question, background, cards, spread);
}

function clearReading() {
  state.current = [];
  readingTitleEl.textContent = "等待抽牌";
  synthesisEl.hidden = true;
  synthesisEl.innerHTML = "";
  cardsEl.className = "cards empty";
  cardsEl.innerHTML = "<p>输入问题后开启牌阵。牌义会从你的 Obsidian Markdown 中读取。</p>";
}

spreadSelectEl.addEventListener("change", renderSpreadGuide);
$("#drawBtn").addEventListener("click", draw);
$("#clearBtn").addEventListener("click", clearReading);

initSpreadSelect();
loadKnowledge().catch((error) => {
  vaultStatusEl.textContent = error.message;
  cardsEl.className = "cards empty";
  cardsEl.innerHTML = `<p>${escapeHtml(error.message)}<br>先在项目目录运行 npm start，再打开 http://localhost:5177。</p>`;
});
