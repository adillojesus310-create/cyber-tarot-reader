---
name: cyber-tarot-reader
description: Use when the user wants Codex to perform tarot reading workflows: formulate tarot questions, choose spreads, draw cards, interpret cards against a concrete user background, use an Obsidian tarot knowledge base or bundled card meanings, call DeepSeek/OpenAI when available, or generate a copyable prompt for external AI tarot interpretation.
---

# Cyber Tarot Reader

Use this skill to help with tarot readings grounded in a concrete question, background, spread positions, and card meanings. Do not provide generic card meanings as the final answer.

## Workflow

1. Clarify or rewrite the question into a state, trend, cause, choice, or advice question.
2. Ask for missing background when it materially changes the reading, especially relationship status, recent events, existing choices, time range, and what the user wants to decide.
3. Choose a spread:
   - Single card: quick signal.
   - Three cards: status / core / advice.
   - Timeline: past root / current state / future trend.
   - Choice: A status / A opportunity / A cost / B status / B opportunity / B cost.
   - Relationship mirror: user / other person / interaction / hidden obstacle / resource / next step / trend.
   - Six-card no-spread: top three status, bottom three development.
   - Celtic cross: complex long-term diagnosis.
4. Draw cards if the user asks you to draw. If the user provides cards, preserve their cards and positions.
5. Retrieve card meanings from the available source:
   - Prefer the user's Obsidian tarot vault if available.
   - Otherwise use bundled or project card meanings.
   - If no card meaning source exists, use standard Rider-Waite meanings and state that fallback.
6. Interpret by mapping every card to the user's concrete situation.
7. Provide actionable advice and verification signals.

## Interpretation Rules

- Lead with a direct answer to the user's question.
- Explain the whole spread as a cause-and-effect chain.
- For each card, answer: what real-life situation this card likely represents, what it means for the user's question, and what observable signal would confirm or falsify it.
- Avoid vague phrases such as "energy is blocked" unless immediately translated into a real behavior.
- Do not flatten all possibilities. Give a main judgment, secondary possibility, and falsification signals.
- Do not claim certainty. Tarot is for reflection and decision support, not medical, legal, financial, or safety-critical advice.

## AI Prompt Template

When an LLM is available, send a prompt with:

- User question
- Background
- Spread name and position meanings
- Cards with orientation and positions
- Card meanings from Obsidian or bundled data
- Ethical constraints

Require output sections:

```markdown
## 直接结论
## 为什么这样判断
## 逐牌落到现实
## 你现在该怎么做
## 反证与复盘
```

## If No API Is Available

Generate a copyable prompt for the user to paste into ChatGPT, DeepSeek, Kimi, or another model. Include the same question, background, cards, and required output format.
