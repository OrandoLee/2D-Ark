# GRID DEFENSE: LAB-01 完整更新日志

本文记录 `GRID DEFENSE: LAB-01` 从首次上线到当前完成状态的全部主要更新过程。时间以仓库提交记录中的东八区时间为准。

当前状态：已完成  
线上地址：<https://orandolee.github.io/2D-Ark/>  
仓库地址：<https://github.com/OrandoLee/2D-Ark>

## 项目总览

`GRID DEFENSE: LAB-01` 是为个人网站 DELEE LAB 板块制作的原创二维格子塔防实验。项目使用 React、TypeScript、Vite 与纯 CSS 几何图形实现，核心循环基于 `requestAnimationFrame`，不依赖后端、数据库、外部图片素材或第三方游戏引擎。

截至当前完成状态，项目已经具备完整的开始界面、战斗流程、部署系统、方向选择、敌人波次、DP 经济、模块检查器、胜负结算、随机作战模块手牌、中文界面、GitHub Pages 自动部署，以及可视化关卡编辑器。

## 时间线

### 2026-06-04 19:43:25 +0800 - 首次上线基础版本

提交：`7906b9c` - `Build GRID DEFENSE LAB-01`

本次提交完成了项目从 0 到 1 的首次可运行版本，并建立了完整的前端工程骨架。

新增内容：

- 初始化 Vite、React、TypeScript、ESLint 工程配置。
- 新增 `package.json`、`package-lock.json`、`index.html`、TypeScript 配置与 Vite 配置。
- 新增 GitHub Pages 部署工作流 `.github/workflows/deploy-pages.yml`。
- 实现游戏主入口 `src/App.tsx`、`src/main.tsx` 与全局样式 `src/styles.css`。
- 实现核心游戏组件：
  - `Game.tsx`：游戏主容器。
  - `GameBoard.tsx`：战斗棋盘。
  - `GridCell.tsx`：单个格子渲染。
  - `TopBar.tsx`：顶部状态栏。
  - `StartScreen.tsx`：开始界面。
  - `ResultScreen.tsx`：胜负结算。
  - `DirectionPicker.tsx`：近战方向选择。
  - `UnitPanel.tsx`、`UnitCard.tsx`、`UnitInfoPanel.tsx`：作战模块选择和状态查看。
- 实现基础数据：
  - `src/data/map.ts`：12 列 x 8 行战术地图。
  - `src/data/units.ts`：作战模块定义。
  - `src/data/enemies.ts`：敌人定义。
  - `src/data/waves.ts`：敌人波次定义。
- 实现基础类型：
  - `src/types/game.ts`：游戏实体、状态、格子、波次等类型。
- 实现核心逻辑：
  - `src/hooks/useGameState.ts`：部署、战斗、波次、胜负、DP、模块生命等主要状态逻辑。
  - `src/hooks/useGameLoop.ts`：基于 `requestAnimationFrame` 的游戏循环。
  - `src/utils/combat.ts`、`src/utils/path.ts`、`src/utils/range.ts`：战斗、路径插值和范围判断工具。
- 新增 README，说明本地启动、规则、功能、结构和部署方式。

完成结果：

- 项目首次具备可游玩的格子塔防原型。
- 玩家可以部署模块、防守敌人波次、观察战斗结果并完成胜负结算。
- 项目具备上线 GitHub Pages 的基础工作流。

### 2026-06-04 19:45:12 +0800 - 补全 GitHub Pages 部署权限

提交：`ddde34a` - `Enable GitHub Pages deployment`

本次提交对 GitHub Pages 自动部署流程进行修补。

修补内容：

- 在 `.github/workflows/deploy-pages.yml` 中补充 GitHub Pages 部署所需配置。
- 使仓库推送到 `main` 后可以通过 GitHub Actions 构建并发布静态站点。

完成结果：

- 项目具备自动构建和自动发布到 GitHub Pages 的能力。

### 2026-06-04 19:59:22 +0800 - 中文界面和中文文档

提交：`8081f4c` - `Add Chinese game interface and documentation`

本次提交将游戏从英文体验推进为中文可读版本，并同步扩展文档。

新增和修改内容：

