#!/usr/bin/env python3
"""Inspect exactly the staged files. Print filenames and categories, never secret values."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'credential': re.compile(rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)'),
    'personal local path': re.compile(rb'/Users/[A-Za-z0-9_.-]+/'),
    'personal bundle identifier': re.compile(rb'com\.tosh3\.'),
    'license placeholder': re.compile(rb'Copyright \(c\) <year>'),
}
FORBIDDEN = re.compile(r'(^|/)(\.DS_Store|__MACOSX|xcuserdata|node_modules|\.env[^/]*|work|release|DerivedData[^/]*)(/|$)|\.(p12|p8|pem|key|xcuserstate|app|zip)$')
paths=subprocess.check_output(['git','ls-files','--cached','-z'],cwd=ROOT).decode().split('\0')
failures=[]
for name in filter(None,paths):
    if FORBIDDEN.search(name): failures.append((name,'excluded filename'))
    data=subprocess.check_output(['git','show',':'+name],cwd=ROOT)
    for label,pattern in PATTERNS.items():
        if pattern.search(data): failures.append((name,label))
if failures:
    for name,label in failures: print(f'{label}: {name}')
    sys.exit(1)
print(f'Passed staged-file audit: {len(list(filter(None, paths)))} files; no configured credential/private-path patterns.')
