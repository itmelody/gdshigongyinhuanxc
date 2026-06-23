# GitHub Pages 自动部署指南

## 已完成配置 ✅

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次推送到 `main` 分支时，会自动触发构建和部署。

## 部署流程

### 1. 启用 GitHub Pages（只需操作一次）

1. 打开 GitHub 仓库页面：https://github.com/itmelody/gdshigongyinhuanxc
2. 点击 **Settings**（设置）标签
3. 在左侧菜单找到 **Pages**（页面）
4. 在 **Source**（来源）部分：
   - **Branch**: 选择 `gh-pages`
   - **Folder**: 选择 `/ (root)`
5. 点击 **Save** 保存

### 2. 查看部署状态

- 进入仓库的 **Actions** 标签页
- 查看最新的 workflow 运行状态
- 绿色 ✓ 表示部署成功
- 红色 ✗ 表示部署失败（可查看日志排查问题）

### 3. 访问部署后的网站

部署成功后，您的网站将在以下地址可访问：

```
https://itmelody.github.io/gdshigongyinhuanxc/
```

**注意**：首次部署可能需要等待几分钟，GitHub Pages 需要时间生成和发布站点。

## 自动部署机制

### 触发条件
- 推送代码到 `main` 分支
- 手动触发 workflow（通过 GitHub Actions 页面）

### 部署步骤
1. **Checkout** - 检出代码
2. **Setup Node.js** - 安装 Node.js 环境
3. **Install dependencies** - 安装项目依赖
4. **Build** - 构建生产版本（Vite）
5. **Upload artifact** - 上传构建产物
6. **Deploy to GitHub Pages** - 部署到 GitHub Pages

### 工作流文件位置
`.github/workflows/deploy.yml`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 常见问题

### Q: 部署后页面显示空白？
A: 检查 `vite.config.ts` 中的 `base` 路径是否正确设置为 `/gdshigongyinhuanxc/`

### Q: 图片资源加载失败？
A: 确保使用相对路径或 Vite 的资源导入方式，不要使用绝对路径

### Q: 路由跳转 404？
A: GitHub Pages 是单页应用，需要在仓库根目录创建 `.nojekyll` 文件（已自动处理）

### Q: 如何查看部署日志？
A: 
1. 进入仓库的 **Actions** 标签
2. 点击最新的 workflow 运行记录
3. 查看每个步骤的详细日志

### Q: 如何手动重新部署？
A: 
1. 进入 **Actions** 标签
2. 点击 "Deploy to GitHub Pages" workflow
3. 点击 **Run workflow** 按钮
4. 选择 `main` 分支并运行

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **路由**: Vue Router 4.x
- **图表**: ECharts 5.x
- **部署**: GitHub Actions + GitHub Pages

## 更新历史

- **2026-06-23**: 初始化项目并配置 GitHub Actions 自动部署

---

**仓库地址**: https://github.com/itmelody/gdshigongyinhuanxc  
**部署地址**: https://itmelody.github.io/gdshigongyinhuanxc/
