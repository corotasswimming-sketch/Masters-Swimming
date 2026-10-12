from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
translations=json.loads((root/'assets/video-review/translations.json').read_text())
script='<script data-video-i18n>window.PBLAP_VIDEO_TRANSLATIONS='+json.dumps(translations,ensure_ascii=False,separators=(',',':'))+';\n'+(root/'assets/video-review/i18n.js').read_text()+'</script>'
for name in ['video-guide.html','video-review.html']:
    path=root/name
    html=re.sub(r'<script data-video-i18n>[\s\S]*?</script>','',path.read_text())
    path.write_text(html.replace('</body>',script+'</body>'))
