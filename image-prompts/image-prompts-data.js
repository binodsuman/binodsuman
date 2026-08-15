const IMAGE_PROMPT_CATEGORIES = [
  {
    "id": "anime-cartoon",
    "name": "Anime & Cartoon"
  },
  {
    "id": "painting-drawing",
    "name": "Painting & Drawing"
  },
  {
    "id": "nature-landscapes",
    "name": "Nature & Landscapes"
  },
  {
    "id": "street-daily",
    "name": "Street & Daily Life"
  },
  {
    "id": "cinematography",
    "name": "Cinematography"
  },
  {
    "id": "portraits-people",
    "name": "Portraits & People"
  },
  {
    "id": "product-food",
    "name": "Product & Food"
  },
  {
    "id": "cityscape-architecture",
    "name": "Cityscape & Architecture"
  },
  {
    "id": "scifi-futuristic",
    "name": "Sci-Fi & Futuristic"
  },
  {
    "id": "3d-render",
    "name": "3D & Render"
  },
  {
    "id": "ui-tech",
    "name": "UI & Tech"
  },
  {
    "id": "mixed-media",
    "name": "Mixed Media"
  }
];

const IMAGE_PROMPTS = [
  {
    "id": 1,
    "cmd": "mangacover",
    "desc": "Manga-style book cover",
    "category": "anime-cartoon"
  },
  {
    "id": 2,
    "cmd": "ghibli",
    "desc": "Whimsical anime aesthetic",
    "category": "anime-cartoon"
  },
  {
    "id": 3,
    "cmd": "disney",
    "desc": "Animated fairy-tale style",
    "category": "anime-cartoon"
  },
  {
    "id": 4,
    "cmd": "watercolor",
    "desc": "Artistic watercolor painting",
    "category": "painting-drawing"
  },
  {
    "id": 5,
    "cmd": "oilpaint",
    "desc": "Classical oil painting",
    "category": "painting-drawing"
  },
  {
    "id": 6,
    "cmd": "caricature",
    "desc": "Fun exaggerated portrait",
    "category": "portraits-people"
  },
  {
    "id": 7,
    "cmd": "autumn",
    "desc": "Fall foliage and ambience",
    "category": "nature-landscapes"
  },
  {
    "id": 8,
    "cmd": "sunsetbeach",
    "desc": "Golden hour coastal scene",
    "category": "nature-landscapes"
  },
  {
    "id": 9,
    "cmd": "photorealistic",
    "desc": "Ultra-realistic image style",
    "category": "cinematography"
  },
  {
    "id": 10,
    "cmd": "hyperrealistic",
    "desc": "Extreme realism",
    "category": "mixed-media"
  },
  {
    "id": 11,
    "cmd": "cinematicphoto",
    "desc": "Movie-like photograph",
    "category": "cinematography"
  },
  {
    "id": 12,
    "cmd": "portrait",
    "desc": "Professional portrait",
    "category": "portraits-people"
  },
  {
    "id": 13,
    "cmd": "headshot",
    "desc": "Corporate headshot",
    "category": "portraits-people"
  },
  {
    "id": 14,
    "cmd": "editorial",
    "desc": "Magazine editorial look",
    "category": "portraits-people"
  },
  {
    "id": 15,
    "cmd": "fashion",
    "desc": "Fashion photography style",
    "category": "cinematography"
  },
  {
    "id": 16,
    "cmd": "lifestyle",
    "desc": "Lifestyle photography",
    "category": "street-daily"
  },
  {
    "id": 17,
    "cmd": "streetphoto",
    "desc": "Street photography",
    "category": "street-daily"
  },
  {
    "id": 18,
    "cmd": "travelphoto",
    "desc": "Travel photography",
    "category": "street-daily"
  },
  {
    "id": 19,
    "cmd": "wildlife",
    "desc": "Wildlife photography",
    "category": "nature-landscapes"
  },
  {
    "id": 20,
    "cmd": "macrophoto",
    "desc": "Macro photography",
    "category": "cinematography"
  },
  {
    "id": 21,
    "cmd": "droneview",
    "desc": "Drone aerial shot",
    "category": "cinematography"
  },
  {
    "id": 22,
    "cmd": "360drone",
    "desc": "360\u00b0 aerial concept",
    "category": "cinematography"
  },
  {
    "id": 23,
    "cmd": "topdown",
    "desc": "Top-down composition",
    "category": "mixed-media"
  },
  {
    "id": 24,
    "cmd": "lowangle",
    "desc": "Low-angle perspective",
    "category": "cinematography"
  },
  {
    "id": 25,
    "cmd": "highangle",
    "desc": "High-angle perspective",
    "category": "cinematography"
  },
  {
    "id": 26,
    "cmd": "wideangle",
    "desc": "Wide-angle lens look",
    "category": "cinematography"
  },
  {
    "id": 27,
    "cmd": "telephoto",
    "desc": "Telephoto compression",
    "category": "cinematography"
  },
  {
    "id": 28,
    "cmd": "fisheye",
    "desc": "Fisheye lens effect",
    "category": "cinematography"
  },
  {
    "id": 29,
    "cmd": "depthoffield",
    "desc": "Shallow depth of field",
    "category": "cinematography"
  },
  {
    "id": 30,
    "cmd": "bokeh",
    "desc": "Soft blurred background",
    "category": "cinematography"
  },
  {
    "id": 31,
    "cmd": "goldenhour",
    "desc": "Golden hour lighting",
    "category": "cinematography"
  },
  {
    "id": 32,
    "cmd": "bluehour",
    "desc": "Blue hour lighting",
    "category": "cinematography"
  },
  {
    "id": 33,
    "cmd": "sunset",
    "desc": "Sunset lighting",
    "category": "nature-landscapes"
  },
  {
    "id": 34,
    "cmd": "sunrise",
    "desc": "Sunrise atmosphere",
    "category": "nature-landscapes"
  },
  {
    "id": 35,
    "cmd": "nightmode",
    "desc": "Night photography",
    "category": "cinematography"
  },
  {
    "id": 36,
    "cmd": "neon",
    "desc": "Neon lighting",
    "category": "cinematography"
  },
  {
    "id": 37,
    "cmd": "moody",
    "desc": "Dark cinematic mood",
    "category": "cinematography"
  },
  {
    "id": 38,
    "cmd": "dramaticlighting",
    "desc": "Strong dramatic light",
    "category": "cinematography"
  },
  {
    "id": 39,
    "cmd": "volumetriclight",
    "desc": "God rays and volumetric lighting",
    "category": "cinematography"
  },
  {
    "id": 40,
    "cmd": "rimlight",
    "desc": "Rim lighting",
    "category": "cinematography"
  },
  {
    "id": 41,
    "cmd": "silhouette",
    "desc": "Silhouette composition",
    "category": "cinematography"
  },
  {
    "id": 42,
    "cmd": "backlit",
    "desc": "Backlit subject",
    "category": "mixed-media"
  },
  {
    "id": 43,
    "cmd": "blackandwhite",
    "desc": "Monochrome style",
    "category": "mixed-media"
  },
  {
    "id": 44,
    "cmd": "filmgrain",
    "desc": "Vintage film grain",
    "category": "cinematography"
  },
  {
    "id": 45,
    "cmd": "kodak",
    "desc": "Kodak film aesthetic",
    "category": "cinematography"
  },
  {
    "id": 46,
    "cmd": "fujifilm",
    "desc": "Fujifilm color palette",
    "category": "cinematography"
  },
  {
    "id": 47,
    "cmd": "polaroid",
    "desc": "Polaroid instant photo style",
    "category": "cinematography"
  },
  {
    "id": 48,
    "cmd": "vintage",
    "desc": "Vintage aesthetic",
    "category": "cinematography"
  },
  {
    "id": 49,
    "cmd": "retro",
    "desc": "Retro design style",
    "category": "cinematography"
  },
  {
    "id": 50,
    "cmd": "80s",
    "desc": "1980s aesthetic",
    "category": "mixed-media"
  },
  {
    "id": 51,
    "cmd": "90s",
    "desc": "1990s aesthetic",
    "category": "mixed-media"
  },
  {
    "id": 52,
    "cmd": "cyberpunk",
    "desc": "Cyberpunk world",
    "category": "scifi-futuristic"
  },
  {
    "id": 53,
    "cmd": "steampunk",
    "desc": "Steampunk theme",
    "category": "scifi-futuristic"
  },
  {
    "id": 54,
    "cmd": "dieselpunk",
    "desc": "Dieselpunk aesthetic",
    "category": "scifi-futuristic"
  },
  {
    "id": 55,
    "cmd": "solarpunk",
    "desc": "Solarpunk future",
    "category": "scifi-futuristic"
  },
  {
    "id": 56,
    "cmd": "postapocalyptic",
    "desc": "Post-apocalyptic world",
    "category": "scifi-futuristic"
  },
  {
    "id": 57,
    "cmd": "fantasy",
    "desc": "Fantasy artwork",
    "category": "scifi-futuristic"
  },
  {
    "id": 58,
    "cmd": "scifi",
    "desc": "Science-fiction style",
    "category": "scifi-futuristic"
  },
  {
    "id": 59,
    "cmd": "space",
    "desc": "Outer space visuals",
    "category": "nature-landscapes"
  },
  {
    "id": 60,
    "cmd": "planet",
    "desc": "Planetary illustration",
    "category": "nature-landscapes"
  },
  {
    "id": 61,
    "cmd": "galaxy",
    "desc": "Galaxy visualization",
    "category": "nature-landscapes"
  },
  {
    "id": 62,
    "cmd": "nebula",
    "desc": "Nebula artwork",
    "category": "nature-landscapes"
  },
  {
    "id": 63,
    "cmd": "underwater",
    "desc": "Underwater scene",
    "category": "nature-landscapes"
  },
  {
    "id": 64,
    "cmd": "ocean",
    "desc": "Ocean landscape",
    "category": "nature-landscapes"
  },
  {
    "id": 65,
    "cmd": "mountains",
    "desc": "Mountain scenery",
    "category": "nature-landscapes"
  },
  {
    "id": 66,
    "cmd": "forest",
    "desc": "Forest landscape",
    "category": "nature-landscapes"
  },
  {
    "id": 67,
    "cmd": "desert",
    "desc": "Desert environment",
    "category": "nature-landscapes"
  },
  {
    "id": 68,
    "cmd": "cityscape",
    "desc": "Urban skyline",
    "category": "cityscape-architecture"
  },
  {
    "id": 69,
    "cmd": "architecturephoto",
    "desc": "Architectural photography",
    "category": "cinematography"
  },
  {
    "id": 70,
    "cmd": "interior",
    "desc": "Interior design visualization",
    "category": "cityscape-architecture"
  },
  {
    "id": 71,
    "cmd": "minimalinterior",
    "desc": "Minimal interior concept",
    "category": "cityscape-architecture"
  },
  {
    "id": 72,
    "cmd": "luxury",
    "desc": "Luxury aesthetic",
    "category": "cityscape-architecture"
  },
  {
    "id": 73,
    "cmd": "productphoto",
    "desc": "Professional product photography",
    "category": "cinematography"
  },
  {
    "id": 74,
    "cmd": "packaging",
    "desc": "Packaging mockup",
    "category": "product-food"
  },
  {
    "id": 75,
    "cmd": "advertising",
    "desc": "Advertising visual",
    "category": "product-food"
  },
  {
    "id": 76,
    "cmd": "billboard",
    "desc": "Billboard mockup",
    "category": "product-food"
  },
  {
    "id": 77,
    "cmd": "posterdesign",
    "desc": "Poster concept",
    "category": "mixed-media"
  },
  {
    "id": 78,
    "cmd": "brandingmockup",
    "desc": "Brand identity preview",
    "category": "product-food"
  },
  {
    "id": 79,
    "cmd": "logo",
    "desc": "Logo concepts",
    "category": "product-food"
  },
  {
    "id": 80,
    "cmd": "iconset",
    "desc": "Custom icon set",
    "category": "mixed-media"
  },
  {
    "id": 81,
    "cmd": "mascot",
    "desc": "Mascot character",
    "category": "portraits-people"
  },
  {
    "id": 82,
    "cmd": "characterdesign",
    "desc": "Original character",
    "category": "portraits-people"
  },
  {
    "id": 83,
    "cmd": "conceptart",
    "desc": "Concept art",
    "category": "mixed-media"
  },
  {
    "id": 84,
    "cmd": "environmentart",
    "desc": "Environment concept art",
    "category": "mixed-media"
  },
  {
    "id": 85,
    "cmd": "mattepainting",
    "desc": "Matte painting style",
    "category": "painting-drawing"
  },
  {
    "id": 86,
    "cmd": "digitalpainting",
    "desc": "Digital art",
    "category": "painting-drawing"
  },
  {
    "id": 87,
    "cmd": "oilpainting",
    "desc": "Oil painting style",
    "category": "painting-drawing"
  },
  {
    "id": 88,
    "cmd": "acrylic",
    "desc": "Acrylic painting",
    "category": "painting-drawing"
  },
  {
    "id": 89,
    "cmd": "charcoal",
    "desc": "Charcoal sketch",
    "category": "painting-drawing"
  },
  {
    "id": 90,
    "cmd": "pencilsketch",
    "desc": "Pencil drawing",
    "category": "painting-drawing"
  },
  {
    "id": 91,
    "cmd": "inkdrawing",
    "desc": "Ink illustration",
    "category": "painting-drawing"
  },
  {
    "id": 92,
    "cmd": "crosshatching",
    "desc": "Cross-hatching style",
    "category": "mixed-media"
  },
  {
    "id": 93,
    "cmd": "comicbook",
    "desc": "Comic book art",
    "category": "anime-cartoon"
  },
  {
    "id": 94,
    "cmd": "manga",
    "desc": "Manga style",
    "category": "anime-cartoon"
  },
  {
    "id": 95,
    "cmd": "anime",
    "desc": "Anime artwork",
    "category": "anime-cartoon"
  },
  {
    "id": 96,
    "cmd": "pixar",
    "desc": "3D animated family-film look",
    "category": "anime-cartoon"
  },
  {
    "id": 97,
    "cmd": "lowpoly",
    "desc": "Low-poly 3D",
    "category": "3d-render"
  },
  {
    "id": 98,
    "cmd": "voxel",
    "desc": "Voxel art",
    "category": "3d-render"
  },
  {
    "id": 99,
    "cmd": "pixelart",
    "desc": "Pixel art",
    "category": "3d-render"
  },
  {
    "id": 100,
    "cmd": "clayrender",
    "desc": "Clay render",
    "category": "3d-render"
  },
  {
    "id": 101,
    "cmd": "3drender",
    "desc": "Photorealistic 3D render",
    "category": "cinematography"
  },
  {
    "id": 102,
    "cmd": "octanerender",
    "desc": "Octane-style render look",
    "category": "3d-render"
  },
  {
    "id": 103,
    "cmd": "unrealengine",
    "desc": "Unreal Engine cinematic look",
    "category": "cinematography"
  },
  {
    "id": 104,
    "cmd": "blender",
    "desc": "Blender 3D visualization",
    "category": "3d-render"
  },
  {
    "id": 105,
    "cmd": "midjourneystyle",
    "desc": "Prompt styled for Midjourney-like aesthetics",
    "category": "ui-tech"
  },
  {
    "id": 106,
    "cmd": "imageprompt",
    "desc": "Convert an idea into a detailed AI image prompt",
    "category": "ui-tech"
  }
];
