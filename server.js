const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5177);
const VAULT_ROOT = process.env.OBSIDIAN_VAULT || "D:\\ObsidianVault";
const TAROT_DIR = path.join(VAULT_ROOT, "塔罗");
const PUBLIC_DIR = path.join(__dirname, "public");
const BUNDLED_DATA_FILE = path.join(__dirname, "data", "tarot-knowledge.json");
const AI_PROVIDER = process.env.DEEPSEEK_API_KEY ? "deepseek" : process.env.OPENAI_API_KEY ? "openai" : null;
const AI_MODEL = process.env.DEEPSEEK_API_KEY
  ? (process.env.DEEPSEEK_MODEL || "deepseek-chat")
  : (process.env.OPENAI_MODEL || "gpt-4.1-mini");

const major = [
  ["愚者", "0", "风", "新生与冒险精神"],
  ["魔术师", "I", "水", "沟通与创造"],
  ["女祭司", "II", "水", "直觉智慧与被动观察"],
  ["女皇", "III", "土", "丰饶收获与感官享受"],
  ["皇帝", "IV", "火", "权力掌控与秩序建立"],
  ["教皇", "V", "土", "精神指引与传统教化"],
  ["恋人", "VI", "风", "关键选择与关系成长"],
  ["战车", "VII", "水", "情绪驾驭与意志"],
  ["力量", "VIII", "火", "温柔驯服本能"],
  ["隐士", "IX", "土", "向内求索与孤独智慧"],
  ["命运之轮", "X", "火", "周期转动与局势变化"],
  ["正义", "XI", "风", "平衡、判断与因果"],
  ["倒吊人", "XII", "水", "牺牲、等待与换位视角"],
  ["死神", "XIII", "水", "结束、转化与新阶段"],
  ["节制", "XIV", "火", "调和、流动与整合"],
  ["恶魔", "XV", "土", "欲望、束缚与执念"],
  ["塔", "XVI", "火", "结构崩塌与真相显露"],
  ["星星", "XVII", "风", "疗愈、希望与信任"],
  ["月亮", "XVIII", "水", "迷雾、恐惧与潜意识"],
  ["太阳", "XIX", "火", "清晰、喜悦与生命力"],
  ["审判", "XX", "火", "召唤、复盘与重生"],
  ["世界", "XXI", "土", "完成、整合与终章"]
];

const suits = [
  ["权杖", "火", "外向、激情、勇敢、主动追寻目标"],
  ["圣杯", "水", "情感、直觉、关系与内在感受"],
  ["宝剑", "风", "思维、冲突、判断与沟通"],
  ["星币", "土", "现实、资源、身体与长期积累"]
];
const numbers = [
  ["首牌", "一", "开端"],
  ["二", "二", "选择"],
  ["三", "三", "实行"],
  ["四", "四", "稳定"],
  ["五", "五", "冲突"],
  ["六", "六", "调整"],
  ["七", "七", "挑战"],
  ["八", "八", "流动"],
  ["九", "九", "积累"],
  ["十", "十", "完成"]
];
const court = ["侍从", "骑士", "王后", "国王"];

function readIfExists(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\s*/, "");
}

function cleanMarkdown(text) {
  return text
    .replace(/\r/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)]]/g, (_, a, b) => b || a)
    .replace(/[`*_>#]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function compact(text, limit = 520) {
  const oneLine = cleanMarkdown(text).replace(/\n{3,}/g, "\n\n");
  return oneLine.length > limit ? `${oneLine.slice(0, limit).trim()}...` : oneLine;
}

function parseHeadingSections(text) {
  const sections = [];
  const lines = stripFrontmatter(text).split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) sections.push(current);
  return sections;
}

function parseTableRows(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => /^\|.+\|$/.test(line) && !/^\|:?-+/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cleanMarkdown(cell).trim()));
}

function sectionForName(sections, cardName) {
  return sections.find((section) => {
    const title = section.title.replace(/\s/g, "");
    return title.includes(cardName) || title.includes(cardName.replace("首牌", "一"));
  });
}

function sourceLink(relativeFile) {
  return {
    file: relativeFile,
    obsidian: `obsidian://open?vault=${encodeURIComponent(path.basename(VAULT_ROOT))}&file=${encodeURIComponent(`塔罗/${relativeFile.replace(/\\/g, "/").replace(/\.md$/, "")}`)}`
  };
}

