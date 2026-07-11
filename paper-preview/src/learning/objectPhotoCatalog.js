function nasaPhoto(nasaId, sourceName = 'NASA/JPL-Caltech') {
    return Object.freeze({
        localPhoto: null,
        sourceName,
        sourceUrl: `https://images.nasa.gov/details/${nasaId}`,
        nasaId
    });
}

const entries = {
    moon: nasaPhoto('GSFC_20171208_Archive_e001861', 'NASA/GSFC'),
    phobos: nasaPhoto('GSFC_20171208_Archive_e000505', 'NASA/JPL-Caltech/University of Arizona'),
    deimos: nasaPhoto('PIA08667', 'NASA/JPL/Malin Space Science Systems'),
    io: nasaPhoto('PIA00023', 'NASA/JPL'),
    europa: nasaPhoto('PIA00016', 'NASA/JPL'),
    ganymede: nasaPhoto('PIA00353', 'NASA/JPL'),
    callisto: nasaPhoto('PIA03456', 'NASA/JPL/DLR'),
    mimas: nasaPhoto('PIA12574', 'NASA/JPL/Space Science Institute'),
    enceladus: nasaPhoto('PIA00347', 'NASA/JPL'),
    titan: nasaPhoto('PIA06230', 'NASA/JPL/Space Science Institute'),
    iapetus: nasaPhoto('PIA12521', 'NASA/JPL/Space Science Institute'),
    titania: nasaPhoto('PIA01979', 'NASA/JPL'),
    oberon: nasaPhoto('PIA00034', 'NASA/JPL'),
    triton: nasaPhoto('PIA18668', 'NASA/JPL-Caltech/Lunar & Planetary Institute'),
    iss: nasaPhoto('s88e5157', 'NASA'),
    hubble: nasaPhoto('STS061-79-087', 'NASA'),
    jwst: nasaPhoto('GSFC_20171208_Archive_e000422', 'NASA/Chris Gunn'),
    'voyager-1': nasaPhoto('PIA21743', 'NASA/JPL-Caltech'),
    'tesla-roadster': Object.freeze({
        localPhoto: null,
        sourceName: 'SpaceX — CC0 via Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elon_Musk%27s_Tesla_Roadster_(40110297852).jpg',
        commonsFile: "Elon Musk's Tesla Roadster (40110297852).jpg"
    }),
    ceres: nasaPhoto('PIA21906', 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA'),
    vesta: nasaPhoto('PIA15678', 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA'),
    bennu: Object.freeze({
        localPhoto: null,
        sourceName: 'NASA/Goddard/University of Arizona',
        sourceUrl: 'https://science.nasa.gov/resource/bennu-mosaic/',
        pageImage: true
    }),
    apophis: nasaPhoto('PIA24168', 'NASA/JPL-Caltech and NSF/AUI/GBO'),
    halley: nasaPhoto('PIA17485', 'ESA/Max Planck Institute/NASA'),
    '67p': nasaPhoto('PIA21068', 'ESA/Rosetta/NAVCAM'),
    chelyabinsk: nasaPhoto('PIA16828', 'M. Ahmetvaleev/NASA'),
    tunguska: Object.freeze({
        localPhoto: null,
        sourceName: 'Leonid Kulik expedition — public domain via Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tunguska_Ereignis-1.jpg',
        commonsFile: 'Tunguska Ereignis-1.jpg'
    }),
    hoba: Object.freeze({
        localPhoto: null,
        sourceName: 'Thomas Quine — CC BY 2.0 via Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hoba_meteorite_(15062762703).jpg',
        commonsFile: 'Hoba meteorite (15062762703).jpg'
    })
};

export const OBJECT_PHOTOS = Object.freeze(Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, Object.freeze({
        ...value,
        localPhoto: `/learning/objects/${key}.jpg`
    })])
));

export function getObjectPhoto(key) {
    return OBJECT_PHOTOS[key] ?? null;
}
