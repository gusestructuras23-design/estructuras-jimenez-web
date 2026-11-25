"""Regenerate embedded Akari HTML/assets after editing native-akari/."""
from pathlib import Path
import json,base64,mimetypes
r=Path(__file__).resolve().parent;folder=r/'native-akari';assets={}
for f in folder.rglob('*'):
 if f.is_file() and f.suffix not in ['.html','.md']:
  assets['/'+f.relative_to(folder).as_posix()]={'type':mimetypes.guess_type(f.name)[0] or 'application/octet-stream','data':base64.b64encode(f.read_bytes()).decode()}
(r/'native-akari.mjs').write_text('export const nativeHTML = '+json.dumps((folder/'index.html').read_text())+';\nexport const nativeAssets = '+json.dumps(assets)+';\n')
print('Generated native Akari document and',len(assets),'assets')
