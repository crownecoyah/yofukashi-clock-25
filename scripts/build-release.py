#!/usr/bin/env python3
"""Build and verify the ad-hoc-signed Universal macOS release locally."""
from pathlib import Path
import hashlib
import os
import plistlib
import re
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.0.0'
SOURCE = ROOT / 'macOS/NightOwlClock25'
OUT = ROOT / 'release' / f'v{VERSION}'
WORK = ROOT / 'work'
SECRET = re.compile(rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
FORBIDDEN = re.compile(r'(^|/)(\.DS_Store|__MACOSX|xcuserdata|\.git|DerivedData[^/]*|build|dist)(/|$)|\.(xcuserstate|p12|pem|p8|key|provisionprofile|mobileprovision)$')

def run(*args, **kwargs):
    return subprocess.run([str(a) for a in args], check=True, **kwargs)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(exist_ok=True)
    derived = WORK / 'DerivedData-release'
    log = WORK / 'release-build.log'
    print('Building Universal Release; detailed log: work/release-build.log', flush=True)
    with log.open('w') as output:
        run('xcodebuild', 'build', '-project', SOURCE/'NightOwlClock25.xcodeproj',
            '-scheme', 'NightOwlClock25', '-configuration', 'Release',
            '-derivedDataPath', derived, 'ARCHS=arm64 x86_64', 'ONLY_ACTIVE_ARCH=NO',
            'CODE_SIGNING_ALLOWED=NO', 'ENABLE_DEBUG_DYLIB=NO',
            f'MARKETING_VERSION={VERSION}',
            f'OTHER_SWIFT_FLAGS=$(inherited) -file-prefix-map {ROOT}=/src -debug-prefix-map {ROOT}=/src',
            f'OTHER_CFLAGS=$(inherited) -ffile-prefix-map={ROOT}=/src -fdebug-prefix-map={ROOT}=/src',
            stdout=output, stderr=subprocess.STDOUT)
    with tempfile.TemporaryDirectory(prefix='release-', dir=WORK) as temporary:
        stage = Path(temporary)/f'yofukashi-clock-25-v{VERSION}'
        stage.mkdir()
        app = stage/'夜ふかし時計25時.app'
        shutil.copytree(derived/'Build/Products/Release/NightOwlClock25.app', app, symlinks=True)
        # Remove linker debug-symbol paths before signing; runtime symbols remain.
        run('strip', '-S', app/'Contents/MacOS/NightOwlClock25')
        for p in app.rglob('*'):
            if p.is_file() and not p.is_symlink():
                data=p.read_bytes()
                if b'/Users/' in data or SECRET.search(data):
                    raise RuntimeError(f'Private path or credential pattern in {p.relative_to(app)}')
        if list(app.rglob('*.xctest')) or list(app.rglob('*debug.dylib')):
            raise RuntimeError('Debug/test files included in Release')
        info=plistlib.loads((app/'Contents/Info.plist').read_bytes())
        assert info['CFBundleShortVersionString']==VERSION
        binary=app/'Contents/MacOS/NightOwlClock25'
        archs=run('lipo','-archs',binary,capture_output=True,text=True).stdout.split()
        assert set(archs)=={'arm64','x86_64'}, archs
        run('codesign','--force','--sign','-','--options','runtime','--timestamp=none',
            '--entitlements',SOURCE/'NightOwlClock25/App/NightOwlClock25.entitlements',app)
        run('codesign','--verify','--deep','--strict',app)
        for name in ['README.txt','LICENSE.txt']:
            shutil.copy2(SOURCE/name,stage/name)
        maczip=OUT/f'yofukashi-clock-25-v{VERSION}-macOS.zip'
        run('ditto','-c','-k','--norsrc','--noextattr','--noqtn','--keepParent',stage,maczip)
        sourcezip=OUT/f'yofukashi-clock-25-v{VERSION}-source.zip'
        with zipfile.ZipFile(sourcezip,'w',zipfile.ZIP_DEFLATED) as z:
            for p in sorted(SOURCE.rglob('*')):
                relative=p.relative_to(SOURCE)
                if p.is_file() and not p.is_symlink() and not FORBIDDEN.search(str(relative)):
                    z.write(p, 'NightOwlClock25/'+str(relative))
        for archive in [maczip,sourcezip]:
            with zipfile.ZipFile(archive) as z:
                assert z.testzip() is None
                for name in z.namelist():
                    assert not FORBIDDEN.search(name), name
                    data=z.read(name)
                    assert b'/Users/' not in data and not SECRET.search(data), name
        extracted=Path(temporary)/'verified'
        run('ditto','-x','-k',maczip,extracted)
        restored=extracted/stage.name/app.name
        run('codesign','--verify','--deep','--strict',restored)
        assert os.access(restored/'Contents/MacOS/NightOwlClock25',os.X_OK)
        sums=''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in [maczip,sourcezip])
        (OUT/'SHA256SUMS.txt').write_text(sums)
        print(sums, end='')
        print('Verified: Universal arm64/x86_64, version, ad-hoc signature, ZIP CRC, executable permission, no local user paths or credential patterns.')

if __name__=='__main__':
    main()