function buildDeck() {
  const files = {
    majorA: "03_大牌牌意_愚者到战车.md",
    majorB: "04_大牌牌意_力量到恶魔.md",
    majorC: "05_大牌牌意_塔到世界.md",
    wands: "08_小牌牌意_权杖组.md",
    cups: "09_小牌牌意_圣杯组.md",
    swords: "10_小牌牌意_宝剑组.md",
    pentacles: "11_小牌牌意_星币组.md",
    court: "12_宫廷牌体系.md",
    spreads: "06_牌阵与问题分类.md",
    ethics: "02_占卜流程与伦理.md",
    intro: "01_塔罗牌认识.md"
  };

  const majorSections = [
    [files.majorA, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorA)))],
    [files.majorB, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorB)))],
    [files.majorC, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorC)))]
  ];
  const minorFiles = {
    权杖: files.wands,
    圣杯: files.cups,
    宝剑: files.swords,
    星币: files.pentacles
  };
  const cards = [];

  for (const [name, number, element, fallback] of major) {
    const found = majorSections.map(([file, sections]) => [file, sectionForName(sections, name)]).find(([, section]) => section);
    cards.push({
      id: `major-${name}`,
      name,
      arcana: "大阿卡纳",
      number,
      element,
      family: "大牌",
      keyword: fallback,
      meaning: found ? compact(found[1].body, 880) : fallback,
      source: sourceLink(found ? found[0] : files.intro)
    });
  }

  for (const [suit, element, familyKeyword] of suits) {
    const relative = minorFiles[suit];
    const sections = parseHeadingSections(readIfExists(path.join(TAROT_DIR, relative)));
    for (const [headingNum, displayNum, fallback] of numbers) {
      const name = `${suit}${displayNum}`;
      const section = sectionForName(sections, `${suit}${headingNum}`) || sectionForName(sections, name);
      cards.push({
        id: `minor-${name}`,
        name,
        arcana: "小阿卡纳",
        number: displayNum,
        element,
        family: suit,
        keyword: section ? cleanMarkdown(section.title).replace(/^.+?—\s*/, "") : `${familyKeyword}的${fallback}阶段`,
        meaning: section ? compact(section.body, 760) : `${suit}组代表${familyKeyword}；${name}落在${fallback}主题上。`,
        source: sourceLink(relative)
      });
    }
  }

  const courtText = readIfExists(path.join(TAROT_DIR, files.court));
  const rows = parseTableRows(courtText);
  for (const [suit, element, familyKeyword] of suits) {
    for (const rank of court) {
      const name = `${suit}${rank}`;
      const row = rows.find((cells) => cells[0] === name);
      cards.push({
        id: `court-${name}`,
        name,
        arcana: "宫廷牌",
        number: rank,
        element,
        family: suit,
        keyword: row ? row[row.length - 1] : `${familyKeyword}中的${rank}人格`,
        meaning: row ? `${name}：${row.join(" | ")}。宫廷牌可表示人物、关系中的能量姿态，或事件背后的行动风格。` : `${name}带有${element}元素与${rank}阶层特质。`,
        source: sourceLink(files.court)
      });
    }
  }

  const spreadText = compact(readIfExists(path.join(TAROT_DIR, files.spreads)), 1500);
  const ethicsText = compact(readIfExists(path.join(TAROT_DIR, files.ethics)), 1100);
  return {
    vaultRoot: VAULT_ROOT,
    tarotDir: TAROT_DIR,
    generatedAt: new Date().toISOString(),
    aiEnabled: Boolean(AI_PROVIDER),
    aiProvider: AI_PROVIDER,
    aiModel: AI_PROVIDER ? AI_MODEL : null,
    cards,
    guidance: {
      spreads: spreadText,
      ethics: ethicsText,
      source: sourceLink(files.spreads)
    }
  };
}

