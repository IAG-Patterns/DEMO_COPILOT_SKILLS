#!/usr/bin/env python3
"""Unpack and format XML contents of Office files (.docx, .pptx, .xlsx)"""

import secrets
import shutil
import sys
import defusedxml.minidom
import zipfile
from pathlib import Path

# Get command line arguments
assert len(sys.argv) == 3, "Usage: python unpack.py <office_file> <output_dir>"
input_file, output_dir = sys.argv[1], sys.argv[2]

# Extract and format
output_path = Path(output_dir)
output_path.mkdir(parents=True, exist_ok=True)

# Safety: treat Office files as untrusted zip inputs (avoid zip bombs / path traversal)
MAX_FILES = 10_000
MAX_MEMBER_BYTES = 100 * 1024 * 1024  # 100 MiB
MAX_TOTAL_BYTES = 500 * 1024 * 1024  # 500 MiB
MAX_COMPRESSION_RATIO = 200  # very conservative upper bound


def _is_within_directory(base: Path, candidate: Path) -> bool:
    base = base.resolve()
    candidate = candidate.resolve()
    try:
        candidate.relative_to(base)
        return True
    except ValueError:
        return False


def _safe_extract(zip_path: str, *, dest: Path) -> None:
    total = 0
    dest = dest.resolve()
    with zipfile.ZipFile(zip_path) as zf:
        infos = zf.infolist()
        if len(infos) > MAX_FILES:
            raise ValueError(f"Refusing to extract {len(infos)} files (limit: {MAX_FILES})")

        for info in infos:
            # Directory entry
            is_dir = getattr(info, "is_dir", lambda: info.filename.endswith("/"))()
            out_path = (dest / info.filename)
            if not _is_within_directory(dest, out_path):
                raise ValueError(f"Refusing path traversal entry: {info.filename}")
            if is_dir:
                out_path.mkdir(parents=True, exist_ok=True)
                continue

            # Zip bomb checks
            file_size = int(getattr(info, "file_size", 0) or 0)
            comp_size = int(getattr(info, "compress_size", 0) or 0)
            if file_size > MAX_MEMBER_BYTES:
                raise ValueError(f"Refusing large member {info.filename} ({file_size} bytes)")
            if comp_size > 0 and file_size / comp_size > MAX_COMPRESSION_RATIO:
                raise ValueError(
                    f"Refusing highly-compressed member {info.filename} "
                    f"(ratio {file_size / comp_size:.1f} > {MAX_COMPRESSION_RATIO})"
                )
            total += file_size
            if total > MAX_TOTAL_BYTES:
                raise ValueError(f"Refusing to extract > {MAX_TOTAL_BYTES} bytes total")

            out_path.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info, "r") as src, open(out_path, "wb") as dst:
                shutil.copyfileobj(src, dst)


_safe_extract(input_file, dest=output_path)

# Pretty print all XML files
xml_files = list(output_path.rglob("*.xml")) + list(output_path.rglob("*.rels"))
for xml_file in xml_files:
    content = xml_file.read_text(encoding="utf-8")
    dom = defusedxml.minidom.parseString(content)
    xml_file.write_bytes(dom.toprettyxml(indent="  ", encoding="ascii"))

# For .docx files, suggest an RSID for tracked changes
if input_file.endswith(".docx"):
    suggested_rsid = secrets.token_hex(4).upper()
    print(f"Suggested RSID for edit session: {suggested_rsid}")
