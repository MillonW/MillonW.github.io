#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub REST API 兜底推送脚本

用途：本机 git push 走 https 常被代理拦截（502 / Empty reply / CONNECT tunnel failed），
      此时改用 Git Data API 直接把本地文件推送成 commit。

用法：
    python deploy_api.py              # 默认推送 main
    python deploy_api.py optimize     # 推送指定分支

原理：
    1. 取远程目标分支的 HEAD → base tree
    2. 用 git diff 算出「origin/<branch>..<branch>」之间改动的文件
    3. 为每个改动文件创建 blob（已删除的文件用 sha=null 表示删除）
    4. 基于 base tree + 新 blob 生成新 tree
    5. 用本地最新 commit 的 message 创建 commit（parent = 远程 HEAD）
    6. PATCH ref 指向新 commit（force=true）

注意：
    - 会把本地所有未推送的改动压成**一个** commit（对静态站点无影响）
    - 推送后本地 HEAD 与远程会分叉（commit 对象不同但内容一致），
      之后在本机执行 git fetch && git reset --hard origin/<branch> 即可对齐
"""
import json, urllib.request, urllib.error, subprocess, base64, os, sys

REPO = "MillonW/MillonW.github.io"
ROOT = r"C:\Users\admin\Desktop\millonw-homepage"
GH_EXE = r"C:\Users\admin\.workbuddy\binaries\gh\bin\gh.exe"

BRANCH = sys.argv[1] if len(sys.argv) > 1 else "main"

API = "https://api.github.com"
HDR = {
    "Authorization": "Bearer " + subprocess.check_output([GH_EXE, "auth", "token"], text=True).strip(),
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


def git(*args):
    return subprocess.check_output(["git"] + list(args), cwd=ROOT, text=True).strip()


# 1. 远程目标分支 HEAD
head_sha = req("GET", f"/repos/{REPO}/git/ref/heads/{BRANCH}")["object"]["sha"]
base_tree = req("GET", f"/repos/{REPO}/git/commits/{head_sha}")["tree"]["sha"]
print(f"remote {BRANCH} HEAD = {head_sha[:10]}")
print(f"base_tree            = {base_tree[:10]}")

# 2. 本地相对远程改动的文件
changed = [f for f in git("diff", "--name-only", f"origin/{BRANCH}..{BRANCH}").splitlines() if f.strip()]
if not changed:
    print("没有需要推送的改动")
    sys.exit(0)
print(f"changed files ({len(changed)}):")

# 3. 建 blob（已删除的文件用 sha=null 表示删除）
tree_entries = []
for path in changed:
    full = os.path.join(ROOT, path)
    if not os.path.exists(full):
        tree_entries.append({"path": path, "mode": "100644", "type": "blob", "sha": None})
        print(f"  delete {path}")
        continue
    with open(full, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode("ascii")
    blob = req("POST", f"/repos/{REPO}/git/blobs", {"content": b64, "encoding": "base64"})
    tree_entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    print(f"  blob   {path} -> {blob['sha'][:10]}")

# 4. 新 tree
new_tree = req("POST", f"/repos/{REPO}/git/trees", {"base_tree": base_tree, "tree": tree_entries})
print(f"new_tree   = {new_tree['sha'][:10]}")

# 5. 新 commit（message 取本地最新 commit）
message = git("log", "-1", "--pretty=%B", BRANCH)
new_commit = req("POST", f"/repos/{REPO}/git/commits", {
    "message": message,
    "tree": new_tree["sha"],
    "parents": [head_sha],
})
print(f"new_commit = {new_commit['sha'][:10]}")

# 6. 更新 ref
req("PATCH", f"/repos/{REPO}/git/refs/heads/{BRANCH}", {"sha": new_commit["sha"], "force": True})
print(f"\nOK: {BRANCH} -> {new_commit['sha'][:10]}")
print("提示：本机执行 git fetch && git reset --hard origin/" + BRANCH + " 对齐本地历史")