function buildKnowledge() {
  if (fs.existsSync(BUNDLED_DATA_FILE) && !fs.existsSync(TAROT_DIR)) {
    const bundled = JSON.parse(fs.readFileSync(BUNDLED_DATA_FILE, "utf8"));
    return {
      ...bundled,
      generatedAt: new Date().toISOString(),
      sourceMode: "bundled",
      aiEnabled: Boolean(AI_PROVIDER),
      aiProvider: AI_PROVIDER,
      aiModel: AI_PROVIDER ? AI_MODEL : null
    };
  }
  return buildDeck();
}

function sendJson(res, data) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function sendJsonError(res, status, message, details) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify({ error: message, details }));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("请求内容过大"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("请求 JSON 格式不正确"));
      }
    });
    req.on("error", reject);
  });
}

function safeText(value, limit = 4000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function markdownListCards(cards) {
  return cards.map((card, index) => {
    const orientation = card.reversed ? "逆位" : "正位";
    return [
      `${index + 1}. ${card.position}：${card.name}${orientation}`,
      `   - 类型：${card.arcana} / ${card.family} / ${card.element}元素`,
      `   - 关键词：${safeText(card.keyword, 180)}`,
      `   - Obsidian牌义：${safeText(card.meaning, 1200)}`
    ].join("\n");
  }).join("\n");
}

function buildReadingPrompt(payload) {
  const question = safeText(payload.question, 1200);
  const background = safeText(payload.background, 2400);
  const spreadName = safeText(payload.spread?.name, 160);
  const spreadFunction = safeText(payload.spread?.function, 500);
  const spreadUsage = safeText(payload.spread?.usage, 500);
  const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, 12) : [];
  const guidance = safeText(payload.guidance, 1200);

  return `你是一位严谨、直白、有经验的中文塔罗师。你会使用用户的 Obsidian 塔罗笔记作为牌义依据，但你的任务不是复述牌义，而是把牌义映射到用户的问题和背景里，给出具体判断。

必须遵守：
1. 不要写“能量、课题、模式、显影、校准”这类空泛话，除非马上翻译成现实行为。
2. 不要逐字复述牌面画面和元素知识，除非它能直接解释用户的问题。
3. 每张牌都必须回答“这张牌落在这个问题里，现实中可能对应什么情况”。
4. 如果背景不足，先明确说“还缺什么背景会影响判断”，但仍要基于现有信息给出条件式判断。
5. 不许把所有可能性都摊平。要给主判断、次判断、反证信号。
6. 塔罗不是医疗、法律、投资等专业建议；遇到高风险事项要提醒寻求专业帮助。

输出格式固定为：
## 直接结论
用 3-5 句话直接回答用户的问题。要有明确倾向，不要只说“看情况”。

## 为什么这样判断
把整组牌连成一个因果链：现状是什么，核心卡点是什么，建议为什么是这样。

## 逐牌落到现实
逐张牌写，每张 2-4 句。必须包含：
- 这张牌在此牌位代表的现实情况
- 对用户问题的具体含义
- 一个可观察的现实信号

## 你现在该怎么做
给 3-5 条具体动作。动作要像真人建议，例如“先发一条信息确认见面时间”“暂时别追问定义”“观察对方是否主动补行动”。

## 反证与复盘
写 2-4 条。如果现实出现什么现象，说明本次解读需要修正。

用户问题：
${question || "用户没有填写具体问题"}

背景补充：
${background || "用户没有填写背景。请明确指出这会限制判断，并说明最需要补充哪几类背景。"}

牌阵：
${spreadName || "未知牌阵"}
功能：${spreadFunction || "未提供"}
用法：${spreadUsage || "未提供"}

抽到的牌：
${markdownListCards(cards)}

Obsidian占卜原则补充：
${guidance || "无"}
`;
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
      if (content.type === "text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function extractChatCompletionText(data) {
  const message = data.choices?.[0]?.message || {};
  if (typeof message.content === "string" && message.content.trim()) return message.content.trim();
  if (Array.isArray(message.content)) {
    const text = message.content.map((part) => part.text || part.content || "").join("\n").trim();
    if (text) return text;
  }
  if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) {
    return message.reasoning_content.trim();
  }
  return "";
}

