# 赛博塔罗师

一个连接 Obsidian 塔罗知识体系的抽牌网页，也可以部署成公网版，并附带 Codex skill。

## 本地启动

```powershell
cd "C:\Users\ZMK\Documents\塔罗"
npm start
```

打开：

```text
http://localhost:5177
```

默认读取：

```text
D:\ObsidianVault\塔罗
```

## 使用 DeepSeek

```powershell
$env:DEEPSEEK_API_KEY="你的 DeepSeek API Key"
$env:DEEPSEEK_MODEL="deepseek-v4-pro"
npm start
```

如果端口被占用：

```powershell
$env:PORT="5178"
npm start
```

## 公网部署

公网部署不能读取你本机的 Obsidian 路径，所以先导出一份只读知识库：

```powershell
npm run export:knowledge
```

这会生成：

```text
data/tarot-knowledge.json
```

然后把项目上传 GitHub，在 Render / Railway / 云服务器部署。部署环境变量至少设置：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-pro
```

项目已包含 `render.yaml`，Render 可直接识别。

### 上传 GitHub

第一次上传：

```powershell
git init
git add .
git commit -m "Initial cyber tarot reader"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

以后更新：

```powershell
npm run export:knowledge
git add .
git commit -m "Update tarot knowledge and skill"
git push
```

### Render 部署

1. 在 GitHub 新建仓库，并把本项目推上去。
2. 打开 Render，选择 `New Web Service`。
3. 连接 GitHub 仓库。
4. Render 会读取 `render.yaml`，启动命令是 `npm start`。
5. 在 Render 的环境变量里填写：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-pro
```

部署完成后，你会得到一个公网网址。别人打开这个网址就能抽牌和获得 AI 深度解读。

## Codex Skill

Skill 位于：

```text
skills/cyber-tarot-reader
```

别人可以从 GitHub 安装这个 skill，让 Codex 按同一套塔罗流程读取牌义、抽牌、调用 DeepSeek 或生成可复制的解读提示词。

### Skill 发布方式

这个仓库里保留了完整 skill：

```text
skills/cyber-tarot-reader/SKILL.md
skills/cyber-tarot-reader/agents/openai.yaml
```

上传 GitHub 后，别人可以把 `skills/cyber-tarot-reader` 这个文件夹复制到自己的 Codex skills 目录，或从 GitHub 仓库安装。这个 skill 的作用不是替代网页，而是让 Codex 在对话里也能按同样的“问题 + 背景 + 牌阵 + 牌义 + 现实落点”流程做塔罗解读。

## 安全提示

- 不要把 `.env` 或 API Key 提交到 GitHub。
- 公网部署时务必把 `DEEPSEEK_API_KEY` 放在平台环境变量里。
- 公开给别人用前建议增加限流，否则 API 额度可能被刷。
- 塔罗解读仅用于自我探索，不替代医疗、法律、投资等专业建议。
