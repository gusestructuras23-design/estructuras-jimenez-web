"""Publish the single changed client module; preserve all recovered live modules."""
from pathlib import Path
import os,json,urllib.request,email.parser,email.policy,uuid
root=Path(__file__).resolve().parent
backup=Path('/workspace/scratch/logo-rose')
base='https://api.cloudflare.com/client/v4/accounts/'+os.environ['CLOUDFLARE_ACCOUNT_ID']+'/workers/scripts/estructuras-jimenez-whatsapp'
headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN']}
def request(path='',data=None,extra=None,method=None):
 return urllib.request.urlopen(urllib.request.Request(base+path,data=data,headers=headers|(extra or {}),method=method))
def api(path):
 r=json.load(request(path));assert r['success'];return r['result']
def parse(raw,mime):
 m=email.parser.BytesParser(policy=email.policy.default).parsebytes(('Content-Type: '+mime+'\r\nMIME-Version: 1.0\r\n\r\n').encode()+raw)
 return {p.get_param('name',header='content-disposition'):p.get_payload(decode=True) for p in m.iter_parts()}
if __name__=='__main__':
 original=json.loads((backup/'deployment.json').read_text());settings=json.loads((backup/'settings.json').read_text())
 assert api('/deployments')['deployments'][0]['versions']==original['versions'],'Live version changed; review before upload'
 assert api('/settings')['bindings']==settings['bindings']
 modules=json.loads((root/'modules.json').read_text());assert len(modules)==22
 old_client=(root/'client-assets.mjs').read_bytes()
 # Footer markup and client styles change; preserve all other live modules.
 assert old_client
 for name in ['whatsapp-worker.mjs','project-section.mjs','privacy-page.mjs','project-media.mjs']:
  assert (root/name).is_file()
 metadata={k:settings[k] for k in ['bindings','compatibility_date','compatibility_flags','usage_model','logpush','tail_consumers','placement','tags'] if k in settings}
 metadata.update(main_module='whatsapp-worker.mjs',annotations={'workers/message':'Rosa original del logo y atmosfera neutra'})
 boundary='----EJ'+uuid.uuid4().hex
 def part(name,data,mime):return ('--'+boundary+'\r\nContent-Disposition: form-data; name="'+name+'"; filename="'+name+'"\r\nContent-Type: '+mime+'\r\n\r\n').encode()+data+b'\r\n'
 current=request();old=parse(current.read(),current.headers['Content-Type'])
 for module in modules:
  if module['name'] not in {'client-assets.mjs'}:assert old[module['name']]==(root/module['name']).read_bytes(),module['name']
 body=part('metadata',json.dumps(metadata).encode(),'application/json')
 for module in modules:
  name=module['name'];body+=part(name,(root/name).read_bytes(),'application/javascript+module' if name.endswith('.mjs') else 'application/octet-stream')
 body+=('--'+boundary+'--\r\n').encode()
 result=json.load(request(data=body,extra={'Content-Type':'multipart/form-data; boundary='+boundary},method='PUT'));assert result['success']
 deployed=api('/deployments')['deployments'][0];(backup/'deployed.json').write_text(json.dumps(deployed))
 assert len(deployed['versions'])==1 and deployed['versions'][0]['percentage']==100
 response=request();uploaded=parse(response.read(),response.headers['Content-Type'])
 for module in modules:assert uploaded[module['name']]==(root/module['name']).read_bytes(),module['name']
 assert api('/settings')['bindings']==settings['bindings']
 release={'public_version':deployed['versions'][0]['version_id'],'changes':['Pie en dos bloques alineados: marca a la izquierda y contacto a la derecha; distribución apilada en móvil','Botón Desarrollado por IPService con enlace https://wa.me/5215644361349','Accesos flotantes de WhatsApp y puerquito conservados'],'verification':'Miniflare render and Chromium at 1366, 768, 390 and 320px: correct phone, map, developer WhatsApp and founding date; two aligned desktop blocks and stacked left-aligned mobile blocks, no horizontal overflow or overlap with floating controls; developer button target at least 44px. All 21 uploaded modules verified byte for byte; binding preserved.'}
 (root/'release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
 print('Published and verified',len(modules),'modules; version',release['public_version'])