async function createAiReading(payload) {
  if (!AI_PROVIDER) {
    const error = new Error("AI解读未启用：请先配置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY。");
    error.statusCode = 501;
    throw error;
  }

  const prompt = buildReadingPrompt(payload);
  if (AI_PROVIDER === "deepseek") {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 6000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "你是中文塔罗解读助手。必须基于用户问题、背景、牌阵和牌义作具体判断，不输出泛泛牌义。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || `DeepSeek API 请求失败：${response.status}`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const reading = extractChatCompletionText(data);
    if (!reading) {
      const error = new Error("DeepSeek没有返回可用解读。");
      error.statusCode = 502;
      throw error;
    }

    return { reading, model: AI_MODEL, provider: "DeepSeek" };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_output_tokens: 2200,
      input: [
        {
          role: "system",
          content: "你是中文塔罗解读助手。必须基于用户问题、背景、牌阵和牌义作具体判断，不输出泛泛牌义。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `OpenAI API 请求失败：${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const reading = extractResponseText(data);
  if (!reading) {
    const error = new Error("AI没有返回可用解读。");
    error.statusCode = 502;
    throw error;
  }

  return { reading, model: AI_MODEL, provider: "OpenAI" };
}

function sendFile(res, file) {
  const ext = path.extname(file).toLowerCase();
  const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json" };
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": `${types[ext] || "application/octet-stream"}; charset=utf-8` });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/api/knowledge") {
    sendJson(res, buildKnowledge());
    return;
  }
  if (url.pathname === "/api/reading" && req.method === "POST") {
    try {
      const payload = await readJsonBody(req);
      const result = await createAiReading(payload);
      sendJson(res, result);
    } catch (error) {
      sendJsonError(res, error.statusCode || 500, error.message || "AI解读失败");
    }
    return;
  }
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  sendFile(res, file);
});

if (!process.env.EXPORT_TAROT_KNOWLEDGE) {
  server.listen(PORT, () => {
    console.log(`赛博塔罗师已启动：http://localhost:${PORT}`);
    console.log(`Obsidian 塔罗库：${TAROT_DIR}`);
  });
}

module.exports = { buildDeck, buildKnowledge };
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5177);
const VAULT_ROOT = process.env.OBSIDIAN_VAULT || "D:\\ObsidianVault";
const TAROT_DIR = path.join(VAULT_ROOT, "塔罗");
const PUBLIC_DIR = path.join(__dirname, "public");
const BUNDLED_DATA_FILE = path.join(__dirname, "data", "tarot-knowledge.json");
const AI_PROVIDER = process.env.DEEPSEEK_API_KEY ? "deepseek" : process.env.OPENAI_API_KEY ? "openai" : null;
const AI_MODEL = process.env.DEEPSEEK_API_KEY
  ? (process.env.DEEPSEEK_MODEL || "deepseek-chat")
  : (process.env.OPENAI_MODEL || "gpt-4.1-mini");

const major = [
  ["愚者", "0", "风", "新生与冒险精神"],
  ["魔术师", "I", "水", "沟通与创造"],
  ["女祭司", "II", "水", "直觉智慧与被动观察"],
  ["女皇", "III", "土", "丰饶收获与感官享受"],
  ["皇帝", "IV", "火", "权力掌控与秩序建立"],
  ["教皇", "V", "土", "精神指引与传统教化"],
  ["恋人", "VI", "风", "关键选择与关系成长"],
  ["战车", "VII", "水", "情绪驾驭与意志"],
  ["力量", "VIII", "火", "温柔驯服本能"],
  ["隐士", "IX", "土", "向内求索与孤独智慧"],
  ["命运之轮", "X", "火", "周期转动与局势变化"],
  ["正义", "XI", "风", "平衡、判断与因果"],
  ["倒吊人", "XII", "水", "牺牲、等待与换位视角"],
  ["死神", "XIII", "水", "结束、转化与新阶段"],
  ["节制", "XIV", "火", "调和、流动与整合"],
  ["恶魔", "XV", "土", "欲望、束缚与执念"],
  ["塔", "XVI", "火", "结构崩塌与真相显露"],
  ["星星", "XVII", "风", "疗愈、希望与信任"],
  ["月亮", "XVIII", "水", "迷雾、恐惧与潜意识"],
  ["太阳", "XIX", "火", "清晰、喜悦与生命力"],
  ["审判", "XX", "火", "召唤、复盘与重生"],
  ["世界", "XXI", "土", "完成、整合与终章"]
];

