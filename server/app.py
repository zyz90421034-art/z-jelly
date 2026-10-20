"""Image foreground -> TripoSR -> colored GLB. No placeholder geometry."""
import io
import json
import os
import sys
import threading
import time
import types
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / '.model-data'
DATA.mkdir(exist_ok=True)
Image.MAX_IMAGE_PIXELS = 24_000_000
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('MODEL_ALLOWED_ORIGINS', 'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4173,https://zyz90421034-art.github.io').split(','), allow_methods=['GET', 'POST'], allow_headers=['Content-Type'])
app.mount('/generated', StaticFiles(directory=DATA), name='generated')
jobs = {}
pool = ThreadPoolExecutor(max_workers=1)
admission = threading.Lock()
model = None
segmenter = None
@app.middleware('http')
async def request_size_limit(request, call_next):
    try:
        length = int(request.headers.get('content-length', '0'))
    except ValueError:
        return JSONResponse({'detail': '无效的请求大小。'}, status_code=400)
    if length > 13*1024*1024:
        return JSONResponse({'detail': '图片不能超过 12 MB。'}, status_code=413)
    return await call_next(request)


def update(job, stage, progress, **values):
    job.update(stage=stage, progress=progress, **values)
    (DATA / job['id'] / 'job.json').write_text(json.dumps(job, ensure_ascii=False), encoding='utf-8')


def marching_cubes(volume, threshold):
    # Portable CPU extraction avoids compiling torchmcubes on Windows.
    import torch
    from skimage.measure import marching_cubes as extract
    vertices, faces, _, _ = extract(volume.detach().cpu().numpy(), threshold)
    return torch.from_numpy(vertices[:, [2, 1, 0]].copy()), torch.from_numpy(faces.astype(np.int64))


def load_model():
    global model
    if model is not None:
        return model
    import torch
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    if device == 'cpu':
        torch.set_num_threads(min(8, os.cpu_count() or 4))
    shim = types.ModuleType('torchmcubes')
    shim.marching_cubes = marching_cubes
    sys.modules['torchmcubes'] = shim
    sys.path.insert(0, str(ROOT / 'vendor' / 'TripoSR'))
    from tsr.system import TSR
    local = ROOT / '.model-cache' / 'TripoSR'
    source = str(local) if (local/'model.ckpt').is_file() else 'stabilityai/TripoSR'
    model = TSR.from_pretrained(source, config_name='config.yaml', weight_name='model.ckpt')
    model.renderer.set_chunk_size(4096)
    model.to(device).eval()
    return model


