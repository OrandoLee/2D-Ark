# GRID DEFENSE: LAB-01

一个为个人网站 DELEE LAB 板块开发的原创二维格子塔防实验。项目使用 React、TypeScript、Vite、CSS 几何图形与 `requestAnimationFrame` 游戏循环实现，不依赖后端、数据库、外部图片素材或第三方游戏引擎。

在线体验：<https://orandolee.github.io/2D-Ark/>

## 本地启动

```bash
npm install
npm run dev
```

打开 Vite 在终端中显示的本地地址即可进入游戏。

生产构建与代码检查：

```bash
npm run build
npm run lint
```

## 游戏规则

- 保护核心，抵御全部五波敌人。
- 将底部作战模块卡片拖到高亮的合法格子完成部署；触屏设备也可使用点击部署。
- 近战模块落到格子后，游戏进程会自动暂停；移动鼠标选择攻击方向，再单击确认朝向。
- 开局提供四秒战术准备时间，敌人移动速度经过放缓，便于观察路线并安排部署。
- 远程模块攻击范围内路径进度最高、最接近核心的敌人。
- 医疗模块优先治疗范围内生命比例最低的友方模块。
- DP 每秒自动增加，击杀敌人也会获得 DP；部署模块会消耗 DP。
- 点击已部署模块可查看实时状态，撤回模块会返还 50% 部署费用。
- 敌人抵达核心会扣除生命；生命归零则行动失败。
- 游戏支持暂停、继续、1 倍与 2 倍速度切换，以及随时重新开始。

## 已实现功能

- 12 列 × 8 行配置化战术地图与固定路径平滑移动。
- 五种原创作战模块、四种原创敌人、五波配置化敌人。
- 物理与脉冲伤害计算、攻击冷却、治疗与攻击特效。
- 近战阻挡、敌人攻击模块、模块死亡后解除阻挡。
- DP 自动恢复、击杀奖励、部署上限、撤回返还。
- 开始界面、行动界面、方向选择、模块检查器、胜负结算。
- 中文游戏界面、移动端基础适配和 GitHub Pages 自动部署。
- 近战、远程、医疗三类高辨识度职业图标、类型色与拖拽部署视觉反馈。
- 地面、高台、敌人路径、禁用格、入口与核心使用高对比配色和独立纹理。

## 项目结构

- `src/data/defaultLevel.ts`：默认 `LevelDefinition`，包含地图、路径、波次与关卡规则。
- `src/types/level.ts`：关卡编辑器与游戏本体共用的关卡数据结构。
- `src/lab/grid-defense/editor/`：可视化关卡编辑器、校验、导入导出与 localStorage 存储。
- `src/data/map.ts`：从默认关卡派生的兼容地图出口。
- `src/data/units.ts`：可部署作战模块定义。
- `src/data/enemies.ts`：敌人属性定义。
- `src/data/waves.ts`：从默认关卡派生的兼容波次出口。
- `src/hooks/useGameState.ts`：游戏状态、战斗规则与波次流程。
- `src/hooks/useGameLoop.ts`：基于 `requestAnimationFrame` 的游戏循环。
- `src/components/`：独立的游戏界面与棋盘组件。
- `src/utils/`：伤害、路径插值与范围计算工具。

## Level Editor

关卡编辑器入口：

- 本地开发或支持 history fallback 的部署环境：`/lab/grid-defense/editor`。
- 游戏开始页也提供 `Level Editor` 按钮，可在游戏模式和编辑器模式之间切换。

编辑器提供完整的本地关卡生产流程：

1. 点击 `New Level` 创建默认 12 列 × 8 行关卡。
2. 使用 `Blue`、`Yellow`、`Red`、`Spawn`、`Base` 画笔点击或拖拽格子，编辑地图。
3. 点击 `Add Path`，选择 `Path` 画笔，从 `spawn` 开始，沿相邻 blue 格绘制，最后点到 `base`。
4. 在 `Level Settings` 中设置名称、描述、难度、初始 Life、初始 DP、DP 回复、部署上限、手牌数量、槽位刷新时间和稀有度权重。
5. 在 `Wave Editor` 中添加 wave 和 enemy group，配置 `enemyType`、`delay`、`count`、`interval`、`pathId`。
6. `Validation` 面板实时显示 errors 和 warnings；errors 会阻止 `Playtest`。
7. 点击 `Playtest` 可直接用当前编辑关卡进入游戏，顶部 `Back to Editor` 会返回并保留编辑内容。
8. `Export JSON` 会生成完整格式化 `LevelDefinition` JSON；`Import JSON` 可粘贴 JSON 重新载入。
9. `Save` 和 `Save As New` 使用 `localStorage` 的 `grid-defense-custom-levels` key 保存；刷新页面后可在 `Saved Levels` 中读取、复制或删除。

