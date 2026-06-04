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

- `src/data/map.ts`：12 × 8 地图格子配置与固定敌人路径。
- `src/data/units.ts`：可部署作战模块定义。
- `src/data/enemies.ts`：敌人属性定义。
- `src/data/waves.ts`：全部波次与生成时间配置。
- `src/hooks/useGameState.ts`：游戏状态、战斗规则与波次流程。
- `src/hooks/useGameLoop.ts`：基于 `requestAnimationFrame` 的游戏循环。
- `src/components/`：独立的游戏界面与棋盘组件。
- `src/utils/`：伤害、路径插值与范围计算工具。

## 新增地图

参考 `src/data/map.ts` 创建新的地图配置。地图需要提供：

1. 地图行列尺寸。
2. 一个 `GridCellData[]` 格子数组。
3. 一个从敌人入口到核心的有序 `Point[]` 路径。
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