- 更新 README，补充中文项目介绍、启动方式、规则和功能说明。
- 修改页面标题与入口文字，使项目呈现为中文实验作品。
- 本地化主要游戏界面文案：
  - 开始界面。
  - 顶部状态栏。
  - 作战模块面板。
  - 模块信息面板。
  - 方向选择提示。
  - 胜负结算界面。
  - 棋盘格子提示与部署反馈。
- 将敌人、作战模块、战斗提示等核心命名调整为中文语境。

完成结果：

- 项目从可运行原型升级为中文玩家可直接理解的版本。
- README 成为后续开发和使用的主要说明文档。

### 2026-06-04 20:19:06 +0800 - 部署交互和战斗可读性增强

提交：`5fe20e3` - `Improve deployment controls and combat readability`

本次提交重点改善玩家部署作战模块时的可用性，以及战斗过程中的视觉辨识度。

新增内容：

- 新增 `src/components/UnitTypeIcon.tsx`，为近战、远程、医疗等模块类型提供更明确的图标表达。
- 扩展部署和拖拽交互样式，让合法部署区域、当前拖拽卡片和可部署状态更容易识别。
- 优化方向选择器的显示和交互面积。
- 增强战斗棋盘中格子、路径、单位、敌人和攻击反馈的视觉层级。

修补内容：

- 调整作战模块卡片和底部面板的信息密度。
- 优化敌人数据和战斗状态显示。
- 改善 README 中关于部署和战斗规则的说明。

完成结果：

- 玩家更容易判断模块类型、部署位置和战斗状态。
- 战斗画面从基础原型进一步接近完整游戏界面。

### 2026-06-04 20:36:58 +0800 - 方向选择时暂停模拟

提交：`b06d92b` - `Pause simulation during direction selection`

本次提交修补近战模块部署后的操作节奏问题。

修补内容：

- 当玩家部署近战模块并需要选择攻击方向时，游戏模拟自动暂停。
- 方向确认后再恢复游戏流程。
- 优化方向选择器文案与样式。
- README 同步补充方向选择期间暂停的规则说明。

完成结果：

- 玩家不会因为选择方向而错过敌人行动或受到时间压力。
- 近战部署流程更符合塔防游戏的战术操作习惯。

### 2026-06-05 00:50:01 +0800 - 战术网格高对比度优化

提交：`7d177a8` - `Improve tactical grid color contrast`

本次提交集中优化棋盘格子的视觉对比。

修改内容：

- 调整 `src/styles.css` 中地面、高台、路径、禁用格、入口和核心格子的颜色表现。
- 增强不同格子类型之间的识别差异。
- 更新 README 中已实现功能说明。

完成结果：

- 棋盘整体可读性提升。
- 玩家更容易区分可部署区域、敌人路径和关键目标。

### 2026-06-05 00:55:35 +0800 - 删除开始页副标题

提交：`306e152` - `Remove start screen subtitle`

本次提交对开始界面进行精简。

修改内容：

- 删除开始界面中的副标题文字。
- 移除对应的无用样式。

完成结果：

- 开始界面更简洁，视觉焦点更集中在项目标题和进入按钮上。

### 2026-06-05 18:12:03 +0800 - 战斗和部署反馈修补

提交：`a09931c` - `fix combat and deployment feedback`

本次提交修补战斗反馈和部署反馈中的表现问题。

修补内容：

- 优化 `GameBoard.tsx` 与 `GridCell.tsx` 中的格子状态呈现。
- 调整 `useGameState.ts` 中与部署、战斗反馈相关的状态处理。
- 扩展类型定义，让视觉状态和逻辑状态更稳定地对应。
- 增强样式中的部署提示、攻击提示、命中反馈和棋盘状态表现。

完成结果：

- 部署是否合法、战斗是否命中、格子当前状态等信息更直观。
- 战斗过程的即时反馈更加清楚。

### 2026-06-05 18:20:06 +0800 - 远程攻击和范围反馈增强

提交：`4f1be96` - `enhance ranged attack and range feedback`

本次提交继续强化战斗信息可读性，特别是远程模块的攻击范围。

新增和修改内容：

