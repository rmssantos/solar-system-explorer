const EN = Object.freeze({
    sun: ['Sun', 'Star', 'Our star contains almost all the mass in the Solar System and powers life on Earth.'],
    mercury: ['Mercury', 'Planet', 'Mercury is the closest planet to the Sun and has a heavily cratered surface.'],
    venus: ['Venus', 'Planet', 'Venus is the hottest planet because of its intense greenhouse atmosphere.'],
    earth: ['Earth', 'Planet', 'Earth is the only known world with liquid-water oceans and abundant life.'],
    mars: ['Mars', 'Planet', 'Mars preserves giant volcanoes, deep valleys and evidence of ancient water.'],
    jupiter: ['Jupiter', 'Planet', 'Jupiter is the largest planet and its Great Red Spot is a colossal storm.'],
    saturn: ['Saturn', 'Planet', 'Saturn’s rings are made of countless fragments of ice and rock.'],
    uranus: ['Uranus', 'Planet', 'Uranus rotates almost on its side, probably because of an ancient collision.'],
    neptune: ['Neptune', 'Planet', 'Neptune has some of the fastest winds ever measured in the Solar System.'],
    moon: ['Moon', 'Moon', 'The Moon stabilises Earth’s tilt and is the only world beyond Earth where humans have walked.'],
    phobos: ['Phobos', 'Moon', 'Phobos moves around Mars so quickly that it rises in the west and sets in the east.'],
    deimos: ['Deimos', 'Moon', 'Deimos is a small irregular moon of Mars covered by a thick layer of dust.'],
    io: ['Io', 'Moon', 'Io is the most volcanically active known world in the Solar System.'],
    europa: ['Europa', 'Moon', 'Europa probably hides a global salt-water ocean beneath its icy crust.'],
    ganymede: ['Ganymede', 'Moon', 'Ganymede is the largest moon in the Solar System and has its own magnetic field.'],
    callisto: ['Callisto', 'Moon', 'Callisto has one of the oldest and most cratered surfaces in the Solar System.'],
    mimas: ['Mimas', 'Moon', 'The enormous Herschel crater gives Mimas an unmistakable silhouette.'],
    enceladus: ['Enceladus', 'Moon', 'Enceladus sprays water and ice from an ocean hidden beneath its surface.'],
    titan: ['Titan', 'Moon', 'Titan has a dense atmosphere and lakes of liquid methane and ethane.'],
    iapetus: ['Iapetus', 'Moon', 'Iapetus has one very dark hemisphere, one bright hemisphere and a huge equatorial ridge.'],
    titania: ['Titania', 'Moon', 'Titania is the largest moon of Uranus and shows enormous faults and canyons.'],
    oberon: ['Oberon', 'Moon', 'Oberon is an icy, cratered moon orbiting far above the clouds of Uranus.'],
    triton: ['Triton', 'Moon', 'Triton orbits Neptune backwards and has nitrogen geysers on its icy surface.'],
    iss: ['International Space Station', 'Human object', 'The ISS is a crewed laboratory that circles Earth roughly every 90 minutes.'],
    hubble: ['Hubble Space Telescope', 'Human object', 'Hubble has observed the Universe above most of Earth’s atmosphere since 1990.'],
    jwst: ['James Webb Space Telescope', 'Human object', 'James Webb observes mainly in infrared near the gravitational balance point L2.'],
    'voyager-1': ['Voyager 1', 'Human object', 'Voyager 1 is the most distant human-made object and now explores interstellar space.'],
    'tesla-roadster': ['Tesla Roadster and Starman', 'Human object', 'The Roadster launched on Falcon Heavy follows a heliocentric orbit that crosses the orbit of Mars.'],
    ceres: ['Ceres', 'Small body', 'Ceres is the largest object in the asteroid belt and a dwarf planet with signs of salty water.'],
    vesta: ['Vesta', 'Small body', 'Vesta is one of the largest asteroids and has an enormous impact basin in its southern hemisphere.'],
    bennu: ['Bennu', 'Small body', 'OSIRIS-REx delivered a sample of asteroid Bennu to Earth in 2023.'],
    apophis: ['Apophis', 'Small body', 'Apophis will pass very close to Earth in 2029, without a collision risk on that flyby.'],
    halley: ['Halley’s Comet', 'Small body', 'Halley’s Comet returns to the inner Solar System about every 76 years.'],
    '67p': ['Comet 67P', 'Small body', 'Rosetta accompanied comet 67P and placed the Philae lander on its surface.'],
    chelyabinsk: ['Chelyabinsk meteor', 'Small body', 'The Chelyabinsk meteor exploded in the atmosphere in 2013 and its shockwave broke thousands of windows.'],
    tunguska: ['Tunguska echo', 'Small body', 'The 1908 Tunguska event flattened a huge area of forest, probably after an airburst.'],
    hoba: ['Hoba meteorite — archive', 'Small body', 'Hoba remains in Namibia and is the largest known intact meteorite; here it appears as an educational marker.']
});

export function translateWorldObject(object, language = 'pt') {
    if (!object || language !== 'en') return object;
    const translation = EN[object.key];
    if (!translation) return object;
    return Object.freeze({ ...object, name: translation[0], typeLabel: translation[1], fact: translation[2] });
}

