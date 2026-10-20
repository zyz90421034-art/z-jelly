FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
RUN git clone https://github.com/VAST-AI-Research/TripoSR.git vendor/TripoSR && git -C vendor/TripoSR checkout 107cefdc244c39106fa830359024f6a2f1c78871
COPY server/app.py server/app.py
ENV HF_HOME=/app/.model-cache/huggingface U2NET_HOME=/app/.model-cache/rembg
VOLUME ["/app/.model-cache", "/app/.model-data"]
EXPOSE 7861
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7861", "--no-access-log"]
