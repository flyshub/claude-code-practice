---
title: MCP 是什么？让你的 Claude 真的能「动手」
description: 用 filesystem MCP 一个实操，亲眼看见 Claude 从「只能聊天」变成「能读你电脑里的文件」——这就是 MCP 的能力跃升时刻。
pubDate: 2026-06-29
---

> 本文是 [Skill 是什么](/claude-code-practice/blog/claude-code-skill/) 的下一篇。上一篇你学会了让 Claude「知道该怎么想」，这一篇让它「能动手去够」。

## 上一篇的比方，还记得吗

我们说过：你派小王去办事。

- **Skill** 是你**嘴上交代**的规矩——「咱公司说『订单』都含税」。这是知识。
- **MCP** 是你**手里塞过去**的工具——一把钥匙、一张门禁卡、一辆车。这是能力。

Skill 让 Claude 知道**该怎么想**。但光有规矩不够——小王要去办事，得有车开、有钥匙开门。

**MCP 就是那把钥匙。** 它让 Claude 能动手去够——够你的文件、够数据库、够网页、够一切外部世界。

## MCP 到底是什么

MCP 全称 **Model Context Protocol**（模型上下文协议）。名字吓人，本质很简单：

> **它是一个标准接口，让 Claude 能安全地调用外部工具和数据。**

「外部」是什么意思？Claude 默认活在对话里——它只能看到你发给它的文字。你电脑里的文件、你的数据库、网上的网页，它都够不着。MCP 给它接上一根管子，让它能去到那些地方。

举个具体的：**filesystem MCP**——一个让 Claude 能读写你电脑文件的小服务。装上它，Claude 突然就能读你 D 盘里的 txt 了。

说个我自己的真实时刻：我平时手上有一堆需求说明书、方案文档（都是 docx），想让 Claude 帮我理一理、对一对。可每次都得我先打开文档、复制、粘贴进对话框——**它永远只看得见我「喂」给它的那一段**。不止一次我想：要是它能直接读我电脑里那些文档就好了。

MCP 干的就是这件事。

## MCP vs Skill vs Agent（接力上一篇）

上一篇的表，加上 MCP 的实操视角再看一遍：

| | 给 Claude 的东西 | 例子 |
|---|---|---|
| **Skill** | 知识 / 纪律 | 「这个项目的术语」「审查代码的清单」 |
| **MCP** | 工具 / 能力 | 「能读文件」「能查数据库」「能上网」 |
| **Agent** | 一个分身 | 另开一个 Claude 去独立干活 |

关键区别：**Skill 改变 Claude「怎么想」，MCP 改变 Claude「能干什么」**。一个管脑，一个管手。

说真的，在装第一个 MCP 之前，我一直以为 Claude 只能在对话框里自言自语——我问什么，它只能基于我打出来的字回答，够不着我电脑里的任何东西。装完那一刻才反应过来：它不是「不想」够，是以前**没人给它钥匙**。

## 光说不练假把式——装一个

理论到此为止。**MCP 的爽点不在「你写它」，在「你装上 → Claude 突然能干新事」**。我们装 filesystem MCP，5 分钟，亲眼看那个时刻。

> ⚠️ **安全提醒**：MCP 会让 Claude 接触你的真实文件。本文演示用**专门的演示目录 + 假数据**（比如假密码 `1234`）。**千万别给它开放含真实敏感信息的目录**——这就跟把家里钥匙配一把给陌生人一样，要限定范围。

### 第 1 步：建一个专门的演示目录

不要用你已有的目录。新建一个干净的，专门给这次演示用：

```bash
# 在你方便的地方建一个演示目录（路径你自己定）
mkdir ~/mcp-demo
```

### 第 2 步：在里面放一个「Claude 不可能知道」的文件

```bash
# 写一个秘密文件（内容随便，但别用真敏感信息）
echo "我的秘密密码是 1234，只有写进这个文件的人才知道。" > ~/mcp-demo/secret.txt
```

