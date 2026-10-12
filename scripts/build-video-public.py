from pathlib import Path
import base64
import re
root=Path(__file__).resolve().parent.parent
html=(root/'assets/video-review/page.html').read_text()
html=html.replace('<link rel="stylesheet" href="assets/video-review/style.css">','<style>'+(root/'assets/video-review/style.css').read_text()+'</style>')
html=html.replace('<script src="assets/video-review/config.js" defer></script><script src="assets/video-review/app.js" defer></script>','')
html=re.sub(r'<script src="https://cdn.jsdelivr.net/[^\"]+" defer></script>','',html)
html=html.replace('<div id="auth">','<div id="auth" hidden>')
html=html.replace('<div id="session" hidden><div class="session">','<div id="session"><div class="session" hidden>')
html=html.replace('<form id="uploadForm">','<form id="uploadForm"><label for="guestEmail">Email для ответа</label><input id="guestEmail" type="email" autocomplete="email" required maxlength="254"><p class="muted">Проверь адрес: сюда тренер пришлёт оценку. Код и пароль не нужны.</p><div hidden><label for="guestWebsite">Website</label><input id="guestWebsite" tabindex="-1" autocomplete="off"></div>')
html=html.replace('<footer>','<footer><a href="https://t.me/Dmitri_Corotas">Написать тренеру в Telegram</a> · <a href="/video-test.html">Кабинет тренера</a><br>')
for name,mime in [('crawl-guide.gif','image/gif'),('camera-settings.png','image/png')]:
    html=html.replace('assets/video-review/'+name,'data:'+mime+';base64,'+base64.b64encode((root/'assets/video-review'/name).read_bytes()).decode())
html=html.replace('</body>','<script>'+(root/'assets/video-review/config.js').read_text()+'\n'+(root/'assets/video-review/guest.js').read_text()+'\n</script></body>')
(root/'video-review.html').write_text(html)
# Keep translated public output reproducible when rebuilding the form.
import runpy
runpy.run_path(str(root/'scripts/build-video-i18n.py'))