- 在棋盘上加强远程攻击范围的显示。
- 优化攻击目标选择和范围内目标反馈。
- 调整 `GameBoard.tsx`、`GridCell.tsx` 与 `useGameState.ts` 中的范围相关逻辑。
- 增加样式以区分攻击范围、可交互状态和目标反馈。

完成结果：

- 玩家可以更清楚地判断远程模块覆盖区域。
- 远程模块的战术价值和实际作用更容易被观察。

### 2026-06-05 18:49:34 +0800 - 随机作战模块手牌池

提交：`0ee6e2d` - `Add random operator hand pool`

本次提交把固定作战模块列表升级为随机手牌系统，使游戏更接近完整策略玩法。

新增内容：

- 新增 `src/data/operatorCatalog.ts`，建立更完整的作战模块目录。
- 新增 `src/utils/drawPool.ts`，负责随机抽取、槽位刷新和稀有度权重等逻辑。
- 扩展 `src/types/game.ts`，加入随机手牌、模块稀有度、职业分类等相关类型。
- 更新 `UnitCard.tsx`、`UnitPanel.tsx`、`UnitTypeIcon.tsx`，支持手牌槽位、稀有度和职业标识展示。

修改内容：

- 调整 `src/data/units.ts`，让作战模块定义适配新的目录和手牌结构。
- 更新 `useGameState.ts`，接入随机手牌池、刷新和部署消耗逻辑。
- 更新棋盘和样式，让随机模块选择与部署流程保持一致。

完成结果：

- 玩家不再只是从固定列表选择模块，而是通过随机手牌池进行部署决策。
- 项目策略变化和重玩价值显著增强。

### 2026-06-05 20:34:13 +0800 - 可视化关卡编辑器

提交：`bc02846` - `Add grid defense level editor`

本次提交是项目最大规模的功能扩展，新增完整的本地关卡编辑器，并将默认关卡改造成结构化关卡定义。

新增内容：

- 新增 `src/data/defaultLevel.ts`，把默认地图、路径、波次和规则统一为 `LevelDefinition`。
- 新增 `src/types/level.ts`，定义关卡编辑器和游戏本体共用的数据结构。
- 新增 `src/utils/levelRuntime.ts`，负责把关卡定义转换为游戏运行时数据。
- 新增关卡编辑器目录 `src/lab/grid-defense/editor/`，包含：
  - `LevelEditor.tsx`：编辑器主界面。
  - `EditorBoard.tsx`、`EditorCell.tsx`：可视化地图编辑。
  - `BrushPanel.tsx`：地面、高台、禁用、入口、核心、路径等画笔。
  - `PathEditorPanel.tsx`：路径创建和编辑。
  - `WaveEditorPanel.tsx`、`EnemySpawnRow.tsx`：敌人波次编辑。
  - `LevelSettingsPanel.tsx`：关卡基础参数设置。
  - `LevelValidationPanel.tsx`：实时合法性检查。
  - `SavedLevelsPanel.tsx`：本地关卡保存、读取、复制和删除。
  - `LevelImportExportPanel.tsx`：JSON 导入导出。
  - `levelSchema.ts`：关卡结构默认值和转换。
  - `levelStorage.ts`：localStorage 存储。
  - `levelValidation.ts`：地图、路径、波次等合法性校验。
  - `levelExport.ts`：导出格式处理。
  - `editorTypes.ts`：编辑器内部类型。

修改内容：

- `App.tsx` 增加游戏模式和编辑器模式切换。
- `StartScreen.tsx` 增加进入关卡编辑器的入口。
- `Game.tsx` 支持传入自定义关卡并从编辑器试玩。
- `GameBoard.tsx`、`useGameState.ts`、`map.ts`、`waves.ts` 改为兼容结构化关卡数据。
- `ResultScreen.tsx`、`TopBar.tsx`、`UnitPanel.tsx` 等组件适配编辑器试玩和关卡数据。
- `vite.config.ts` 增加 GitHub Pages 与路由相关配置。
- README 大幅扩展，补充关卡编辑器使用流程、数据结构和新增地图/单位/敌人的说明。

完成结果：

- 项目从单关卡游戏升级为可本地制作、保存、导入、导出和试玩关卡的完整实验工具。
- 关卡数据结构正式化，后续可以继续扩展更多地图和玩法。

