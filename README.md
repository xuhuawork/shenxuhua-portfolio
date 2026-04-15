# 沈序桦 · SHENXUHUA Director Portfolio

[![Director](https://img.shields.io/badge/Director-SHENXUHUA-black)](https://github.com/xuhuawork/shenxuhua-portfolio)
[![License](https://img.shields.io/badge/License-Copyright-red)]()

> 独立广告导演沈序桦的电影感作品集网站。从 PPT 完美转化为可交互 HTML，含 GIF 动画、ThreeJS 粒子效果、平滑滚动、PDF 导出。

## ✨ 在线预览

- **GitHub Pages**：访问 `https://xuhuawork.github.io/shenxuhua-portfolio/`（仓库 Pages 启用后）
- **本地预览**：见下方"快速开始"

## 🎬 功能特性

- **44 页完整内容** — 100% 还原原版 PPT，含所有 GIF 动画
- **电影级视觉** — Lenis 平滑滚动 + ThreeJS 粒子效果 + 帧呼吸动画
- **多种导航方式** — 鼠标滚轮 / 方向键 / 触摸滑动 / 右侧导航点 / Overview 总览
- **PDF 导出** — 一键导出可分享的 PDF 版本
- **响应式** — 手机/平板/桌面自适应
- **键盘友好** — 完整快捷键支持

## ⌨️ 键盘快捷键

| 键位 | 功能 |
|------|------|
| `↑` `↓` `←` `→` `Space` | 上一页 / 下一页 |
| `Home` / `End` | 跳到首页 / 末页 |
| `O` | 打开 / 关闭作品总览 |
| `F` | 全屏演示模式 |
| `P` | 导出 PDF |
| `Esc` | 退出全屏 / 关闭遮罩 |
| 双击幻灯片 | 放大查看 |

## 🚀 快速开始

```bash
# 克隆
git clone https://github.com/xuhuawork/shenxuhua-portfolio.git
cd shenxuhua-portfolio

# 起本地服务（Python）
python3 -m http.server 8765
# 访问 http://localhost:8765

# 或用 Node
npx serve .
```

## 📂 项目结构

```
shenxuhua-portfolio/
├── index.html              # 主页面
├── style.css               # 样式表
├── main_v12.js             # 主交互逻辑
├── particles.js            # ThreeJS 粒子效果
├── works.json              # 作品数据源
├── build_slides.py         # 从 PPT 重建幻灯片
├── update_html.py          # 自动更新 HTML
├── capture_thumbs.py       # 生成缩略图
└── assets/
    ├── full_slides/        # 主幻灯片图（46 张）
    ├── slides/             # 部分页面背景图
    └── gifs/               # 动画 GIF
```

## 📝 内容更新

### 替换图片
直接替换 `assets/full_slides/slides_export.0XX.jpeg` 即可。

### 修改文案
编辑 `index.html` 中对应的 section（profile / works list 等）。

### 重新构建（从新 PPT）
```bash
# 需要 LibreOffice 和 Poppler
brew install --cask libreoffice
brew install poppler

# 转换 PPT → 单独图片
soffice --headless --convert-to pdf "新PPT.pptx"
pdftoppm -jpeg -r 200 "新PPT.pdf" assets/full_slides/slides_export

# 然后用脚本批量更新
python3 build_slides.py
python3 update_html.py
```

## 🌐 浏览器兼容

| Chrome / Edge | Safari | Firefox | iOS / Android |
|:-:|:-:|:-:|:-:|
| 90+ | 15+ | 88+ | ✅ |

## 🛠️ 技术栈

- **HTML5 + CSS3** — 原生实现，零构建
- **Vanilla JavaScript** — 无框架依赖
- **[Lenis](https://github.com/darkroomengineering/lenis)** — 平滑滚动
- **[ThreeJS](https://threejs.org/)** — 粒子效果
- **[Lucide](https://lucide.dev/)** — 图标库

## 📄 License

Copyright © 2025 SHENXUHUA. All rights reserved.

本作品集中所有图片、视频、设计版权归沈序桦所有，未经许可不得转载或商用。

---

**联系方式** · WELCOME FOR COOPERATION

🎬 SHEN XUHUA · DIRECTOR
