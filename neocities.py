#!/usr/bin/python3

import hashlib
import os
import sys
from pathlib import Path

import requests

API_KEY = os.getenv("NEOCITIES_API_KEY")
LOCAL_ROOT = Path("_site")


def print_usage():
    print("usage: ./neocities.py <status | push>")


def get_sha1(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()


def get_list():
    url = "https://neocities.org/api/list"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    res = requests.get(url, headers=headers)
    data = res.json()

    if data.get("result") != "success":
        print("API Error:", data, file=sys.stderr)
        return None

    server_files = {f["path"]: f.get("sha1_hash") for f in data.get("files", []) if not f.get("is_directory", False)}
    local_files_paths = {str(f.relative_to(LOCAL_ROOT)): f for f in LOCAL_ROOT.rglob("*") if f.is_file()}

    orphaned = sorted(server_files.keys() - local_files_paths.keys())
    new = sorted(local_files_paths.keys() - server_files.keys())
    modified = sorted(
        [
            path
            for path, sha1_hash in server_files.items()
            if path in local_files_paths and sha1_hash != get_sha1(local_files_paths[path])
        ]
    )

    return {"orphaned": orphaned, "modified": modified, "new": new}


def status():
    data = get_list()
    if data is None:
        return

    if data["orphaned"]:
        print(f"\033[31m" + "\n".join(f"[O] {o}" for o in data["orphaned"]) + "\033[0m")
    if data["modified"]:
        print(f"\033[33m" + "\n".join(f"[M] {m}" for m in data["modified"]) + "\033[0m")
    if data["new"]:
        print(f"\033[32m" + "\n".join(f"[N] {m}" for m in data["new"]) + "\033[0m")


def delete(filenames):
    if not filenames:
        return
    print(f"DELETE: {filenames}")
    url = "https://neocities.org/api/delete"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    post_data = [("filenames[]", f) for f in filenames]
    response = requests.post(url, headers=headers, data=post_data)
    print(response.text.strip())


def upload(filenames):
    if not filenames:
        return
    print(f"UPLOAD: {filenames}")
    url = "https://neocities.org/api/upload"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    files_to_upload = [(fn, (fn, open(LOCAL_ROOT / fn, "rb"))) for fn in filenames]

    try:
        response = requests.post(url, headers=headers, files=files_to_upload)
        print(response.text.strip())
    finally:
        for _, (_, fobj) in files_to_upload:
            fobj.close()


def push():
    data = get_list()
    if data is None:
        return

    exclude = [".well-known/atproto-did", "robots.txt"]
    delete_files = [o for o in data["orphaned"] if o not in exclude]
    delete(delete_files)

    upload(data["modified"] + data["new"])


if __name__ == "__main__":
    if not API_KEY:
        print("Error: NEOCITIES_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    command = sys.argv[1]

    match command:
        case "status":
            status()
        case "push":
            push()
        case _:
            print_usage()
            sys.exit(1)