### 2026-06-06 01:11:57 +0800 - 修复 GitHub Pages 资源路径

提交：`fd28dae` - `Fix GitHub Pages asset base`

本次提交修补 GitHub Pages 子路径部署时的资源加载问题。

修补内容：

- 调整 `vite.config.ts` 中的 base 配置。
- 兼容仓库页面路径 `/2D-Ark/`，避免构建产物在 GitHub Pages 上找不到 JS、CSS 等静态资源。

完成结果：

- 线上站点在 GitHub Pages 仓库子路径下可以正确加载资源。

### 2026-06-06 01:26:30 +0800 - 编辑器和游戏界面完整中文化

提交：`c4a5dd3` - `Localize interface to Chinese`

本次提交继续完成中文化收尾，覆盖关卡编辑器和剩余游戏界面。

修改内容：

- 更新 README，使文档和当前功能保持一致。
- 将游戏流程中的按钮、提示、状态和结算文案进一步中文化。
- 将关卡编辑器中的工具栏、画笔面板、路径面板、波次面板、保存面板、导入导出面板、设置面板、校验面板等全部调整为中文。
- 将默认关卡名称、描述、校验提示和编辑器类型文案统一为中文。

完成结果：

- 游戏本体和关卡编辑器均达到完整中文使用体验。
- 项目可以作为中文网页游戏实验直接发布和展示。

### 2026-06-06 12:08:21 +0800 - 游戏入口动效和实验室视觉

提交：`f4f3007` - `Add animated game entry transitions`

本次提交为项目增加进入游戏时的过渡动效和实验室风格标识。

新增内容：

- 新增 `src/assets/lab.svg` 作为实验室视觉资产。
- 更新 `App.tsx`，加入入口状态、转场流程和动画控制。
- 更新 `Game.tsx`，配合入口转场与游戏开始流程。
- 在 `src/styles.css` 中新增入口动画、视觉层级、Logo 展示和转场样式。

完成结果：

- 玩家从开始界面进入游戏时获得更完整的仪式感和视觉反馈。
- 项目呈现更接近完整作品，而不只是功能原型。

### 2026-06-06 12:11:04 +0800 - 放大入口 Logo

提交：`741654a` - `Enlarge intro logo`

本次提交对最终入口视觉做小幅调整。

修改内容：

- 调整 `src/styles.css` 中入口 Logo 的尺寸。
- 让实验室标识在开场动效中更加醒目。

完成结果：

- 开场视觉完成最后一轮微调。
- 当前版本进入完成状态。

## 当前完成内容汇总

游戏本体：

- 12 列 x 8 行战术地图。
- 地面、高台、路径、禁用格、入口、核心等多种格子类型。
- 五波敌人进攻流程。
- 多类型作战模块部署。
- 近战、远程、医疗职业区分。
- 近战阻挡和方向选择。
- 远程范围攻击。
- 医疗模块治疗友方单位。
- 敌人攻击、防线生命、模块死亡、核心扣血和胜负结算。
- DP 自动恢复、击杀奖励、部署消耗和撤回返还。
- 暂停、继续、1 倍/2 倍速度、重新开始。
- 随机作战模块手牌池与槽位刷新。

编辑器：

- 可视化地图编辑。
- 地形、入口、核心和路径画笔。
- 多路径关卡数据。
- 波次和敌人组编辑。
- 关卡基础参数设置。
- 实时合法性检查。
- localStorage 本地保存和读取。
- JSON 导入和导出。
- 从编辑器直接试玩当前关卡。

工程与发布：

- React 19 + TypeScript + Vite 工程。
- ESLint 代码检查。
- GitHub Pages 自动部署。
- GitHub Pages 子路径资源修复。
- 完整中文 README。
- 完整中文游戏界面和编辑器界面。

## 完成结论

从 2026-06-04 19:43:25 首次提交开始，项目经历了基础游戏上线、GitHub Pages 部署、中文化、战斗可读性优化、操作节奏修补、视觉对比优化、随机手牌系统、完整关卡编辑器、线上资源路径修复和最终入口动效等阶段。

截至 2026-06-12，本项目已经完成当前规划内的主要更新，具备可在线访问、可游玩、可编辑关卡、可本地扩展和可继续维护的完整状态。
