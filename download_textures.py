import os
import urllib.request

# Base URLs
BASE_THREEX = "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/"
BASE_MRDOOB = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/"
BASE_EARTH = "https://raw.githubusercontent.com/turban/webgl-earth/master/images/"
BASE_SOLAR = "https://www.solarsystemscope.com/textures/download/"

TARGET_DIR = "public/textures"

# Map filename to Source URL
TEXTURES = {
    "sun.jpg": "https://raw.githubusercontent.com/turban/webgl-earth/master/images/sun.jpg",
    "sun_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/9/99/Map_of_the_full_sun.jpg",
    "mercurymap.jpg": BASE_THREEX + "mercurymap.jpg",
    "venusmap.jpg": BASE_THREEX + "venusmap.jpg",
    "earthmap1k.jpg": BASE_THREEX + "earthmap1k.jpg",
    "moonmap1k.jpg": BASE_THREEX + "moonmap1k.jpg",
    "marsmap1k.jpg": BASE_THREEX + "marsmap1k.jpg",
    "jupitermap.jpg": BASE_THREEX + "jupitermap.jpg",
    "saturnmap.jpg": BASE_THREEX + "saturnmap.jpg",
    "uranusmap.jpg": BASE_THREEX + "uranusmap.jpg",
    "neptunemap.jpg": BASE_THREEX + "neptunemap.jpg",
    # Moon textures from various sources
    "io.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Io_highest_resolution_true_color.jpg/600px-Io_highest_resolution_true_color.jpg",
    "europa.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Europa-moon-with-margins.jpg/600px-Europa-moon-with-margins.jpg",
    "ganymede.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Ganymede_g1_true-edit1.jpg/600px-Ganymede_g1_true-edit1.jpg",
    "callisto.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Callisto.jpg/600px-Callisto.jpg",
    "titan.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Titan_in_true_color.jpg/600px-Titan_in_true_color.jpg",
    "enceladus.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Enceladus_from_Voyager.jpg/600px-Enceladus_from_Voyager.jpg",
    "mimas.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Mimas_Cassini.jpg/600px-Mimas_Cassini.jpg",
    "phobos.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Phobos_colour_2008.jpg/600px-Phobos_colour_2008.jpg",
    "deimos.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Deimos-MRO.jpg/600px-Deimos-MRO.jpg",
    "titania.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Titania_%28moon%29_color%2C_edited.jpg/600px-Titania_%28moon%29_color%2C_edited.jpg",
    "oberon.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oberon_USGS.jpg/600px-Oberon_USGS.jpg",
    "triton.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Triton_moon_mosaic_Voyager_2_%28large%29.jpg/600px-Triton_moon_mosaic_Voyager_2_%28large%29.jpg",
}

def download_file(url, filename):
    try:
        print(f"Downloading {filename}...")
        # Add User-Agent to avoid 403 Forbidden on some servers
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0')]
        urllib.request.install_opener(opener)
        
        urllib.request.urlretrieve(url, os.path.join(TARGET_DIR, filename))
        print(f"Success: {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

if __name__ == "__main__":
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)
        
    for filename, url in TEXTURES.items():
        download_file(url, filename)
