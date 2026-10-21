"""Optional reproducible source download; normal checkouts already contain packaged shards."""
import argparse, hashlib, json, time, urllib.request
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('cache_dir')
parser.add_argument('--host',default='https://huggingface.co')
args=parser.parse_args()
revision='a7da5b986cb59b408707209984f360a5f4ad7e47'
base=args.host.rstrip('/')+'/HuggingFaceTB/SmolVLM-500M-Instruct/resolve/'+revision+'/'
root=Path(args.cache_dir)/'smolvlm-500m';root.mkdir(parents=True,exist_ok=True)
weights={
 'onnx/embed_tokens_quantized.onnx':(47309344,'f5f14887bf9b756d9fff2e412d474f0b5403e91f33b23460c9411f0ca54d945b'),
 'onnx/vision_encoder_q4.onnx':(66734107,'179812d5b1315edbe3e7164ea3d847c52723692e83ac9c770a5234962663fcad'),
 'onnx/decoder_model_merged_q4.onnx':(229119140,'6d64c0fdce1c3515c40a08ff8e398bfbc0b2e961ae46d1b84b91e6a7b269b9d1'),
}
files=['config.json','generation_config.json','preprocessor_config.json','processor_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','chat_template.json',*weights]
def valid(path,name):
    if not path.exists():return False
    data=path.read_bytes()
    if name in weights:return (len(data),hashlib.sha256(data).hexdigest())==weights[name]
    try:json.loads(data);return True
    except Exception:return False
for name in files:
    target=root/name;target.parent.mkdir(parents=True,exist_ok=True)
    if valid(target,name):print('verified',name,flush=True);continue
    for attempt in range(4):
        try:
            temporary=Path(str(target)+'.download')
            with urllib.request.urlopen(base+name,timeout=90) as response,temporary.open('wb') as output:
                while chunk:=response.read(1024*1024):output.write(chunk)
            if not valid(temporary,name):raise RuntimeError('Size, SHA-256 or JSON validation failed')
            temporary.replace(target);print('downloaded and verified',name,flush=True);break
        except Exception:
            if attempt==3:raise
            time.sleep(2)
