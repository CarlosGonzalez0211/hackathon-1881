"""Reapply the local-only changes to the preserved original production files."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
name = 'App3D-DwM1eiaC.js'
source = (root / 'originals' / name).read_text(encoding='utf-8')

def replace_exact(old, new, count):
    global source
    assert source.count(old) == count, f'Unexpected upstream pattern: {old}'
    source = source.replace(old, new)

replace_exact('offline:!1,autoConnect:!1', 'offline:!0,autoConnect:!1', 1)
replace_exact('this.characters.mesh._connection._createSocket()',
              'this.characters.mesh._connection?._createSocket()', 2)
replace_exact('events$1.once("switch_to_present_scene",this.switchToPresent,this),await this.uiScene.uploaded',
              'events$1.once("switch_to_present_scene",this.switchToPresent,this),document.addEventListener("keydown",e=>{if(e.code==="Enter"&&this.state==="intro"&&!this._localStarting){this._localStarting=true;events$1.emit("switch_to_present_scene")}}),await this.uiScene.uploaded', 1)
source = source.replace('https://messenger.abeto.co/assets/', '/assets/')
(root / 'dist' / 'assets' / name).write_text(source, encoding='utf-8')

html = (root / 'originals' / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<script type="module" src="https://static.cloudflareinsights.com/.*?</script>', '', html)
html = html.replace('https://messenger.abeto.co/assets/', '/assets/')
(root / 'dist' / 'index.html').write_text(html, encoding='utf-8')
print('Applied local asset routing, offline mode, connection guards, and Enter shortcut.')
