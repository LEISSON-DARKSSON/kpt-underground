#!/usr/bin/env python3
"""Read-only verification of this handoff's files and two original print assets.

Usage: python automation/verify_handoff.py [--root PATH]
Uses only the Python standard library. No networking, writes or account actions.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import sys

FONT_EXTENSIONS = {'.ttf', '.otf', '.woff', '.woff2', '.eot', '.ttc'}
TEXT_EXTENSIONS = {'.md', '.txt', '.json', '.html', '.css', '.js', '.mjs', '.mts', '.ts', '.tsx', '.py', '.svg'}
SECRET_PATTERNS = [
    re.compile(r'ptkn_[0-9a-fA-F]{8}-[0-9a-fA-F-]{27,}'),
    re.compile(r'fw_api_[A-Za-z0-9]+@fourthwall\.com'),
    re.compile(r'_vercel_share=[A-Za-z0-9]{12,}'),
    re.compile(r'(?:ghp_|github_pat_|sk_live_|sk-proj-)[A-Za-z0-9_\-]{16,}'),
]


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def verify(root: Path) -> dict:
    root = root.resolve()
    errors: list[str] = []
    checked = 0
    try:
        manifest = json.loads((root / 'HANDOFF-MANIFEST.json').read_text(encoding='utf-8'))
        products = json.loads((root / 'state/product-manifest.json').read_text(encoding='utf-8'))
    except (OSError, ValueError) as exc:
        return {'status': 'FAIL', 'filesChecked': 0, 'errors': [f'Cannot read manifest: {type(exc).__name__}']}

    expected = set()
    for item in manifest.get('files', []):
        relative = item.get('path', '')
        path = root / relative
        if not relative or path.is_symlink() or not path.resolve().is_relative_to(root):
            errors.append(f'Unsafe path: {relative}')
            continue
        expected.add(relative)
        if not path.is_file():
            errors.append(f'Missing file: {relative}')
            continue
        checked += 1
        if path.stat().st_size != item['bytes'] or checksum(path) != item['sha256']:
            errors.append(f'File changed: {relative}')

    for path in root.rglob('*'):
        if not path.is_file():
            continue
        relative = path.relative_to(root).as_posix()
        if path.suffix.lower() in FONT_EXTENSIONS:
            errors.append(f'Unexpected font binary: {relative}')
        if path.name.startswith('.env') or path.suffix.lower() in {'.pem', '.key'}:
            errors.append(f'Unexpected credentials file: {relative}')
        if path.suffix.lower() in TEXT_EXTENSIONS:
            try:
                content = path.read_text(encoding='utf-8')
            except (UnicodeError, OSError):
                errors.append(f'Unreadable text file: {relative}')
                continue
            if any(pattern.search(content) for pattern in SECRET_PATTERNS):
                # Never echo the matched value.
                errors.append(f'Possible credential in: {relative}')

    expected_offers = {
        'SIGNAL': '74c2ace1-4f7c-469b-a607-5555432019b4',
        'SUBSURFACE': '97704a85-a6b6-4090-894f-a7b5bc71a374',
    }
    entries = products.get('products', [])
    if {item.get('key') for item in entries} != set(expected_offers) or len(entries) != 2:
        errors.append('Expected exactly the two named product manifest entries.')
    for item in entries:
        name = item.get('key', 'unknown')
        if item.get('offerId') != expected_offers.get(name):
            errors.append(f'Unexpected offer mapping for {name}')
        path = root / item.get('printFile', '')
        if path.is_symlink() or not path.resolve().is_relative_to(root) or not path.is_file():
            errors.append(f'Missing or unsafe print file for {name}')
            continue
        with path.open('rb') as stream:
            header = stream.read(33)
        if len(header) != 33 or header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
            errors.append(f'Invalid PNG header: {name}')
        elif struct.unpack('>II', header[16:24]) != (9921, 5197) or header[25] != 2:
            errors.append(f'Unexpected dimensions or non-RGB PNG: {name}')
        if checksum(path) != item.get('sha256'):
            errors.append(f'Print checksum mismatch: {name}')

    actual = {p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file()}
    extras = sorted(actual - expected - {'HANDOFF-MANIFEST.json'})
    return {
        'status': 'PASS' if not errors else 'FAIL',
        'filesChecked': checked,
        'printAssetsChecked': len(entries),
        'errors': errors,
        'unmanifestedFiles': extras,
        'scope': 'Local file integrity and known credential-pattern scan only. Not account, browser, payment or physical-print verification.',
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    result = verify(args.root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
