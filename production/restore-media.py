"""Restore byte-exact binary media from the GitHub text backups."""
from pathlib import Path
import base64,hashlib,json
root=Path(__file__).resolve().parent
for name,expected in json.loads((root/'media-sha256.json').read_text()).items():
 chunks=sorted((root/'media-backup').glob(name+'.*.b64'))
 if chunks:
  data=b''.join(base64.b64decode(p.read_text(),validate=True) for p in chunks)
  assert hashlib.sha256(data).hexdigest()==expected,'Checksum mismatch: '+name
  (root/name).write_bytes(data)
 else:
  assert (root/name).exists() and hashlib.sha256((root/name).read_bytes()).hexdigest()==expected,'Missing media: '+name
 print('OK',name)