记住这句内容——**这是验证 Claude「真的读到了」的关键**。

### 第 3 步：把 filesystem MCP 配进 Claude Code

在 Claude Code 里敲这一条命令（把路径换成你第 1 步建的目录）：

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem ~/mcp-demo
```

拆开看这条命令在干什么：
- `claude mcp add filesystem` —— 注册一个名叫 `filesystem` 的 MCP
- `-- npx -y @modelcontextprotocol/server-filesystem` —— 用 npx 启动官方 filesystem 服务
- `~/mcp-demo` —— **只允许访问这个目录**（这是安全边界，MCP 不会越界）

> 💡 这个「只允许访问指定目录」就是 MCP 的安全核心——它有个叫 `validatePath` 的机制，所有访问都会先检查「这个路径在不在允许范围内」，越界直接拒绝。你不是把整个电脑交给 Claude，是只开了一个房间。

#### ⚠️ Windows 用户注意：我踩过的坑，你别再踩

上面那条 `claude mcp add` 命令，在 Mac/Linux 上能直接跑。但我在 **Windows + Git Bash** 上配的时候，**连踩五个坑**。逐个列给你，附解法——遇到任何一个都能查到怎么办。

| # | 你会撞上的现象 | 根因 | 解法 |
|---|--------------|------|------|
| 1 | 命令敲完，`claude mcp list` 里**没有** filesystem | 路径写成了 `/mcp-demo`（不存在，且 Unix 风格） | 用真实存在的 Windows 路径，如 `D:/mcp-demo` |
| 2 | 注册成功，但 `claude mcp get filesystem` 显示命令是 `cmd C:/ npx ... D:mcp-demo`（**反斜杠和 `/c` 都被吃掉了**） | Git Bash 把 `/c` 当 Unix 路径转换、把 `\` 当转义符吞掉 | 命令前加 `MSYS_NO_PATHCONV=1`，路径用正斜杠 `D:/...` |
| 3 | 在 A 目录配好了，换到 B 目录重启后**MCP 消失了** | 默认是 **local 作用域**，只绑当前项目 | 加 `-s user` 改成 user 作用域，全项目可用 |
| 4 | 让 Claude 读文件，它报 `Access denied - path outside allowed directories` | 你给的路径不在当初 `add` 时授权的目录里 | 确认路径和 `add` 时的一致；要改范围见下一节 |
| 5 | npx 启动 server 失败 / 找不到命令 | Windows 上有时需要 `cmd /c` 前缀包一层 | 命令写成 `cmd /c npx -y ...` |

**最终能直接跑通的命令**（Windows + Git Bash，把上面五个坑全绕过去了）：

```bash
MSYS_NO_PATHCONV=1 claude mcp add filesystem -s user -- cmd /c npx -y @modelcontextprotocol/server-filesystem "D:/mcp-demo"
```

拆开看这五个修复分别藏在哪：
- `MSYS_NO_PATHCONV=1` —— 禁用 Git Bash 的路径转换（坑 2）
- `-s user` —— 改成 user 作用域，换目录不丢（坑 3）
- `cmd /c npx` —— Windows 用 cmd 包一层（坑 5）
- `"D:/mcp-demo"` —— 真实存在的 Windows 路径，用正斜杠（坑 1、2）
- 给错路径会被 `Access denied` 拦下——那是 MCP 的安全边界在工作（坑 4，其实是好事）

> 💡 **如果你不用 Git Bash，而是用 PowerShell 或 cmd**：不需要 `MSYS_NO_PATHCONV=1`（那是 Git Bash 专属），`cmd /c` 也不需要。直接 `claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem "D:\mcp-demo"` 就行。反斜杠在 PowerShell/cmd 里是安全的。

### 第 4 步：重启 Claude Code，让配置生效

MCP 配置加载在启动时。**退出当前 Claude Code，重新打开**，新的 MCP 才会被加载。

重启后，Claude Code 应该提示 MCP 服务已连接（或用 `/mcp` 命令查看已连接的 MCP 列表，能看到 `filesystem`）。

## 🎉 见证时刻

现在，问 Claude 这一句：

> 「读一下 `~/mcp-demo/secret.txt` 里有什么，告诉我。」

**装 MCP 之前**，Claude 会说：「我访问不了你的文件系统」。
**装 MCP 之后**，Claude 会读出来：「里面写着：我的秘密密码是 1234……」

**就是这个时刻。** 你亲眼看到 Claude 从「只能聊天」变成了「能读你电脑里的文件」。这不是魔术，是 MCP 给它接了一根管子——那把「文件柜钥匙」。

说回我自己的体验：我第一次给错路径，撞到 `Access denied`——那一刻**反而安心了**，因为它让我看到这道边界是真的在工作，不是摆设。等我改对路径，看到它一字不差读出「1234」时，我没觉得多神奇，就是确认了一件事：**它是真的可以的。**

能拦住越界 + 能读出内容——**能干，又可控**。这才是用得放心的工具。

## 后续：怎么改它能读的范围

装上跑通只是第一天。**第二天你就会想：能不能让它多看几个目录？能不能限定到项目目录？** 这是教程最容易漏的「第二天问题」。补上。

**关键认知**：filesystem MCP 允许访问的目录，就是当初 `claude mcp add` 命令**最后那串路径参数**。它不是某个独立配置，就是命令行参数。所以「改范围」的本质是——**改那串参数**。

而 `claude mcp` 命令**没有 `update` / `edit`**（官方文档列出的只有 `list` / `get` / `remove`）。所以改范围的标准做法是 **删掉再重加**：

```bash
# 1. 删掉现有的
claude mcp remove filesystem

