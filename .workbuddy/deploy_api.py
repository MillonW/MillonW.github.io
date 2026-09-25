#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""通过 GitHub REST API 推送 commit（git push 走不通时的兜底）"""
import json, urllib.request, urllib.error, subprocess, base64, os, sys

REPO  = "MillonW/MillonW.github.io"
BRANCH = "main"
TOKEN = subprocess.check_output(
    [r"C:\Users\admin\.workbuddy\binaries\gh\bin\gh.exe", "auth", "token"],
    text=True
).strip()
ROOT = r"C:\Users\admin\Desktop\millonw-homepage"

API = "https://api.github.com"
HDR = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "millonw-deploy",
}

def req(method, path, body=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    r = urllib.request.Request(API + path, data=data, method=method, headers=HDR)
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"[{e.code}] {path}\n{e.read().decode('utf-8')}\n")
        raise

# 1. 拿远程 main 当前 head
remote = req("GET", f"/repos/{REPO}/git/ref/heads/{BRANCH}")
head_sha = remote["object"]["sha"]
print(f"remote HEAD = {head_sha}")

# 2. 拿 head commit → tree
head_commit = req("GET", f"/repos/{REPO}/git/commits/{head_sha}")
base_tree = head_commit["tree"]["sha"]
parent_sha = head_commit["sha"]
print(f"base_tree  = {base_tree}")

# 3. 读本地 3 个修改后的文件内容，建 blob
files = ["index.html", "assets/css/style.css", "assets/js/main.js"]
def make_blob(path):
    with open(os.path.join(ROOT, path), "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode("ascii")
    blob = req("POST", f"/repos/{REPO}/git/blobs", {
        "content": content_b64,
        "encoding": "base64",
    })
    print(f"  blob {path} -> {blob['sha'][:10]}")
    return blob["sha"]

blobs = {p: make_blob(p) for p in files}

# 4. 新 tree（基于 base_tree，覆盖这 3 个文件路径）
new_tree = req("POST", f"/repos/{REPO}/git/trees", {
    "base_tree": base_tree,
    "tree": [
        {"path": p, "mode": "100644", "type": "blob", "sha": s}
        for p, s in blobs.items()
    ],
})
print(f"new_tree   = {new_tree['sha']}")

# 5. 新 commit
new_commit = req("POST", f"/repos/{REPO}/git/commits", {
    "message": "fix(video): 修复背景视频概率性黑屏 race condition\n\n"
               "- HTML: 给 video 标签加 autoplay（muted+playsinline+autoplay 浏览器自动播）\n"
               "- JS: 注册监听前先看 video.readyState，避免 CDN 缓存命中时错过 loadeddata\n"
               "- JS: markReady 幂等保护；preload() 的 loadedmetadata 同样兜底\n"
               "- CSS: .bg-video video 默认 opacity 从 0 改为 .22 兜底（不再纯黑）",
    "tree": new_tree["sha"],
    "parents": [parent_sha],
})
print(f"new_commit = {new_commit['sha']}")

# 6. 更新 ref
req("PATCH", f"/repos/{REPO}/git/refs/heads/{BRANCH}", {
    "sha": new_commit["sha"],
    "force": True,
})
print(f"\nOK: {BRANCH} -> {new_commit['sha'][:10]}")