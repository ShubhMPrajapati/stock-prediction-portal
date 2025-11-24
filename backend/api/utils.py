# utils.py
import os
import re
from django.conf import settings
import matplotlib.pyplot as plt

SAFE_FILENAME_RE = re.compile(r"[^A-Za-z0-9_.-]")

def _safe_filename(name: str) -> str:
    # remove any unsafe characters and avoid path separators
    name = os.path.basename(name)  # drop any path parts
    name = SAFE_FILENAME_RE.sub("_", name)
    return name

def save_plot(plot_img_path: str) -> str:
    """
    Save the current matplotlib figure to MEDIA_ROOT/<safe_filename>
    and return the media URL path (e.g. '/media/plots/FOO.png' or 'media/FOO.png'
    depending on your MEDIA_URL).
    """
    safe_name = _safe_filename(plot_img_path)
    # allow optional subfolder (e.g. "plots/foo.png")
    full_path = os.path.join(settings.MEDIA_ROOT, safe_name)
    full_dir = os.path.dirname(full_path)
    if not os.path.exists(full_dir):
        os.makedirs(full_dir, exist_ok=True)

    # save current figure
    plt.savefig(full_path, bbox_inches="tight", dpi=150)
    plt.close()

    # ensure MEDIA_URL ends with slash
    media_url = settings.MEDIA_URL or "/media/"
    if not media_url.endswith("/"):
        media_url = media_url + "/"

    # ensure URL begins with slash (client expects e.g. /media/xxx)
    if not media_url.startswith("/"):
        media_url = "/" + media_url

    # return relative URL path the client can combine with backend root (or use directly if served)
    return os.path.join(media_url, safe_name).replace(os.path.sep, "/")