def foreground(image):
    global segmenter
    import rembg
    from scipy import ndimage
    if segmenter is None:
        segmenter = rembg.new_session('u2netp', providers=['CPUExecutionProvider'])
    rgba = image.convert('RGBA')
    # Preserve a supplied cutout; otherwise identify the salient foreground.
    if rgba.getchannel('A').getextrema()[0] > 250:
        rgba = rembg.remove(image, session=segmenter).convert('RGBA')
    array = np.array(rgba)
    labels, count = ndimage.label(array[:, :, 3] > 100)
    if not count:
        raise ValueError('没有找到清晰主体，请换一张背景简单、主体完整的图片。')
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    largest = int(sizes.argmax())
    mask = ndimage.binary_fill_holes(labels == largest)
    # Keep disconnected foreground details near the principal subject.
    mask = ndimage.binary_dilation(mask, iterations=3)
    array[:, :, 3] = np.where(mask, array[:, :, 3], 0)
    rgba = Image.fromarray(array)
    bbox = rgba.getbbox()
    if not bbox or (bbox[2]-bbox[0])*(bbox[3]-bbox[1]) < image.width*image.height*.01:
        raise ValueError('主体太小，请裁剪图片后重试。')
    crop = rgba.crop(bbox)
    side = int(max(crop.size) / .85)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.alpha_composite(crop, ((side-crop.width)//2, (side-crop.height)//2))
    square.thumbnail((768, 768))
    visible = np.array(crop.resize((96, 96)))
    pixels = visible[:, :, :3][visible[:, :, 3] > 160]
    if not len(pixels):
        raise ValueError('主体识别失败，请换一张图片。')
    quant = (pixels // 32).astype(np.int32)
    keys = quant[:, 0]*64+quant[:, 1]*8+quant[:, 2]
    bins = np.bincount(keys, minlength=512)
    palette = []
    for key in bins.argsort()[::-1]:
        if not bins[key]:
            continue
        rgb = pixels[keys == key].mean(axis=0).astype(int)
        if all(np.linalg.norm(rgb - np.array(old)) > 48 for old in palette):
            palette.append(rgb.tolist())
        if len(palette) == 3:
            break
    return square, palette, list(bbox)


def cartoon_mesh(mesh, budget=4500):
    """Quadric decimation, color transfer and gentle outline-preserving smoothing."""
    from scipy.spatial import cKDTree
    import trimesh
    positions = np.asarray(mesh.vertices).copy()
    colors = np.asarray(mesh.visual.vertex_colors).copy()
    if len(mesh.faces) > budget:
        mesh = mesh.simplify_quadric_decimation(face_count=budget, aggression=5)
    trimesh.smoothing.filter_taubin(mesh, lamb=.30, nu=.31, iterations=3)
    nearest = cKDTree(positions).query(np.asarray(mesh.vertices))[1]
    mesh.visual.vertex_colors = colors[nearest]
    mesh.fix_normals()
    return mesh


@app.on_event('startup')
def migrate_previous_studies():
    import shutil
    import trimesh
    for saved in DATA.glob('*/job.json'):
        job = json.loads(saved.read_text(encoding='utf-8'))
        model_path = saved.parent / 'model.glb'
        if job.get('status') != 'complete' or job.get('mesh_version', 0) >= 2 or not model_path.is_file():
            continue
        source = saved.parent / 'source.glb'
        if not source.exists():
            shutil.copyfile(model_path, source)
        mesh = cartoon_mesh(trimesh.load(source, force='mesh'))
        mesh.export(model_path)
        job.update(mesh_version=2, faces=len(mesh.faces))
        saved.write_text(json.dumps(job, ensure_ascii=False), encoding='utf-8')


def generate(job, image):
    try:
        import torch
        folder = DATA / job['id']
        update(job, '识别主体', 12)
        cutout, palette, bbox = foreground(image)
        cutout.save(folder / 'subject.png')
        update(job, '载入建模引擎', 28, palette=palette, subject_url=f"/generated/{job['id']}/subject.png", bbox=bbox)
        generator = load_model()
        rgba = np.array(cutout).astype(np.float32) / 255
        rgb = rgba[:, :, :3]*rgba[:, :, 3:4] + .5*(1-rgba[:, :, 3:4])
        source = Image.fromarray((rgb*255).astype(np.uint8))
        update(job, '生成三维形状', 48)
        with torch.inference_mode():
            device = str(next(generator.parameters()).device)
            codes = generator([source], device=device)
            update(job, '生成表面颜色', 72)
            mesh = generator.extract_mesh(codes, True, resolution=192 if device.startswith('cuda') else 128)[0]
        if len(mesh.vertices) < 20:
            raise ValueError('未能重建有效模型，请换一个角度更完整的主体。')
        # TSR's source coordinates use Z up. GLB and the viewer use Y up.
        import trimesh
        mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi/2, [1, 0, 0]))
        mesh.fix_normals()
        update(job, '卡通化与减面', 90)
        mesh.export(folder / 'source.glb')
        mesh = cartoon_mesh(mesh)
        mesh.export(folder / 'model.glb')
        update(job, '完成', 100, status='complete', device=device, faces=len(mesh.faces), mesh_version=2, model_url=f"/generated/{job['id']}/model.glb")
        del codes
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception as error:
        import traceback
        traceback.print_exc()
        update(job, '生成失败', job['progress'], status='failed', error=str(error)[:320])


@app.get('/api/health')
def health():
    return {'service': 'z-jelly-model', 'engine': 'TripoSR + rembg', 'ready': (ROOT/'vendor'/'TripoSR'/'tsr').is_dir(), 'busy': any(j['status'] == 'running' for j in jobs.values())}


@app.post('/api/models', status_code=202)
async def create_model(image: UploadFile = File(...)):
    raw = await image.read(12*1024*1024+1)
    if len(raw) > 12*1024*1024:
        raise HTTPException(413, '图片不能超过 12 MB。')
    try:
        source = Image.open(io.BytesIO(raw))
        if source.width*source.height > Image.MAX_IMAGE_PIXELS:
            raise HTTPException(413, '图片像素过大，请通过网页自动压缩后重新上传。')
        source = ImageOps.exif_transpose(source).convert('RGBA')
        source.thumbnail((1600, 1600))
        source.load()
    except Image.DecompressionBombError:
        raise HTTPException(413, '图片像素过大，请通过网页自动压缩后重新上传。')
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(400, '图片无法读取，请使用 PNG、JPEG 或 WebP。')
    with admission:
        if any(j['status'] == 'running' for j in jobs.values()):
            raise HTTPException(429, '建模引擎正在处理另一张图片，请稍后重试。')
        if sum(j['created'] > time.time()-3600 for j in jobs.values()) >= 20:
            raise HTTPException(429, '本小时生成次数已满，请稍后再试。')
        identity = uuid.uuid4().hex
        (DATA / identity).mkdir()
        job = {'id': identity, 'name': Path(image.filename or '新作品').stem[:40], 'status': 'running', 'stage': '准备图片', 'progress': 3, 'created': time.time()}
        jobs[identity] = job
        pool.submit(generate, job, source)
    return job


@app.get('/api/jobs/{identity}')
def job_status(identity: str):
    if len(identity) != 32 or any(c not in '0123456789abcdef' for c in identity):
        raise HTTPException(404)
    if identity in jobs:
        return jobs[identity]
    saved = DATA / identity / 'job.json'
    if saved.is_file():
        result = json.loads(saved.read_text(encoding='utf-8'))
        if result['status'] == 'running':
            result.update(status='failed', error='生成服务已重启，请重新生成。')
        return result
    raise HTTPException(404)
