# GitHub Pages 部署故障排查指南

## 当前状态
❌ 部署失败 - 需要检查具体错误原因

## 快速解决步骤

### 步骤 1：启用 GitHub Pages（最重要）

1. 访问仓库设置页面：
   ```
   https://github.com/itmelody/gdshigongyinhuanxc/settings/pages
   ```

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions** ✅
   - ⚠️ 不要选择 "Deploy from a branch"

3. 点击 **Save** 保存设置

### 步骤 2：查看错误日志

1. 进入 **Actions** 标签页
2. 点击失败的 workflow 运行记录（红色 ）
3. 点击左侧的步骤列表，查看哪个步骤失败了
4. 展开失败的步骤，查看详细错误信息

### 步骤 3：常见错误及解决方案

#### 错误 1: "Permission denied" 或 "Resource not accessible by integration"
**原因**: GitHub Actions 没有足够的权限  
**解决**: 
- 确保 workflow 文件中包含正确的 permissions
- 已在 deploy.yml 中配置了 `pages: write` 和 `id-token: write`

#### 错误 2: "npm ci failed" 或 "Installation failed"
**原因**: 依赖安装失败  
**解决**:
```bash
# 本地测试构建
cd construction-inspection
npm install
npm run build
```

#### 错误 3: "Build failed" 或 "Vite build error"
**原因**: Vite 构建失败  
**解决**:
- 检查 `vite.config.ts` 中的 `base` 路径是否正确
- 确保所有 import 语句正确
- 本地运行 `npm run build` 查看具体错误

#### 错误 4: "No artifact found" 或 "dist directory not found"
**原因**: 构建产物不存在  
**解决**:
- 确认 `npm run build` 生成了 `dist` 目录
- 检查 package.json 中的 build 脚本是否正确

#### 错误 5: "Deployment failed" 或 "Pages deployment error"
**原因**: GitHub Pages 未正确配置  
**解决**:
- 按照步骤 1 启用 GitHub Pages
- 确保选择了 "GitHub Actions" 作为 Source

## 手动触发重新部署

如果修复了问题，可以手动触发部署：

1. 进入 **Actions** 标签页
2. 点击 "Deploy to GitHub Pages" workflow
3. 点击右侧的 **Run workflow** 按钮
4. 选择 `main` 分支
5. 点击 **Run workflow**

## 验证部署成功

部署成功后：

1. ✅ Workflow 显示绿色 ✓
2. ✅ 可以在 **Actions** → **Deployments** 中看到部署记录
3. ✅ 访问网站：https://itmelody.github.io/gdshigongyinhuanxc/

## 获取帮助

如果仍然无法解决，请提供以下信息：

1. 完整的错误日志截图
2. 失败的步骤名称
3. 错误消息全文

可以将这些信息发送到 Issues 或联系我协助排查。

## 参考资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

**最后更新**: 2026-06-23