const suits = [
  ["权杖", "火", "外向、激情、勇敢、主动追寻目标"],
  ["圣杯", "水", "情感、直觉、关系与内在感受"],
  ["宝剑", "风", "思维、冲突、判断与沟通"],
  ["星币", "土", "现实、资源、身体与长期积累"]
];
const numbers = [
  ["首牌", "一", "开端"],
  ["二", "二", "选择"],
  ["三", "三", "实行"],
  ["四", "四", "稳定"],
  ["五", "五", "冲突"],
  ["六", "六", "调整"],
  ["七", "七", "挑战"],
  ["八", "八", "流动"],
  ["九", "九", "积累"],
  ["十", "十", "完成"]
];
const court = ["侍从", "骑士", "王后", "国王"];

function readIfExists(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\s*/, "");
}

function cleanMarkdown(text) {
  return text
    .replace(/\r/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)]]/g, (_, a, b) => b || a)
    .replace(/[`*_>#]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function compact(text, limit = 520) {
  const oneLine = cleanMarkdown(text).replace(/\n{3,}/g, "\n\n");
  return oneLine.length > limit ? `${oneLine.slice(0, limit).trim()}...` : oneLine;
}

function parseHeadingSections(text) {
  const sections = [];
  const lines = stripFrontmatter(text).split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) sections.push(current);
  return sections;
}

function parseTableRows(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => /^\|.+\|$/.test(line) && !/^\|:?-+/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cleanMarkdown(cell).trim()));
}

function sectionForName(sections, cardName) {
  return sections.find((section) => {
    const title = section.title.replace(/\s/g, "");
    return title.includes(cardName) || title.includes(cardName.replace("首牌", "一"));
  });
}

function sourceLink(relativeFile) {
  return {
    file: relativeFile,
    obsidian: `obsidian://open?vault=${encodeURIComponent(path.basename(VAULT_ROOT))}&file=${encodeURIComponent(`塔罗/${relativeFile.replace(/\\/g, "/").replace(/\.md$/, "")}`)}`
  };
}