`LevelDefinition` 主要字段：

- `id`、`name`、`description`、`version`、`author`、`createdAt`、`updatedAt`
- `difficulty`：`easy | normal | hard | extreme`
- `rows`、`cols`、`initialLife`、`initialDp`、`dpRegenPerSecond`、`deployLimit`
- `grid`：二维 `LevelCell[][]`，每格包含 `type`、`isPath`、`pathIds`
- `paths`：多路径数组，每条路径有 `spawnCell`、`baseCell`、`points`
- `waves`：波次数组，每个 enemy group 包含 `enemyType`、`delay`、`count`、`interval`、`pathId`
- `handConfig`：初始手牌、刷新时间、稀有度权重、可选职业限制和禁用单位
- `tags`：关卡标签

最小 JSON 形态可参考：

```json
{
  "id": "sample-level",
  "name": "Sample Operation",
  "description": "Minimal custom level.",
  "version": 1,
  "author": "DELEE LAB",
  "createdAt": "2026-06-05T00:00:00.000Z",
  "updatedAt": "2026-06-05T00:00:00.000Z",
  "difficulty": "normal",
  "rows": 8,
  "cols": 12,
  "initialLife": 10,
  "initialDp": 20,
  "dpRegenPerSecond": 1,
  "deployLimit": 6,
  "grid": "Use the editor export for the full 8 x 12 LevelCell matrix.",
  "paths": [
    {
      "id": "main",
      "name": "Main path",
      "spawnCell": { "row": 3, "col": 0 },
      "baseCell": { "row": 3, "col": 11 },
      "points": [
        { "row": 3, "col": 0 },
        { "row": 3, "col": 1 },
        { "row": 3, "col": 2 },
        { "row": 3, "col": 11 }
      ]
    }
  ],
  "waves": [
    {
      "id": "wave-1",
      "name": "Wave 01",
      "delayAfterPreviousWave": 0,
      "enemies": [
        {
          "id": "runner-group",
          "enemyType": "runner",
          "delay": 0,
          "count": 1,
          "interval": 1000,
          "pathId": "main"
        }
      ]
    }
  ],
  "handConfig": {
    "initialHandSize": 5,
    "slotRefreshMs": 1200,
    "rarityWeights": {
      "common": 48,
      "uncommon": 28,
      "rare": 16,
      "epic": 7,
      "prototype": 1
    }
  },
  "tags": ["custom"]
}
```

要把 JSON 作为正式关卡加入游戏，可以把编辑器导出的 JSON 转成 `LevelDefinition` 常量，放入 `src/data/`，再将其作为 `GridDefenseGame` 的 `level` prop 传入；默认游戏继续读取 `src/data/defaultLevel.ts`。

## 新增地图

现在推荐先用 Level Editor 制作并导出 JSON，再转换为 `LevelDefinition`。地图需要提供：

1. 地图行列尺寸。
2. 一个 `LevelCell[][]` 格子矩阵。
3. 至少一个从敌人入口到核心的有序路径。
4. 每个格子的类型、是否为路径，以及可部署模块类型。

路径中的每个坐标都必须对应可通行格子。

## 新增作战模块

1. 在 `src/types/game.ts` 的 `UnitId` 中加入新 ID。
2. 在 `src/data/units.ts` 中加入对应的 `UnitDefinition`。
3. 在 `src/styles.css` 中加入模块的 CSS 几何图形样式。
4. 只有在模块引入全新行为时，才需要扩展 `src/hooks/useGameState.ts`。

## 新增敌人

1. 在 `src/types/game.ts` 的 `EnemyId` 中加入新 ID。
2. 在 `src/data/enemies.ts` 中加入对应的 `EnemyDefinition`。
3. 在 `src/components/GameBoard.tsx` 的敌人生命映射中加入最大生命。
4. 在 `src/styles.css` 中加入敌人的 CSS 几何图形样式。

## 新增或修改波次

编辑 `src/data/waves.ts` 中的配置数组。每个生成项包含：

- `enemyId`：敌人类型 ID。
- `delay`：相对于当前波次开始时间的生成延迟，单位为秒。

当前波次全部敌人生成完毕且场上敌人清空后，等待三秒进入下一波。

## 嵌入个人网站 LAB 页面

主游戏组件以 `GridDefenseGame` 导出：

```tsx
import { GridDefenseGame } from './components/Game'

export function LabExperiment() {
  return <GridDefenseGame />
}
```

组件不会强制全屏，也不依赖浏览器全局尺寸。样式使用游戏专属类名；嵌入主站时，建议仅在对应 LAB 路由加载 `src/styles.css`，进一步减少与主站样式互相影响。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 分支后，GitHub Actions 会自动安装依赖、执行生产构建并发布到 GitHub Pages。
