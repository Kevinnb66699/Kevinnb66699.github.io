# 个人作品集网站

一个纯静态的个人站，用来展示自己做过的项目（机器人、计算机视觉、AI、游戏、Web 等）。

- 不需要安装任何东西，没有构建步骤，直接放到 GitHub Pages 就能访问
- 主页不加载任何外部资源（没有 CDN、外部字体、统计代码），离线也能打开，国内访问不会被卡住；「在线体验」里的手势画布 demo 例外，需要联网从 jsDelivr 加载 Three.js 和 MediaPipe 运行库（手部模型是 Google MediaPipe 的官方模型，Apache-2.0 许可）
- 自动适配手机和深色模式
- **平时只需要改 `projects.js` 一个文件**

## 文件结构

```
index.html          页面骨架（一般不用改）
style.css           样式和配色
projects.js         ← 你的个人信息和项目列表，只改这个
main.js             把 projects.js 里的数据渲染成页面（一般不用改）
assets/             头像等图片
assets/projects/    项目封面图、演示视频
.nojekyll           告诉 GitHub Pages 原样发布文件，不要删
```

## 本地预览

在项目文件夹里运行：

```bash
python3 -m http.server 8000
```

然后用浏览器打开 <http://localhost:8000>。改完文件后刷新页面即可看到效果，按 `Ctrl + C` 停止。

也可以直接双击 `index.html` 打开——网站不读取任何网络数据，所以本地双击同样能正常显示。

## 修改内容

### 个人信息

打开 `projects.js`，修改最上面的 `PROFILE`：

| 字段 | 说明 |
| --- | --- |
| `name` | 名字，显示在顶部、页脚和浏览器标签页 |
| `tagline` | 一句话介绍 |
| `bio` | 两三句自我介绍 |
| `avatar` | 头像路径，例如 `"assets/avatar.jpg"`（建议正方形）；不需要就写 `""` |
| `links` | 联系方式，例如 `{ label: "GitHub", url: "https://github.com/xxx" }`、`{ label: "邮箱", url: "mailto:xxx@example.com" }` |

### 添加一个项目

在 `PROJECTS` 列表里复制一个 `{ ... },`（连同末尾逗号）粘贴进去，再改内容。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一标识，只用小写英文、数字和短横线，如 `"line-follower"`。项目详情的独立链接是 `你的网址/#line-follower` |
| `title` | 是 | 项目名称 |
| `summary` | 是 | 一句话简介，显示在卡片上（建议 40 字以内） |
| `description` | 是 | 详细介绍，点开卡片后显示；`\n` 换行，`\n\n` 分段 |
| `year` | 是 | 年份，如 `2025`；跨多年可写 `"2021–2026"`，按最近一年排序 |
| `categories` | 是 | 类别，可多选：`"机器人"` `"计算机视觉"` `"AI"` `"Web 应用"` `"游戏"` `"竞赛"` `"小工具"`。第一个类别决定无封面时占位图的颜色 |
| `tech` | 是 | 用到的技术，如 `["Python", "OpenCV", "ROS"]` |
| `highlights` | 否 | 亮点 / 成果，每条一句话；没有就写 `[]` |
| `awards` | 否 | 获奖情况，每条一个奖项，如 `["某某比赛 冠军"]`；卡片和详情里带 🏆 显示 |
| `cover` | 否 | 封面图路径；没有就写 `""`，会自动生成带项目首字的彩色占位图 |
| `video` | 否 | 演示视频路径（MP4）；填了之后详情里优先播放视频，封面作为视频预览图 |
| `demo` | 否 | 在线体验地址（网址或站内路径），填了会显示「在线体验」按钮 |
| `links` | 否 | 其他链接，如 `[{ label: "源码", url: "https://github.com/..." }]` |
| `featured` | 是 | `true` 表示置顶精选，`false` 为普通 |

排序规则：`featured: true` 的在最前；置顶和普通两组内部都按年份从新到旧（跨年份按最近一年），年份相同按书写顺序。顶部的筛选按钮会根据项目里实际用到的类别自动生成。

链接只接受 `https://`、`http://`、`mailto:` 和站内相对路径，其他写法会被忽略。

### 图片和视频

- 统一放在 `assets/projects/`，在 `projects.js` 里写相对路径，如 `"assets/projects/robot.jpg"`
- 封面建议 **16:10、约 1600×1000** 的 JPG 或 WebP，单张最好在 500KB 以内
- 视频用 MP4（H.264），尽量压缩，**建议小于 20MB**（GitHub 单个文件上限 100MB，太大的视频加载也很慢）。更长的视频可以传到 B 站，再用 `links` 放链接
- 文件名只用英文、数字和短横线。线上区分大小写：`Robot.jpg` 和 `robot.jpg` 是两个不同的文件

### 网站标题和分享描述

页面打开后标题会自动变成「名字 · 作品集」。但搜索引擎和微信等分享预览读取的是 `index.html` 里写死的内容，建议把 `<title>`、`description` 和 `og:` 开头的几行改成你自己的信息。

### 配色

所有颜色都在 `style.css` 顶部的 `:root` 里，主题色是 `--accent`；深色模式的颜色在紧接着的 `@media (prefers-color-scheme: dark)` 里。

### 出错了怎么办

页面提示「内容加载失败」，通常是 `projects.js` 里少了逗号、引号或括号。按 `F12` 打开开发者工具，在 Console（控制台）里能看到出错的文件和行号。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个**公开**仓库，名字必须是 `<用户名>.github.io`（`<用户名>` 换成你的 GitHub 用户名）
2. 把本文件夹里的所有文件推送到仓库的 `main` 分支：

   ```bash
   git init
   git add .
   git commit -m "个人站"
   git branch -M main
   git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
   git push -u origin main
   ```

   不熟悉命令行的话，也可以在仓库网页上点 **Add file → Upload files** 直接拖进去（注意 `.nojekyll` 和 `assets` 文件夹也要上传）。
3. 打开仓库的 **Settings → Pages**，在 Build and deployment 中选择 **Source: Deploy from a branch**，Branch 选 **main**，文件夹选 **/ (root)**，点 Save
4. 等一两分钟，访问 `https://<用户名>.github.io` 即可

以后改了内容，重新提交推送，网站会在一两分钟内自动更新。
