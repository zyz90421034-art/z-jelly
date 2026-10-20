# 图片转 3D 服务

流程：rembg U2Net 前景分割 → 主连通主体 → TripoSR 三维重建及顶点颜色 → 约 4500 面的减面与颜色转移 → GLB → 网页粉彩渲染、拖拽与新卡片。

这是真正的三维重建。单张照片无法确定被遮挡的背面；复杂、透明或多个重叠主体的效果会有局限。前景识别使用显著性分割，并不提供语义类别标签。

## 在 Windows 启动

需要 Python 3.12、uv、Git 和 NVIDIA GPU。初次安装需要下载模型和 PyTorch，保留足够磁盘空间。

```powershell
uv venv --python 3.12 .venv-model
uv pip install --python .venv-model/Scripts/python.exe torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124
uv pip install --python .venv-model/Scripts/python.exe -r server/requirements.txt
git clone https://github.com/VAST-AI-Research/TripoSR.git vendor/TripoSR
git -C vendor/TripoSR checkout 107cefdc244c39106fa830359024f6a2f1c78871
pwsh -File server/start.ps1
```

模型首次从 `stabilityai/TripoSR` 下载。TripoSR 是 MIT 许可项目，源代码和许可证位于其上游仓库。项目没有把上游源码或数 GB 的权重提交到 GitHub；`vendor/`、缓存和用户作品均被忽略。

参考仓库：

- https://github.com/VAST-AI-Research/TripoSR
- https://github.com/danielgatis/rembg

后端使用 scikit-image 的 CPU marching cubes 做表面提取，避免 Windows 上编译 torchmcubes。神经网络优先使用 CUDA；CUDA 不可用时会使用较慢的 CPU 推理和较低的提取分辨率，仍然生成真实三维模型。

## 公开网页

GitHub Pages 只运行前端，不能运行 GPU 模型。在 GPU 主机上部署本服务，通过 HTTPS 暴露 7861 服务，并把 `public/model-service.json` 的 `url` 改成该服务的 HTTPS 地址（也可用构建变量 `VITE_MODEL_API_URL` 覆盖）：

```powershell
$env:VITE_MODEL_API_URL='https://your-model-api.example'
npm run build
```

后端 `MODEL_ALLOWED_ORIGINS` 是逗号分隔的前端来源，默认允许本机预览和本仓库的 GitHub Pages。浏览器上传的图片会发送到这个服务处理。前端把生成结果保存在访问者自己的 IndexedDB 中，不写入 GitHub。

临时验证可使用 Cloudflare Quick Tunnel。该地址随重启改变，且依赖当前电脑、网络、GPU 服务和隧道都持续运行；它不是常驻云服务。长期开放应使用固定域名的 GPU 服务，并按需求添加账户、配额、任务保留/清理与资源监控。

默认一次只接受一个生成任务，每小时最多 20 个任务，图片上限 12 MB。上传文件和输出存放在忽略的 `.model-data/` 中。生成失败会如实返回错误，不以程序生成的假模型代替。

固定 GPU 服务器可使用提供的 Dockerfile：

```sh
docker build -f server/Dockerfile -t z-jelly-model .
docker run --gpus all -p 127.0.0.1:7861:7861 -v jelly-model-cache:/app/.model-cache -v jelly-model-data:/app/.model-data z-jelly-model
```

再通过自己的 HTTPS 反向代理接入该服务。Docker 镜像配置已准备，但未在本机运行 Docker 构建验证。