# 2. 用新的目录列表重新添加（可以一次给多个目录）
claude mcp add filesystem -- cmd /c npx -y @modelcontextprotocol/server-filesystem D:/项目A D:/项目B
```

> 💡 **想一次给多个目录？** 把多个路径用空格隔开，全跟在命令后面就行——每个都是一把「钥匙」，能开一个房间。

不想敲命令？直接**编辑配置文件**也行：
- **user 作用域**（全项目可用）→ `~/.claude.json`
- **project 作用域**（随仓库分享）→ 项目根目录的 `.mcp.json`

找到 `filesystem` 那条，把 `args` 里的路径改掉，保存，重启 Claude Code 即可。

## 彩蛋：它还能反过来写

读只是开始。试试这句：

> 「把 `secret.txt` 的内容改成全大写，另存为 `upper.txt`」

Claude 会**创建一个新文件** `upper.txt`，内容是大写的。它能读，也能写——双向的。这把钥匙能开门，也能锁门。

装完 filesystem，我脑子里立刻冒出一串「那能不能……」：能不能让它直接读我的需求 docx、能不能连上数据库查数据、能不能调我那个内部系统的接口。filesystem 只是起点——**MCP 这根管子能接的东西，远不止文件**。

## 收尾

你刚做的事：装了一个 MCP，让 Claude 多了一项「读文件」的能力。这就是 MCP 的全部精髓——**给 Claude 接外部工具，让它能动手去够**。

回头看那个比方：Skill 是你交代的规矩，MCP 是你给的钥匙。**规矩让它干得对，钥匙让它干得了**。两个一起，Claude 才真的像派出去办事的人。

## 下一步

**现在就去动手**——给你的项目配一个 filesystem MCP，限定到项目目录，让 Claude 能直接读你的代码和文档。用上面那条 Windows 命令，5 分钟搞定。配完你会立刻理解「能干又可控」是什么手感。

**下一篇**——MCP 让 Claude「能动手」了，但有些事你想让它**每次都自动做**：比如提交代码前自动检查、改完自动跑测试、写完自动加注释。光靠你每次口头提醒太累——这时候需要 **Hooks**：在 Claude 执行前后自动跑脚本，把「纪律」变成自动的。下一篇讲它。