function buildDeck() {
  const files = {
    majorA: "03_大牌牌意_愚者到战车.md",
    majorB: "04_大牌牌意_力量到恶魔.md",
    majorC: "05_大牌牌意_塔到世界.md",
    wands: "08_小牌牌意_权杖组.md",
    cups: "09_小牌牌意_圣杯组.md",
    swords: "10_小牌牌意_宝剑组.md",
    pentacles: "11_小牌牌意_星币组.md",
    court: "12_宫廷牌体系.md",
    spreads: "06_牌阵与问题分类.md",
    ethics: "02_占卜流程与伦理.md",
    intro: "01_塔罗牌认识.md"
  };

  const majorSections = [
    [files.majorA, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorA)))],
    [files.majorB, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorB)))],
    [files.majorC, parseHeadingSections(readIfExists(path.join(TAROT_DIR, files.majorC)))]
  ];
  const minorFiles = {
    权杖: files.wands,
    圣杯: files.cups,
    宝剑: files.swords,
    星币: files.pentacles
  };
  const cards = [];

  for (const [name, number, element, fallback] of major) {
    const found = majorSections.map(([file, sections]) => [file, sectionForName(sections, name)]).find(([, section]) => section);
    cards.push({
      id: `major-${name}`,
      name,
      arcana: "大阿卡纳",
      number,
      element,
      family: "大牌",
      keyword: fallback,
      meaning: found ? compact(found[1].body, 880) : fallback,
      source: sourceLink(found ? found[0] : files.intro)
    });
  }

  for (const [suit, element, familyKeyword] of suits) {
    const relative = minorFiles[suit];
    const sections = parseHeadingSections(readIfExists(path.join(TAROT_DIR, relative)));
    for (const [headingNum, displayNum, fallback] of numbers) {
      const name = `${suit}${displayNum}`;
      const section = sectionForName(sections, `${suit}${headingNum}`) || sectionForName(sections, name);
      cards.push({
        id: `minor-${name}`,
        name,
        arcana: "小阿卡纳",
        number: displayNum,
        element,
        family: suit,
        keyword: section ? cleanMarkdown(section.title).replace(/^.+?—\s*/, "") : `${familyKeyword}的${fallback}阶段`,
        meaning: section ? compact(section.body, 760) : `${suit}组代表${familyKeyword}；${name}落在${fallback}主题上。`,
        source: sourceLink(relative)
      });
    }
  }

  const courtText = readIfExists(path.join(TAROT_DIR, files.court));
  const rows = parseTableRows(courtText);
  for (const [suit, element, familyKeyword] of suits) {
    for (const rank of court) {
      const name = `${suit}${rank}`;
      const row = rows.find((cells) => cells[0] === name);
      cards.push({
        id: `court-${name}`,
        name,
        arcana: "宫廷牌",
        number: rank,
        element,
        family: suit,
        keyword: row ? row[row.length - 1] : `${familyKeyword}中的${rank}人格`,
        meaning: row ? `${name}：${row.join(" | ")}。宫廷牌可表示人物、关系中的能量姿态，或事件背后的行动风格。` : `${name}带有${element}元素与${rank}阶层特质。`,
        source: sourceLink(files.court)
      });
    }
  }

  const spreadText = compact(readIfExists(path.join(TAROT_DIR, files.spreads)), 1500);
  const ethicsText = compact(readIfExists(path.join(TAROT_DIR, files.ethics)), 1100);
  return {
    vaultRoot: VAULT_ROOT,
    tarotDir: TAROT_DIR,
    generatedAt: new Date().toISOString(),
    aiEnabled: Boolean(AI_PROVIDER),
    aiProvider: AI_PROVIDER,
    aiModel: AI_PROVIDER ? AI_MODEL : null,
    cards,
    guidance: {
      spreads: spreadText,
      ethics: ethicsText,
      source: sourceLink(files.spreads)
    }
  };
}

function buildKnowledge() {
  if (fs.existsSync(BUNDLED_DATA_FILE) && !fs.existsSync(TAROT_DIR)) {
    const bundled = JSON.parse(fs.readFileSync(BUNDLED_DATA_FILE, "utf8"));
    return {
      ...bundled,
      generatedAt: new Date().toISOString(),
      sourceMode: "bundled",
      aiEnabled: Boolean(AI_PROVIDER),
      aiProvider: AI_PROVIDER,
      aiModel: AI_PROVIDER ? AI_MODEL : null
    };
  }
  return buildDeck();
}

function sendJson(res, data) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function sendJsonError(res, status, message, details) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify({ error: message, details }));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("请求内容过大"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("请求 JSON 格式不正确"));
      }
    });
    req.on("error", reject);
  });
}

function safeText(value, limit = 4000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function markdownListCards(cards) {
  return cards.map((card, index) => {
    const orientation = card.reversed ? "逆位" : "正位";
    return [
      `${index + 1}. ${card.position}：${card.name}${orientation}`,
      `   - 类型：${card.arcana} / ${card.family} / ${card.element}元素`,
      `   - 关键词：${safeText(card.keyword, 180)}`,
      `   - Obsidian牌义：${safeText(card.meaning, 1200)}`
    ].join("\n");
  }).join("\n");
}

function buildReadingPrompt(payload) {
  const question = safeText(payload.question, 1200);
  const background = safeText(payload.background, 2400);
  const spreadName = safeText(payload.spread?.name, 160);
  const spreadFunction = safeText(payload.spread?.function, 500);
  const spreadUsage = safeText(payload.spread?.usage, 500);
  const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, 12) : [];
  const guidance = safeText(payload.guidance, 1200);

  return `你是一位严谨、直白、有经验的中文塔罗师。你会使用用户的 Obsidian 塔罗笔记作为牌义依据，但你的任务不是复述牌义，而是把牌义映射到用户的问题和背景里，给出具体判断。

必须遵守：
1. 不要写“能量、课题、模式、显影、校准”这类空泛话，除非马上翻译成现实行为。
2. 不要逐字复述牌面画面和元素知识，除非它能直接解释用户的问题。
3. 每张牌都必须回答“这张牌落在这个问题里，现实中可能对应什么情况”。
4. 如果背景不足，先明确说“还缺什么背景会影响判断”，但仍要基于现有信息给出条件式判断。
5. 不许把所有可能性都摊平。要给主判断、次判断、反证信号。
6. 塔罗不是医疗、法律、投资等专业建议；遇到高风险事项要提醒寻求专业帮助。

输出格式固定为：
## 直接结论
用 3-5 句话直接回答用户的问题。要有明确倾向，不要只说“看情况”。

## 为什么这样判断
把整组牌连成一个因果链：现状是什么，核心卡点是什么，建议为什么是这样。

## 逐牌落到现实
逐张牌写，每张 2-4 句。必须包含：
- 这张牌在此牌位代表的现实情况
- 对用户问题的具体含义
- 一个可观察的现实信号

## 你现在该怎么做
给 3-5 条具体动作。动作要像真人建议，例如“先发一条信息确认见面时间”“暂时别追问定义”“观察对方是否主动补行动”。

## 反证与复盘
写 2-4 条。如果现实出现什么现象，说明本次解读需要修正。

用户问题：
${question || "用户没有填写具体问题"}

背景补充：
${background || "用户没有填写背景。请明确指出这会限制判断，并说明最需要补充哪几类背景。"}

牌阵：
${spreadName || "未知牌阵"}
功能：${spreadFunction || "未提供"}
用法：${spreadUsage || "未提供"}

抽到的牌：
${markdownListCards(cards)}

Obsidian占卜原则补充：
${guidance || "无"}
`;
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
      if (content.type === "text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function extractChatCompletionText(data) {
  const message = data.choices?.[0]?.message || {};
  if (typeof message.content === "string" && message.content.trim()) return message.content.trim();
  if (Array.isArray(message.content)) {
    const text = message.content.map((part) => part.text || part.content || "").join("\n").trim();
    if (text) return text;
  }
  if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) {
    return message.reasoning_content.trim();
  }
  return "";
}

async function createAiReading(payload) {
  if (!AI_PROVIDER) {
    const error = new Error("AI解读未启用：请先配置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY。");
    error.statusCode = 501;
    throw error;
  }

  const prompt = buildReadingPrompt(payload);
  if (AI_PROVIDER === "deepseek") {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 6000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "你是中文塔罗解读助手。必须基于用户问题、背景、牌阵和牌义作具体判断，不输出泛泛牌义。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || `DeepSeek API 请求失败：${response.status}`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const reading = extractChatCompletionText(data);
    if (!reading) {
      const error = new Error("DeepSeek没有返回可用解读。");
      error.statusCode = 502;
      throw error;
    }

    return { reading, model: AI_MODEL, provider: "DeepSeek" };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_output_tokens: 2200,
      input: [
        {
          role: "system",
          content: "你是中文塔罗解读助手。必须基于用户问题、背景、牌阵和牌义作具体判断，不输出泛泛牌义。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `OpenAI API 请求失败：${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const reading = extractResponseText(data);
  if (!reading) {
    const error = new Error("AI没有返回可用解读。");
    error.statusCode = 502;
    throw error;
  }

  return { reading, model: AI_MODEL, provider: "OpenAI" };
}

function sendFile(res, file) {
  const ext = path.extname(file).toLowerCase();
  const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json" };
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": `${types[ext] || "application/octet-stream"}; charset=utf-8` });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/api/knowledge") {
    sendJson(res, buildKnowledge());
    return;
  }
  if (url.pathname === "/api/reading" && req.method === "POST") {
    try {
      const payload = await readJsonBody(req);
      const result = await createAiReading(payload);
      sendJson(res, result);
    } catch (error) {
      sendJsonError(res, error.statusCode || 500, error.message || "AI解读失败");
    }
    return;
  }
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  sendFile(res, file);
});

if (!process.env.EXPORT_TAROT_KNOWLEDGE) {
  server.listen(PORT, () => {
    console.log(`赛博塔罗师已启动：http://localhost:${PORT}`);
    console.log(`Obsidian 塔罗库：${TAROT_DIR}`);
  });
}

module.exports = { buildDeck, buildKnowledge };
