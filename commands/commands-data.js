const COMMAND_CATEGORIES = [
  {
    "id": "foundations",
    "name": "Foundations",
    "short": "Foundations"
  },
  {
    "id": "content",
    "name": "Content & Growth",
    "short": "Content & Growth"
  },
  {
    "id": "visual",
    "name": "Visual & Image Prompting",
    "short": "Visual & Image Prompting"
  },
  {
    "id": "writing",
    "name": "Writing, Productivity & Code",
    "short": "Writing, Productivity & Code"
  },
  {
    "id": "creative",
    "name": "Creative Thinking & Advanced Prompting",
    "short": "Creative Thinking & Advanced Prompting"
  }
];

const COMMANDS = [
  {
    "id": 1,
    "cmd": "handwritten",
    "desc": "Notebook-style handwritten notes",
    "category": "foundations"
  },
  {
    "id": 2,
    "cmd": "visualize",
    "desc": "Turn ideas into visual explanations",
    "category": "foundations"
  },
  {
    "id": 3,
    "cmd": "stickynotes",
    "desc": "One idea per sticky note",
    "category": "foundations"
  },
  {
    "id": 4,
    "cmd": "infographic",
    "desc": "Infographic layout",
    "category": "foundations"
  },
  {
    "id": 5,
    "cmd": "diagram",
    "desc": "Draw a concept diagram",
    "category": "foundations"
  },
  {
    "id": 6,
    "cmd": "flowchart",
    "desc": "Step-by-step flowchart",
    "category": "foundations"
  },
  {
    "id": 7,
    "cmd": "mindmap",
    "desc": "Create a mind map",
    "category": "foundations"
  },
  {
    "id": 8,
    "cmd": "xray",
    "desc": "Show internal structure",
    "category": "foundations"
  },
  {
    "id": 9,
    "cmd": "blueprint",
    "desc": "Technical blueprint",
    "category": "foundations"
  },
  {
    "id": 10,
    "cmd": "explodedview",
    "desc": "Break object into components",
    "category": "foundations"
  },
  {
    "id": 11,
    "cmd": "thenvsnow",
    "desc": "Compare past vs present",
    "category": "foundations"
  },
  {
    "id": 12,
    "cmd": "timeline",
    "desc": "Chronological timeline",
    "category": "foundations"
  },
  {
    "id": 13,
    "cmd": "beforeafter",
    "desc": "Transformation comparison",
    "category": "foundations"
  },
  {
    "id": 14,
    "cmd": "cutaway",
    "desc": "Cutaway illustration",
    "category": "foundations"
  },
  {
    "id": 15,
    "cmd": "anatomy",
    "desc": "Explain all parts",
    "category": "foundations"
  },
  {
    "id": 16,
    "cmd": "layers",
    "desc": "Layer-by-layer architecture",
    "category": "foundations"
  },
  {
    "id": 17,
    "cmd": "ecosystem",
    "desc": "Show all connected players",
    "category": "foundations"
  },
  {
    "id": 18,
    "cmd": "journey",
    "desc": "End-to-end journey",
    "category": "foundations"
  },
  {
    "id": 19,
    "cmd": "process",
    "desc": "Explain a complete process",
    "category": "foundations"
  },
  {
    "id": 20,
    "cmd": "cycle",
    "desc": "Visualize recurring cycles",
    "category": "foundations"
  },
  {
    "id": 21,
    "cmd": "roadmap",
    "desc": "Learning or execution roadmap",
    "category": "foundations"
  },
  {
    "id": 22,
    "cmd": "dashboard",
    "desc": "Dashboard with KPIs",
    "category": "foundations"
  },
  {
    "id": 23,
    "cmd": "comparison",
    "desc": "Side-by-side comparison",
    "category": "foundations"
  },
  {
    "id": 24,
    "cmd": "versus",
    "desc": "Head-to-head battle format",
    "category": "foundations"
  },
  {
    "id": 25,
    "cmd": "scale",
    "desc": "Compare sizes visually",
    "category": "foundations"
  },
  {
    "id": 26,
    "cmd": "evolution",
    "desc": "Show evolution over time",
    "category": "foundations"
  },
  {
    "id": 27,
    "cmd": "future",
    "desc": "Imagine future scenarios",
    "category": "foundations"
  },
  {
    "id": 28,
    "cmd": "inside",
    "desc": "Reveal inner workings",
    "category": "foundations"
  },
  {
    "id": 29,
    "cmd": "microscopic",
    "desc": "Zoom into microscopic view",
    "category": "foundations"
  },
  {
    "id": 30,
    "cmd": "macroscopic",
    "desc": "Zoom out to system level",
    "category": "foundations"
  },
  {
    "id": 31,
    "cmd": "crosssection",
    "desc": "Cross-sectional illustration",
    "category": "foundations"
  },
  {
    "id": 32,
    "cmd": "map",
    "desc": "Geographic or concept map",
    "category": "foundations"
  },
  {
    "id": 33,
    "cmd": "heatmap",
    "desc": "Intensity visualization",
    "category": "foundations"
  },
  {
    "id": 34,
    "cmd": "network",
    "desc": "Relationship network",
    "category": "foundations"
  },
  {
    "id": 35,
    "cmd": "architecture",
    "desc": "Software/system architecture",
    "category": "foundations"
  },
  {
    "id": 36,
    "cmd": "wireframe",
    "desc": "Website/app layout",
    "category": "foundations"
  },
  {
    "id": 37,
    "cmd": "mockup",
    "desc": "Realistic product preview",
    "category": "foundations"
  },
  {
    "id": 38,
    "cmd": "prototype",
    "desc": "Early product concept",
    "category": "foundations"
  },
  {
    "id": 39,
    "cmd": "schematic",
    "desc": "Simple technical schematic",
    "category": "foundations"
  },
  {
    "id": 40,
    "cmd": "isometric",
    "desc": "3D isometric illustration",
    "category": "foundations"
  },
  {
    "id": 41,
    "cmd": "birdseye",
    "desc": "Top-down view",
    "category": "foundations"
  },
  {
    "id": 42,
    "cmd": "360view",
    "desc": "All-angle visualization",
    "category": "foundations"
  },
  {
    "id": 43,
    "cmd": "storyboard",
    "desc": "Scene-by-scene storyboard",
    "category": "foundations"
  },
  {
    "id": 44,
    "cmd": "comic",
    "desc": "Explain through comic panels",
    "category": "foundations"
  },
  {
    "id": 45,
    "cmd": "poster",
    "desc": "Poster design",
    "category": "foundations"
  },
  {
    "id": 46,
    "cmd": "cover",
    "desc": "Book/report cover",
    "category": "foundations"
  },
  {
    "id": 47,
    "cmd": "adcreative",
    "desc": "Advertising concept",
    "category": "foundations"
  },
  {
    "id": 48,
    "cmd": "thumbnail",
    "desc": "YouTube thumbnail concept",
    "category": "foundations"
  },
  {
    "id": 49,
    "cmd": "carousel",
    "desc": "Instagram/LinkedIn carousel",
    "category": "foundations"
  },
  {
    "id": 50,
    "cmd": "socialvisual",
    "desc": "Social media graphic",
    "category": "foundations"
  },
  {
    "id": 51,
    "cmd": "quotevisual",
    "desc": "Quote as shareable visual",
    "category": "foundations"
  },
  {
    "id": 52,
    "cmd": "eli5",
    "desc": "Explain simply",
    "category": "foundations"
  },
  {
    "id": 53,
    "cmd": "expert",
    "desc": "Expert-level explanation",
    "category": "foundations"
  },
  {
    "id": 54,
    "cmd": "firstprinciples",
    "desc": "Break to fundamentals",
    "category": "foundations"
  },
  {
    "id": 55,
    "cmd": "deepdive",
    "desc": "Comprehensive explanation",
    "category": "foundations"
  },
  {
    "id": 56,
    "cmd": "simplify",
    "desc": "Simplify difficult content",
    "category": "foundations"
  },
  {
    "id": 57,
    "cmd": "analogy",
    "desc": "Explain with analogy",
    "category": "foundations"
  },
  {
    "id": 58,
    "cmd": "socratic",
    "desc": "Teach using questions",
    "category": "foundations"
  },
  {
    "id": 59,
    "cmd": "teachme",
    "desc": "Structured tutoring",
    "category": "foundations"
  },
  {
    "id": 60,
    "cmd": "cheatsheet",
    "desc": "Quick-reference notes",
    "category": "foundations"
  },
  {
    "id": 61,
    "cmd": "flashcards",
    "desc": "Study flashcards",
    "category": "foundations"
  },
  {
    "id": 62,
    "cmd": "quiz",
    "desc": "Generate quiz",
    "category": "foundations"
  },
  {
    "id": 63,
    "cmd": "viva",
    "desc": "Viva preparation",
    "category": "foundations"
  },
  {
    "id": 64,
    "cmd": "interview",
    "desc": "Mock interview",
    "category": "foundations"
  },
  {
    "id": 65,
    "cmd": "devilsadvocate",
    "desc": "Challenge assumptions",
    "category": "foundations"
  },
  {
    "id": 66,
    "cmd": "factcheck",
    "desc": "Verify claims",
    "category": "foundations"
  },
  {
    "id": 67,
    "cmd": "mythvsfact",
    "desc": "Separate myths from facts",
    "category": "foundations"
  },
  {
    "id": 68,
    "cmd": "proscons",
    "desc": "Advantages vs disadvantages",
    "category": "foundations"
  },
  {
    "id": 69,
    "cmd": "swot",
    "desc": "SWOT analysis",
    "category": "foundations"
  },
  {
    "id": 70,
    "cmd": "pestle",
    "desc": "PESTLE analysis",
    "category": "foundations"
  },
  {
    "id": 71,
    "cmd": "fiveforces",
    "desc": "Porter's Five Forces",
    "category": "foundations"
  },
  {
    "id": 72,
    "cmd": "rootcause",
    "desc": "Find root cause",
    "category": "foundations"
  },
  {
    "id": 73,
    "cmd": "fivewhys",
    "desc": "5 Why analysis",
    "category": "foundations"
  },
  {
    "id": 74,
    "cmd": "decisionmatrix",
    "desc": "Weighted decision matrix",
    "category": "foundations"
  },
  {
    "id": 75,
    "cmd": "scenario",
    "desc": "Scenario planning",
    "category": "foundations"
  },
  {
    "id": 76,
    "cmd": "simulate",
    "desc": "Simulation exercise",
    "category": "foundations"
  },
  {
    "id": 77,
    "cmd": "roleplay",
    "desc": "Assume an expert role",
    "category": "foundations"
  },
  {
    "id": 78,
    "cmd": "consultant",
    "desc": "Consulting-style advice",
    "category": "foundations"
  },
  {
    "id": 79,
    "cmd": "executivebrief",
    "desc": "Executive summary",
    "category": "foundations"
  },
  {
    "id": 80,
    "cmd": "insights",
    "desc": "Extract insights",
    "category": "foundations"
  },
  {
    "id": 81,
    "cmd": "recommendations",
    "desc": "Provide recommendations",
    "category": "foundations"
  },
  {
    "id": 82,
    "cmd": "prioritize",
    "desc": "Rank by priority",
    "category": "foundations"
  },
  {
    "id": 83,
    "cmd": "benchmark",
    "desc": "Benchmark comparison",
    "category": "foundations"
  },
  {
    "id": 84,
    "cmd": "marketmap",
    "desc": "Industry landscape",
    "category": "foundations"
  },
  {
    "id": 85,
    "cmd": "strategy",
    "desc": "Strategic planning",
    "category": "foundations"
  },
  {
    "id": 86,
    "cmd": "businessmodel",
    "desc": "Business model explanation",
    "category": "foundations"
  },
  {
    "id": 87,
    "cmd": "pitch",
    "desc": "Investor/startup pitch",
    "category": "foundations"
  },
  {
    "id": 88,
    "cmd": "investor",
    "desc": "Investor perspective",
    "category": "foundations"
  },
  {
    "id": 89,
    "cmd": "redteam",
    "desc": "Stress-test a plan",
    "category": "foundations"
  },
  {
    "id": 90,
    "cmd": "premortem",
    "desc": "Assume failure and analyze why",
    "category": "foundations"
  },
  {
    "id": 91,
    "cmd": "reverseengineer",
    "desc": "Break down success",
    "category": "foundations"
  },
  {
    "id": 92,
    "cmd": "promptengineer",
    "desc": "Optimize prompts",
    "category": "foundations"
  },
  {
    "id": 93,
    "cmd": "research",
    "desc": "Structured research",
    "category": "foundations"
  },
  {
    "id": 94,
    "cmd": "sources",
    "desc": "Find reliable sources",
    "category": "foundations"
  },
  {
    "id": 95,
    "cmd": "summarize",
    "desc": "Summarize content",
    "category": "foundations"
  },
  {
    "id": 96,
    "cmd": "extract",
    "desc": "Extract key information",
    "category": "foundations"
  },
  {
    "id": 97,
    "cmd": "table",
    "desc": "Convert into table",
    "category": "foundations"
  },
  {
    "id": 98,
    "cmd": "presentation",
    "desc": "Presentation outline",
    "category": "foundations"
  },
  {
    "id": 99,
    "cmd": "dashboardanalysis",
    "desc": "Analyze dashboards",
    "category": "foundations"
  },
  {
    "id": 100,
    "cmd": "actionplan",
    "desc": "Create step-by-step action plan",
    "category": "foundations"
  },
  {
    "id": 101,
    "cmd": "viral",
    "desc": "Rewrite for maximum virality",
    "category": "content"
  },
  {
    "id": 102,
    "cmd": "viralreel",
    "desc": "Create a high-retention Instagram Reel",
    "category": "content"
  },
  {
    "id": 103,
    "cmd": "viralshorts",
    "desc": "Optimize for YouTube Shorts",
    "category": "content"
  },
  {
    "id": 104,
    "cmd": "viralhook",
    "desc": "Generate a scroll-stopping hook",
    "category": "content"
  },
  {
    "id": 105,
    "cmd": "hook",
    "desc": "Write opening lines",
    "category": "content"
  },
  {
    "id": 106,
    "cmd": "hook10",
    "desc": "Generate 10 hook options",
    "category": "content"
  },
  {
    "id": 107,
    "cmd": "hook50",
    "desc": "Generate 50 hook ideas",
    "category": "content"
  },
  {
    "id": 108,
    "cmd": "retention",
    "desc": "Improve audience retention",
    "category": "content"
  },
  {
    "id": 109,
    "cmd": "retentioncurve",
    "desc": "Plan engagement across the content",
    "category": "content"
  },
  {
    "id": 110,
    "cmd": "patterninterrupt",
    "desc": "Add attention-grabbing interruptions",
    "category": "content"
  },
  {
    "id": 111,
    "cmd": "openloop",
    "desc": "Create curiosity loops",
    "category": "content"
  },
  {
    "id": 112,
    "cmd": "curiosity",
    "desc": "Increase curiosity",
    "category": "content"
  },
  {
    "id": 113,
    "cmd": "psychology",
    "desc": "Apply psychological principles",
    "category": "content"
  },
  {
    "id": 114,
    "cmd": "dopamine",
    "desc": "Make content more rewarding",
    "category": "content"
  },
  {
    "id": 115,
    "cmd": "emotion",
    "desc": "Increase emotional impact",
    "category": "content"
  },
  {
    "id": 116,
    "cmd": "fear",
    "desc": "Use fear ethically",
    "category": "content"
  },
  {
    "id": 117,
    "cmd": "surprise",
    "desc": "Add surprising twists",
    "category": "content"
  },
  {
    "id": 118,
    "cmd": "shock",
    "desc": "Create a shocking opener",
    "category": "content"
  },
  {
    "id": 119,
    "cmd": "storytelling",
    "desc": "Narrative storytelling",
    "category": "content"
  },
  {
    "id": 120,
    "cmd": "herojourney",
    "desc": "Hero's Journey structure",
    "category": "content"
  },
  {
    "id": 121,
    "cmd": "script",
    "desc": "Generate a script",
    "category": "content"
  },
  {
    "id": 122,
    "cmd": "script30",
    "desc": "30-second script",
    "category": "content"
  },
  {
    "id": 123,
    "cmd": "script60",
    "desc": "60-second script",
    "category": "content"
  },
  {
    "id": 124,
    "cmd": "script90",
    "desc": "90-second script",
    "category": "content"
  },
  {
    "id": 125,
    "cmd": "script180",
    "desc": "3-minute script",
    "category": "content"
  },
  {
    "id": 126,
    "cmd": "narration",
    "desc": "Voice-over script",
    "category": "content"
  },
  {
    "id": 127,
    "cmd": "voiceover",
    "desc": "Natural narration",
    "category": "content"
  },
  {
    "id": 128,
    "cmd": "monologue",
    "desc": "Single-speaker script",
    "category": "content"
  },
  {
    "id": 129,
    "cmd": "dialogue",
    "desc": "Conversation format",
    "category": "content"
  },
  {
    "id": 130,
    "cmd": "podcast",
    "desc": "Podcast episode outline",
    "category": "content"
  },
  {
    "id": 131,
    "cmd": "youtube",
    "desc": "Long-form YouTube format",
    "category": "content"
  },
  {
    "id": 132,
    "cmd": "shorts",
    "desc": "YouTube Shorts style",
    "category": "content"
  },
  {
    "id": 133,
    "cmd": "reels",
    "desc": "Instagram Reels style",
    "category": "content"
  },
  {
    "id": 134,
    "cmd": "tiktok",
    "desc": "TikTok style",
    "category": "content"
  },
  {
    "id": 135,
    "cmd": "linkedin",
    "desc": "LinkedIn post",
    "category": "content"
  },
  {
    "id": 136,
    "cmd": "twitter",
    "desc": "X (Twitter) thread/post",
    "category": "content"
  },
  {
    "id": 137,
    "cmd": "facebook",
    "desc": "Facebook-friendly post",
    "category": "content"
  },
  {
    "id": 138,
    "cmd": "instagram",
    "desc": "Instagram caption",
    "category": "content"
  },
  {
    "id": 139,
    "cmd": "caption",
    "desc": "Generate captions",
    "category": "content"
  },
  {
    "id": 140,
    "cmd": "caption10",
    "desc": "10 caption ideas",
    "category": "content"
  },
  {
    "id": 141,
    "cmd": "hashtags",
    "desc": "Relevant hashtags",
    "category": "content"
  },
  {
    "id": 142,
    "cmd": "cta",
    "desc": "Call-to-action",
    "category": "content"
  },
  {
    "id": 143,
    "cmd": "engagement",
    "desc": "Increase comments/shares",
    "category": "content"
  },
  {
    "id": 144,
    "cmd": "shareworthy",
    "desc": "Make people share",
    "category": "content"
  },
  {
    "id": 145,
    "cmd": "saveworthy",
    "desc": "Make people save",
    "category": "content"
  },
  {
    "id": 146,
    "cmd": "commentbait",
    "desc": "Encourage discussion",
    "category": "content"
  },
  {
    "id": 147,
    "cmd": "poll",
    "desc": "Create a poll",
    "category": "content"
  },
  {
    "id": 148,
    "cmd": "communitypost",
    "desc": "YouTube Community post",
    "category": "content"
  },
  {
    "id": 149,
    "cmd": "newsletter",
    "desc": "Newsletter draft",
    "category": "content"
  },
  {
    "id": 150,
    "cmd": "blog",
    "desc": "Blog article",
    "category": "content"
  },
  {
    "id": 151,
    "cmd": "seo",
    "desc": "SEO optimization",
    "category": "content"
  },
  {
    "id": 152,
    "cmd": "keywords",
    "desc": "Generate keywords",
    "category": "content"
  },
  {
    "id": 153,
    "cmd": "headline",
    "desc": "Write headlines",
    "category": "content"
  },
  {
    "id": 154,
    "cmd": "titles",
    "desc": "Generate multiple titles",
    "category": "content"
  },
  {
    "id": 155,
    "cmd": "thumbnailtext",
    "desc": "Thumbnail text ideas",
    "category": "content"
  },
  {
    "id": 156,
    "cmd": "thumbnailaudit",
    "desc": "Review thumbnail concept",
    "category": "content"
  },
  {
    "id": 157,
    "cmd": "titleaudit",
    "desc": "Review title effectiveness",
    "category": "content"
  },
  {
    "id": 158,
    "cmd": "contentaudit",
    "desc": "Review content quality",
    "category": "content"
  },
  {
    "id": 159,
    "cmd": "copywriter",
    "desc": "Professional marketing copy",
    "category": "content"
  },
  {
    "id": 160,
    "cmd": "landingpage",
    "desc": "Landing page copy",
    "category": "content"
  },
  {
    "id": 161,
    "cmd": "salespage",
    "desc": "Sales page copy",
    "category": "content"
  },
  {
    "id": 162,
    "cmd": "emailmarketing",
    "desc": "Marketing email",
    "category": "content"
  },
  {
    "id": 163,
    "cmd": "coldemail",
    "desc": "Cold outreach email",
    "category": "content"
  },
  {
    "id": 164,
    "cmd": "sales",
    "desc": "Sales-oriented messaging",
    "category": "content"
  },
  {
    "id": 165,
    "cmd": "branding",
    "desc": "Brand positioning",
    "category": "content"
  },
  {
    "id": 166,
    "cmd": "brandvoice",
    "desc": "Match a brand tone",
    "category": "content"
  },
  {
    "id": 167,
    "cmd": "positioning",
    "desc": "Market positioning",
    "category": "content"
  },
  {
    "id": 168,
    "cmd": "offer",
    "desc": "Craft an offer",
    "category": "content"
  },
  {
    "id": 169,
    "cmd": "usp",
    "desc": "Unique selling proposition",
    "category": "content"
  },
  {
    "id": 170,
    "cmd": "valueprop",
    "desc": "Value proposition",
    "category": "content"
  },
  {
    "id": 171,
    "cmd": "campaign",
    "desc": "Marketing campaign",
    "category": "content"
  },
  {
    "id": 172,
    "cmd": "launch",
    "desc": "Launch strategy",
    "category": "content"
  },
  {
    "id": 173,
    "cmd": "contentcalendar",
    "desc": "Content calendar",
    "category": "content"
  },
  {
    "id": 174,
    "cmd": "postingplan",
    "desc": "Posting schedule",
    "category": "content"
  },
  {
    "id": 175,
    "cmd": "series",
    "desc": "Content series ideas",
    "category": "content"
  },
  {
    "id": 176,
    "cmd": "challenge",
    "desc": "Challenge campaign",
    "category": "content"
  },
  {
    "id": 177,
    "cmd": "trend",
    "desc": "Leverage current trends",
    "category": "content"
  },
  {
    "id": 178,
    "cmd": "evergreen",
    "desc": "Evergreen content",
    "category": "content"
  },
  {
    "id": 179,
    "cmd": "repurpose",
    "desc": "Repurpose existing content",
    "category": "content"
  },
  {
    "id": 180,
    "cmd": "broll",
    "desc": "Suggest B-roll shots",
    "category": "content"
  },
  {
    "id": 181,
    "cmd": "shotlist",
    "desc": "Generate a shot list",
    "category": "content"
  },
  {
    "id": 182,
    "cmd": "cameraangles",
    "desc": "Suggest camera angles",
    "category": "content"
  },
  {
    "id": 183,
    "cmd": "cinematic",
    "desc": "Cinematic treatment",
    "category": "content"
  },
  {
    "id": 184,
    "cmd": "cinematicsketch",
    "desc": "Cinematic sketch prompt",
    "category": "content"
  },
  {
    "id": 185,
    "cmd": "storyboardpro",
    "desc": "Detailed storyboard",
    "category": "content"
  },
  {
    "id": 186,
    "cmd": "sceneplan",
    "desc": "Scene-by-scene planning",
    "category": "content"
  },
  {
    "id": 187,
    "cmd": "transitions",
    "desc": "Editing transitions",
    "category": "content"
  },
  {
    "id": 188,
    "cmd": "motiongraphics",
    "desc": "Motion graphics ideas",
    "category": "content"
  },
  {
    "id": 189,
    "cmd": "vox",
    "desc": "Vox documentary style",
    "category": "content"
  },
  {
    "id": 190,
    "cmd": "johnnyharris",
    "desc": "Johnny Harris storytelling style",
    "category": "content"
  },
  {
    "id": 191,
    "cmd": "magnatesmedia",
    "desc": "MagnatesMedia documentary style",
    "category": "content"
  },
  {
    "id": 192,
    "cmd": "kurzgesagt",
    "desc": "Kurzgesagt-inspired explanation",
    "category": "content"
  },
  {
    "id": 193,
    "cmd": "netflix",
    "desc": "Netflix documentary tone",
    "category": "content"
  },
  {
    "id": 194,
    "cmd": "bbc",
    "desc": "BBC documentary style",
    "category": "content"
  },
  {
    "id": 195,
    "cmd": "natgeo",
    "desc": "National Geographic style",
    "category": "content"
  },
  {
    "id": 196,
    "cmd": "applekeynote",
    "desc": "Apple keynote presentation style",
    "category": "content"
  },
  {
    "id": 197,
    "cmd": "minimal",
    "desc": "Minimalist style",
    "category": "content"
  },
  {
    "id": 198,
    "cmd": "modern",
    "desc": "Modern clean style",
    "category": "content"
  },
  {
    "id": 199,
    "cmd": "premium",
    "desc": "Premium editorial look",
    "category": "content"
  },
  {
    "id": 200,
    "cmd": "aesthetic",
    "desc": "Stylized aesthetic presentation",
    "category": "content"
  },
  {
    "id": 201,
    "cmd": "photorealistic",
    "desc": "Ultra-realistic image style",
    "category": "visual"
  },
  {
    "id": 202,
    "cmd": "hyperrealistic",
    "desc": "Extreme realism",
    "category": "visual"
  },
  {
    "id": 203,
    "cmd": "cinematicphoto",
    "desc": "Movie-like photograph",
    "category": "visual"
  },
  {
    "id": 204,
    "cmd": "portrait",
    "desc": "Professional portrait",
    "category": "visual"
  },
  {
    "id": 205,
    "cmd": "headshot",
    "desc": "Corporate headshot",
    "category": "visual"
  },
  {
    "id": 206,
    "cmd": "editorial",
    "desc": "Magazine editorial look",
    "category": "visual"
  },
  {
    "id": 207,
    "cmd": "fashion",
    "desc": "Fashion photography style",
    "category": "visual"
  },
  {
    "id": 208,
    "cmd": "lifestyle",
    "desc": "Lifestyle photography",
    "category": "visual"
  },
  {
    "id": 209,
    "cmd": "streetphoto",
    "desc": "Street photography",
    "category": "visual"
  },
  {
    "id": 210,
    "cmd": "travelphoto",
    "desc": "Travel photography",
    "category": "visual"
  },
  {
    "id": 211,
    "cmd": "wildlife",
    "desc": "Wildlife photography",
    "category": "visual"
  },
  {
    "id": 212,
    "cmd": "macrophoto",
    "desc": "Macro photography",
    "category": "visual"
  },
  {
    "id": 213,
    "cmd": "droneview",
    "desc": "Drone aerial shot",
    "category": "visual"
  },
  {
    "id": 214,
    "cmd": "360drone",
    "desc": "360\u00b0 aerial concept",
    "category": "visual"
  },
  {
    "id": 215,
    "cmd": "topdown",
    "desc": "Top-down composition",
    "category": "visual"
  },
  {
    "id": 216,
    "cmd": "lowangle",
    "desc": "Low-angle perspective",
    "category": "visual"
  },
  {
    "id": 217,
    "cmd": "highangle",
    "desc": "High-angle perspective",
    "category": "visual"
  },
  {
    "id": 218,
    "cmd": "wideangle",
    "desc": "Wide-angle lens look",
    "category": "visual"
  },
  {
    "id": 219,
    "cmd": "telephoto",
    "desc": "Telephoto compression",
    "category": "visual"
  },
  {
    "id": 220,
    "cmd": "fisheye",
    "desc": "Fisheye lens effect",
    "category": "visual"
  },
  {
    "id": 221,
    "cmd": "depthoffield",
    "desc": "Shallow depth of field",
    "category": "visual"
  },
  {
    "id": 222,
    "cmd": "bokeh",
    "desc": "Soft blurred background",
    "category": "visual"
  },
  {
    "id": 223,
    "cmd": "goldenhour",
    "desc": "Golden hour lighting",
    "category": "visual"
  },
  {
    "id": 224,
    "cmd": "bluehour",
    "desc": "Blue hour lighting",
    "category": "visual"
  },
  {
    "id": 225,
    "cmd": "sunset",
    "desc": "Sunset lighting",
    "category": "visual"
  },
  {
    "id": 226,
    "cmd": "sunrise",
    "desc": "Sunrise atmosphere",
    "category": "visual"
  },
  {
    "id": 227,
    "cmd": "nightmode",
    "desc": "Night photography",
    "category": "visual"
  },
  {
    "id": 228,
    "cmd": "neon",
    "desc": "Neon lighting",
    "category": "visual"
  },
  {
    "id": 229,
    "cmd": "moody",
    "desc": "Dark cinematic mood",
    "category": "visual"
  },
  {
    "id": 230,
    "cmd": "dramaticlighting",
    "desc": "Strong dramatic light",
    "category": "visual"
  },
  {
    "id": 231,
    "cmd": "volumetriclight",
    "desc": "God rays and volumetric lighting",
    "category": "visual"
  },
  {
    "id": 232,
    "cmd": "rimlight",
    "desc": "Rim lighting",
    "category": "visual"
  },
  {
    "id": 233,
    "cmd": "silhouette",
    "desc": "Silhouette composition",
    "category": "visual"
  },
  {
    "id": 234,
    "cmd": "backlit",
    "desc": "Backlit subject",
    "category": "visual"
  },
  {
    "id": 235,
    "cmd": "blackandwhite",
    "desc": "Monochrome style",
    "category": "visual"
  },
  {
    "id": 236,
    "cmd": "filmgrain",
    "desc": "Vintage film grain",
    "category": "visual"
  },
  {
    "id": 237,
    "cmd": "kodak",
    "desc": "Kodak film aesthetic",
    "category": "visual"
  },
  {
    "id": 238,
    "cmd": "fujifilm",
    "desc": "Fujifilm color palette",
    "category": "visual"
  },
  {
    "id": 239,
    "cmd": "polaroid",
    "desc": "Polaroid instant photo style",
    "category": "visual"
  },
  {
    "id": 240,
    "cmd": "vintage",
    "desc": "Vintage aesthetic",
    "category": "visual"
  },
  {
    "id": 241,
    "cmd": "retro",
    "desc": "Retro design style",
    "category": "visual"
  },
  {
    "id": 242,
    "cmd": "80s",
    "desc": "1980s aesthetic",
    "category": "visual"
  },
  {
    "id": 243,
    "cmd": "90s",
    "desc": "1990s aesthetic",
    "category": "visual"
  },
  {
    "id": 244,
    "cmd": "cyberpunk",
    "desc": "Cyberpunk world",
    "category": "visual"
  },
  {
    "id": 245,
    "cmd": "steampunk",
    "desc": "Steampunk theme",
    "category": "visual"
  },
  {
    "id": 246,
    "cmd": "dieselpunk",
    "desc": "Dieselpunk aesthetic",
    "category": "visual"
  },
  {
    "id": 247,
    "cmd": "solarpunk",
    "desc": "Solarpunk future",
    "category": "visual"
  },
  {
    "id": 248,
    "cmd": "postapocalyptic",
    "desc": "Post-apocalyptic world",
    "category": "visual"
  },
  {
    "id": 249,
    "cmd": "fantasy",
    "desc": "Fantasy artwork",
    "category": "visual"
  },
  {
    "id": 250,
    "cmd": "scifi",
    "desc": "Science-fiction style",
    "category": "visual"
  },
  {
    "id": 251,
    "cmd": "space",
    "desc": "Outer space visuals",
    "category": "visual"
  },
  {
    "id": 252,
    "cmd": "planet",
    "desc": "Planetary illustration",
    "category": "visual"
  },
  {
    "id": 253,
    "cmd": "galaxy",
    "desc": "Galaxy visualization",
    "category": "visual"
  },
  {
    "id": 254,
    "cmd": "nebula",
    "desc": "Nebula artwork",
    "category": "visual"
  },
  {
    "id": 255,
    "cmd": "underwater",
    "desc": "Underwater scene",
    "category": "visual"
  },
  {
    "id": 256,
    "cmd": "ocean",
    "desc": "Ocean landscape",
    "category": "visual"
  },
  {
    "id": 257,
    "cmd": "mountains",
    "desc": "Mountain scenery",
    "category": "visual"
  },
  {
    "id": 258,
    "cmd": "forest",
    "desc": "Forest landscape",
    "category": "visual"
  },
  {
    "id": 259,
    "cmd": "desert",
    "desc": "Desert environment",
    "category": "visual"
  },
  {
    "id": 260,
    "cmd": "cityscape",
    "desc": "Urban skyline",
    "category": "visual"
  },
  {
    "id": 261,
    "cmd": "architecturephoto",
    "desc": "Architectural photography",
    "category": "visual"
  },
  {
    "id": 262,
    "cmd": "interior",
    "desc": "Interior design visualization",
    "category": "visual"
  },
  {
    "id": 263,
    "cmd": "minimalinterior",
    "desc": "Minimal interior concept",
    "category": "visual"
  },
  {
    "id": 264,
    "cmd": "luxury",
    "desc": "Luxury aesthetic",
    "category": "visual"
  },
  {
    "id": 265,
    "cmd": "productphoto",
    "desc": "Professional product photography",
    "category": "visual"
  },
  {
    "id": 266,
    "cmd": "packaging",
    "desc": "Packaging mockup",
    "category": "visual"
  },
  {
    "id": 267,
    "cmd": "advertising",
    "desc": "Advertising visual",
    "category": "visual"
  },
  {
    "id": 268,
    "cmd": "billboard",
    "desc": "Billboard mockup",
    "category": "visual"
  },
  {
    "id": 269,
    "cmd": "posterdesign",
    "desc": "Poster concept",
    "category": "visual"
  },
  {
    "id": 270,
    "cmd": "brandingmockup",
    "desc": "Brand identity preview",
    "category": "visual"
  },
  {
    "id": 271,
    "cmd": "logo",
    "desc": "Logo concepts",
    "category": "visual"
  },
  {
    "id": 272,
    "cmd": "iconset",
    "desc": "Custom icon set",
    "category": "visual"
  },
  {
    "id": 273,
    "cmd": "mascot",
    "desc": "Mascot character",
    "category": "visual"
  },
  {
    "id": 274,
    "cmd": "characterdesign",
    "desc": "Original character",
    "category": "visual"
  },
  {
    "id": 275,
    "cmd": "conceptart",
    "desc": "Concept art",
    "category": "visual"
  },
  {
    "id": 276,
    "cmd": "environmentart",
    "desc": "Environment concept art",
    "category": "visual"
  },
  {
    "id": 277,
    "cmd": "mattepainting",
    "desc": "Matte painting style",
    "category": "visual"
  },
  {
    "id": 278,
    "cmd": "digitalpainting",
    "desc": "Digital art",
    "category": "visual"
  },
  {
    "id": 279,
    "cmd": "oilpainting",
    "desc": "Oil painting style",
    "category": "visual"
  },
  {
    "id": 280,
    "cmd": "watercolor",
    "desc": "Watercolor illustration",
    "category": "visual"
  },
  {
    "id": 281,
    "cmd": "acrylic",
    "desc": "Acrylic painting",
    "category": "visual"
  },
  {
    "id": 282,
    "cmd": "charcoal",
    "desc": "Charcoal sketch",
    "category": "visual"
  },
  {
    "id": 283,
    "cmd": "pencilsketch",
    "desc": "Pencil drawing",
    "category": "visual"
  },
  {
    "id": 284,
    "cmd": "inkdrawing",
    "desc": "Ink illustration",
    "category": "visual"
  },
  {
    "id": 285,
    "cmd": "crosshatching",
    "desc": "Cross-hatching style",
    "category": "visual"
  },
  {
    "id": 286,
    "cmd": "comicbook",
    "desc": "Comic book art",
    "category": "visual"
  },
  {
    "id": 287,
    "cmd": "manga",
    "desc": "Manga style",
    "category": "visual"
  },
  {
    "id": 288,
    "cmd": "anime",
    "desc": "Anime artwork",
    "category": "visual"
  },
  {
    "id": 289,
    "cmd": "ghibli",
    "desc": "Studio Ghibli-inspired style",
    "category": "visual"
  },
  {
    "id": 290,
    "cmd": "pixar",
    "desc": "3D animated family-film look",
    "category": "visual"
  },
  {
    "id": 291,
    "cmd": "lowpoly",
    "desc": "Low-poly 3D",
    "category": "visual"
  },
  {
    "id": 292,
    "cmd": "voxel",
    "desc": "Voxel art",
    "category": "visual"
  },
  {
    "id": 293,
    "cmd": "pixelart",
    "desc": "Pixel art",
    "category": "visual"
  },
  {
    "id": 294,
    "cmd": "clayrender",
    "desc": "Clay render",
    "category": "visual"
  },
  {
    "id": 295,
    "cmd": "3drender",
    "desc": "Photorealistic 3D render",
    "category": "visual"
  },
  {
    "id": 296,
    "cmd": "octanerender",
    "desc": "Octane-style render look",
    "category": "visual"
  },
  {
    "id": 297,
    "cmd": "unrealengine",
    "desc": "Unreal Engine cinematic look",
    "category": "visual"
  },
  {
    "id": 298,
    "cmd": "blender",
    "desc": "Blender 3D visualization",
    "category": "visual"
  },
  {
    "id": 299,
    "cmd": "midjourneystyle",
    "desc": "Prompt styled for Midjourney-like aesthetics",
    "category": "visual"
  },
  {
    "id": 300,
    "cmd": "imageprompt",
    "desc": "Convert an idea into a detailed AI image prompt",
    "category": "visual"
  },
  {
    "id": 301,
    "cmd": "rewrite",
    "desc": "Rewrite while preserving meaning",
    "category": "writing"
  },
  {
    "id": 302,
    "cmd": "improve",
    "desc": "Improve clarity and quality",
    "category": "writing"
  },
  {
    "id": 303,
    "cmd": "polish",
    "desc": "Make writing smoother",
    "category": "writing"
  },
  {
    "id": 304,
    "cmd": "proofread",
    "desc": "Correct grammar and spelling",
    "category": "writing"
  },
  {
    "id": 305,
    "cmd": "grammar",
    "desc": "Fix grammar only",
    "category": "writing"
  },
  {
    "id": 306,
    "cmd": "copyedit",
    "desc": "Professional copy editing",
    "category": "writing"
  },
  {
    "id": 307,
    "cmd": "expand",
    "desc": "Expand into more detail",
    "category": "writing"
  },
  {
    "id": 308,
    "cmd": "shorten",
    "desc": "Condense the text",
    "category": "writing"
  },
  {
    "id": 309,
    "cmd": "paraphrase",
    "desc": "Reword naturally",
    "category": "writing"
  },
  {
    "id": 310,
    "cmd": "simplifytext",
    "desc": "Use easier language",
    "category": "writing"
  },
  {
    "id": 311,
    "cmd": "formal",
    "desc": "Formal tone",
    "category": "writing"
  },
  {
    "id": 312,
    "cmd": "casual",
    "desc": "Casual conversational tone",
    "category": "writing"
  },
  {
    "id": 313,
    "cmd": "friendly",
    "desc": "Warm, friendly tone",
    "category": "writing"
  },
  {
    "id": 314,
    "cmd": "professional",
    "desc": "Professional business tone",
    "category": "writing"
  },
  {
    "id": 315,
    "cmd": "persuasive",
    "desc": "Convincing writing",
    "category": "writing"
  },
  {
    "id": 316,
    "cmd": "convincing",
    "desc": "Strengthen arguments",
    "category": "writing"
  },
  {
    "id": 317,
    "cmd": "academic",
    "desc": "Academic writing style",
    "category": "writing"
  },
  {
    "id": 318,
    "cmd": "journalistic",
    "desc": "News-style writing",
    "category": "writing"
  },
  {
    "id": 319,
    "cmd": "story",
    "desc": "Write as a story",
    "category": "writing"
  },
  {
    "id": 320,
    "cmd": "essay",
    "desc": "Essay format",
    "category": "writing"
  },
  {
    "id": 321,
    "cmd": "article",
    "desc": "Article format",
    "category": "writing"
  },
  {
    "id": 322,
    "cmd": "report",
    "desc": "Professional report",
    "category": "writing"
  },
  {
    "id": 323,
    "cmd": "whitepaper",
    "desc": "White paper structure",
    "category": "writing"
  },
  {
    "id": 324,
    "cmd": "casestudy",
    "desc": "Case study format",
    "category": "writing"
  },
  {
    "id": 325,
    "cmd": "proposal",
    "desc": "Business proposal",
    "category": "writing"
  },
  {
    "id": 326,
    "cmd": "sop",
    "desc": "Standard Operating Procedure",
    "category": "writing"
  },
  {
    "id": 327,
    "cmd": "playbook",
    "desc": "Create a playbook",
    "category": "writing"
  },
  {
    "id": 328,
    "cmd": "manual",
    "desc": "User manual",
    "category": "writing"
  },
  {
    "id": 329,
    "cmd": "guide",
    "desc": "Step-by-step guide",
    "category": "writing"
  },
  {
    "id": 330,
    "cmd": "faq",
    "desc": "Frequently Asked Questions",
    "category": "writing"
  },
  {
    "id": 331,
    "cmd": "checklist",
    "desc": "Checklist format",
    "category": "writing"
  },
  {
    "id": 332,
    "cmd": "template",
    "desc": "Reusable template",
    "category": "writing"
  },
  {
    "id": 333,
    "cmd": "outline",
    "desc": "Structured outline",
    "category": "writing"
  },
  {
    "id": 334,
    "cmd": "bulletpoints",
    "desc": "Bullet summary",
    "category": "writing"
  },
  {
    "id": 335,
    "cmd": "keypoints",
    "desc": "Only key takeaways",
    "category": "writing"
  },
  {
    "id": 336,
    "cmd": "highlights",
    "desc": "Highlight important ideas",
    "category": "writing"
  },
  {
    "id": 337,
    "cmd": "notes",
    "desc": "Study notes",
    "category": "writing"
  },
  {
    "id": 338,
    "cmd": "minutes",
    "desc": "Meeting minutes",
    "category": "writing"
  },
  {
    "id": 339,
    "cmd": "agenda",
    "desc": "Meeting agenda",
    "category": "writing"
  },
  {
    "id": 340,
    "cmd": "meetingsummary",
    "desc": "Summarize meeting",
    "category": "writing"
  },
  {
    "id": 341,
    "cmd": "todo",
    "desc": "Generate to-do list",
    "category": "writing"
  },
  {
    "id": 342,
    "cmd": "kanban",
    "desc": "Kanban task board",
    "category": "writing"
  },
  {
    "id": 343,
    "cmd": "gantt",
    "desc": "Gantt chart plan (text)",
    "category": "writing"
  },
  {
    "id": 344,
    "cmd": "okr",
    "desc": "Objectives & Key Results",
    "category": "writing"
  },
  {
    "id": 345,
    "cmd": "kpi",
    "desc": "Key Performance Indicators",
    "category": "writing"
  },
  {
    "id": 346,
    "cmd": "smartgoals",
    "desc": "SMART goals",
    "category": "writing"
  },
  {
    "id": 347,
    "cmd": "roadmap90",
    "desc": "90-day roadmap",
    "category": "writing"
  },
  {
    "id": 348,
    "cmd": "roadmapyear",
    "desc": "Annual roadmap",
    "category": "writing"
  },
  {
    "id": 349,
    "cmd": "milestones",
    "desc": "Project milestones",
    "category": "writing"
  },
  {
    "id": 350,
    "cmd": "risks",
    "desc": "Risk assessment",
    "category": "writing"
  },
  {
    "id": 351,
    "cmd": "riskmatrix",
    "desc": "Likelihood \u00d7 impact matrix",
    "category": "writing"
  },
  {
    "id": 352,
    "cmd": "dependencies",
    "desc": "Task dependencies",
    "category": "writing"
  },
  {
    "id": 353,
    "cmd": "estimate",
    "desc": "Estimate effort/time",
    "category": "writing"
  },
  {
    "id": 354,
    "cmd": "budget",
    "desc": "Budget planning",
    "category": "writing"
  },
  {
    "id": 355,
    "cmd": "forecast",
    "desc": "Forecast outcomes",
    "category": "writing"
  },
  {
    "id": 356,
    "cmd": "metrics",
    "desc": "Suggest useful metrics",
    "category": "writing"
  },
  {
    "id": 357,
    "cmd": "dashboardmetrics",
    "desc": "Dashboard KPI ideas",
    "category": "writing"
  },
  {
    "id": 358,
    "cmd": "decisiontree",
    "desc": "Decision tree analysis",
    "category": "writing"
  },
  {
    "id": 359,
    "cmd": "fishbone",
    "desc": "Fishbone (Ishikawa) analysis",
    "category": "writing"
  },
  {
    "id": 360,
    "cmd": "pareto",
    "desc": "80/20 Pareto analysis",
    "category": "writing"
  },
  {
    "id": 361,
    "cmd": "lean",
    "desc": "Lean methodology",
    "category": "writing"
  },
  {
    "id": 362,
    "cmd": "sixsigma",
    "desc": "Six Sigma approach",
    "category": "writing"
  },
  {
    "id": 363,
    "cmd": "agile",
    "desc": "Agile methodology",
    "category": "writing"
  },
  {
    "id": 364,
    "cmd": "scrum",
    "desc": "Scrum framework",
    "category": "writing"
  },
  {
    "id": 365,
    "cmd": "kanbanflow",
    "desc": "Kanban workflow",
    "category": "writing"
  },
  {
    "id": 366,
    "cmd": "productivity",
    "desc": "Optimize productivity",
    "category": "writing"
  },
  {
    "id": 367,
    "cmd": "timemanagement",
    "desc": "Time management advice",
    "category": "writing"
  },
  {
    "id": 368,
    "cmd": "pomodoro",
    "desc": "Pomodoro schedule",
    "category": "writing"
  },
  {
    "id": 369,
    "cmd": "studyplan",
    "desc": "Study plan",
    "category": "writing"
  },
  {
    "id": 370,
    "cmd": "revisionplan",
    "desc": "Revision timetable",
    "category": "writing"
  },
  {
    "id": 371,
    "cmd": "learningpath",
    "desc": "Progressive learning path",
    "category": "writing"
  },
  {
    "id": 372,
    "cmd": "feynman",
    "desc": "Explain using the Feynman technique",
    "category": "writing"
  },
  {
    "id": 373,
    "cmd": "memory",
    "desc": "Memory techniques",
    "category": "writing"
  },
  {
    "id": 374,
    "cmd": "mnemonics",
    "desc": "Create mnemonics",
    "category": "writing"
  },
  {
    "id": 375,
    "cmd": "practice",
    "desc": "Generate practice exercises",
    "category": "writing"
  },
  {
    "id": 376,
    "cmd": "challengequestions",
    "desc": "Difficult questions",
    "category": "writing"
  },
  {
    "id": 377,
    "cmd": "coding",
    "desc": "Write code",
    "category": "writing"
  },
  {
    "id": 378,
    "cmd": "explaincode",
    "desc": "Explain existing code",
    "category": "writing"
  },
  {
    "id": 379,
    "cmd": "debug",
    "desc": "Find and fix bugs",
    "category": "writing"
  },
  {
    "id": 380,
    "cmd": "refactor",
    "desc": "Improve code structure",
    "category": "writing"
  },
  {
    "id": 381,
    "cmd": "optimizecode",
    "desc": "Optimize performance",
    "category": "writing"
  },
  {
    "id": 382,
    "cmd": "reviewcode",
    "desc": "Code review",
    "category": "writing"
  },
  {
    "id": 383,
    "cmd": "pseudocode",
    "desc": "Convert to pseudocode",
    "category": "writing"
  },
  {
    "id": 384,
    "cmd": "algorithm",
    "desc": "Design an algorithm",
    "category": "writing"
  },
  {
    "id": 385,
    "cmd": "datastructure",
    "desc": "Choose suitable data structure",
    "category": "writing"
  },
  {
    "id": 386,
    "cmd": "sql",
    "desc": "Generate SQL",
    "category": "writing"
  },
  {
    "id": 387,
    "cmd": "regex",
    "desc": "Create regular expressions",
    "category": "writing"
  },
  {
    "id": 388,
    "cmd": "api",
    "desc": "Design or explain APIs",
    "category": "writing"
  },
  {
    "id": 389,
    "cmd": "json",
    "desc": "Format or generate JSON",
    "category": "writing"
  },
  {
    "id": 390,
    "cmd": "yaml",
    "desc": "Generate YAML",
    "category": "writing"
  },
  {
    "id": 391,
    "cmd": "csv",
    "desc": "Generate CSV content",
    "category": "writing"
  },
  {
    "id": 392,
    "cmd": "xml",
    "desc": "Generate XML",
    "category": "writing"
  },
  {
    "id": 393,
    "cmd": "researchplan",
    "desc": "Plan structured research",
    "category": "writing"
  },
  {
    "id": 394,
    "cmd": "literaturereview",
    "desc": "Summarize existing research",
    "category": "writing"
  },
  {
    "id": 395,
    "cmd": "hypothesis",
    "desc": "Generate hypotheses",
    "category": "writing"
  },
  {
    "id": 396,
    "cmd": "experiment",
    "desc": "Design an experiment",
    "category": "writing"
  },
  {
    "id": 397,
    "cmd": "peerreview",
    "desc": "Critically review work",
    "category": "writing"
  },
  {
    "id": 398,
    "cmd": "critic",
    "desc": "Constructive critique",
    "category": "writing"
  },
  {
    "id": 399,
    "cmd": "audit",
    "desc": "Perform a comprehensive audit",
    "category": "writing"
  },
  {
    "id": 400,
    "cmd": "framework",
    "desc": "Apply the most suitable analytical framework",
    "category": "writing"
  },
  {
    "id": 401,
    "cmd": "brainstorm",
    "desc": "Generate lots of ideas",
    "category": "creative"
  },
  {
    "id": 402,
    "cmd": "ideas10",
    "desc": "Generate 10 ideas",
    "category": "creative"
  },
  {
    "id": 403,
    "cmd": "ideas50",
    "desc": "Generate 50 ideas",
    "category": "creative"
  },
  {
    "id": 404,
    "cmd": "creative",
    "desc": "Think creatively",
    "category": "creative"
  },
  {
    "id": 405,
    "cmd": "innovate",
    "desc": "Suggest innovative solutions",
    "category": "creative"
  },
  {
    "id": 406,
    "cmd": "outofthebox",
    "desc": "Unconventional ideas",
    "category": "creative"
  },
  {
    "id": 407,
    "cmd": "inspiration",
    "desc": "Creative inspiration",
    "category": "creative"
  },
  {
    "id": 408,
    "cmd": "random",
    "desc": "Random ideas",
    "category": "creative"
  },
  {
    "id": 409,
    "cmd": "combine",
    "desc": "Combine multiple concepts",
    "category": "creative"
  },
  {
    "id": 410,
    "cmd": "remix",
    "desc": "Remix an existing idea",
    "category": "creative"
  },
  {
    "id": 411,
    "cmd": "alternate",
    "desc": "Alternative approaches",
    "category": "creative"
  },
  {
    "id": 412,
    "cmd": "variants",
    "desc": "Multiple versions",
    "category": "creative"
  },
  {
    "id": 413,
    "cmd": "options",
    "desc": "List several options",
    "category": "creative"
  },
  {
    "id": 414,
    "cmd": "compareideas",
    "desc": "Compare different ideas",
    "category": "creative"
  },
  {
    "id": 415,
    "cmd": "bestoption",
    "desc": "Choose the strongest option",
    "category": "creative"
  },
  {
    "id": 416,
    "cmd": "decision",
    "desc": "Help make a decision",
    "category": "creative"
  },
  {
    "id": 417,
    "cmd": "advisor",
    "desc": "General advisor mode",
    "category": "creative"
  },
  {
    "id": 418,
    "cmd": "mentor",
    "desc": "Mentorship guidance",
    "category": "creative"
  },
  {
    "id": 419,
    "cmd": "coach",
    "desc": "Coaching approach",
    "category": "creative"
  },
  {
    "id": 420,
    "cmd": "teacher",
    "desc": "Teach step by step",
    "category": "creative"
  },
  {
    "id": 421,
    "cmd": "tutor",
    "desc": "Personal tutoring mode",
    "category": "creative"
  },
  {
    "id": 422,
    "cmd": "professor",
    "desc": "University-level teaching",
    "category": "creative"
  },
  {
    "id": 423,
    "cmd": "scientist",
    "desc": "Scientific perspective",
    "category": "creative"
  },
  {
    "id": 424,
    "cmd": "engineer",
    "desc": "Engineering perspective",
    "category": "creative"
  },
  {
    "id": 425,
    "cmd": "doctor",
    "desc": "Medical educational explanation (not diagnosis)",
    "category": "creative"
  },
  {
    "id": 426,
    "cmd": "lawyer",
    "desc": "Legal educational explanation (not legal advice)",
    "category": "creative"
  },
  {
    "id": 427,
    "cmd": "psychologist",
    "desc": "Psychology perspective",
    "category": "creative"
  },
  {
    "id": 428,
    "cmd": "economist",
    "desc": "Economic analysis",
    "category": "creative"
  },
  {
    "id": 429,
    "cmd": "historian",
    "desc": "Historical perspective",
    "category": "creative"
  },
  {
    "id": 430,
    "cmd": "journalist",
    "desc": "Investigative reporting style",
    "category": "creative"
  },
  {
    "id": 431,
    "cmd": "editor",
    "desc": "Editorial improvements",
    "category": "creative"
  },
  {
    "id": 432,
    "cmd": "designer",
    "desc": "Design thinking approach",
    "category": "creative"
  },
  {
    "id": 433,
    "cmd": "architect",
    "desc": "System architecture mindset",
    "category": "creative"
  },
  {
    "id": 434,
    "cmd": "productmanager",
    "desc": "Product management view",
    "category": "creative"
  },
  {
    "id": 435,
    "cmd": "founder",
    "desc": "Startup founder mindset",
    "category": "creative"
  },
  {
    "id": 436,
    "cmd": "ceo",
    "desc": "CEO decision-making style",
    "category": "creative"
  },
  {
    "id": 437,
    "cmd": "investorview",
    "desc": "Investor evaluation",
    "category": "creative"
  },
  {
    "id": 438,
    "cmd": "customer",
    "desc": "Customer perspective",
    "category": "creative"
  },
  {
    "id": 439,
    "cmd": "beginner",
    "desc": "Beginner-friendly explanation",
    "category": "creative"
  },
  {
    "id": 440,
    "cmd": "advanced",
    "desc": "Advanced technical explanation",
    "category": "creative"
  },
  {
    "id": 441,
    "cmd": "stepbystep",
    "desc": "Sequential instructions",
    "category": "creative"
  },
  {
    "id": 442,
    "cmd": "interactive",
    "desc": "Ask questions while solving",
    "category": "creative"
  },
  {
    "id": 443,
    "cmd": "walkthrough",
    "desc": "Detailed walkthrough",
    "category": "creative"
  },
  {
    "id": 444,
    "cmd": "simulation",
    "desc": "Simulate a scenario",
    "category": "creative"
  },
  {
    "id": 445,
    "cmd": "negotiation",
    "desc": "Negotiation role-play",
    "category": "creative"
  },
  {
    "id": 446,
    "cmd": "debate",
    "desc": "Present opposing viewpoints",
    "category": "creative"
  },
  {
    "id": 447,
    "cmd": "counterargument",
    "desc": "Generate counterarguments",
    "category": "creative"
  },
  {
    "id": 448,
    "cmd": "critique",
    "desc": "Critically evaluate",
    "category": "creative"
  },
  {
    "id": 449,
    "cmd": "improveidea",
    "desc": "Strengthen an idea",
    "category": "creative"
  },
  {
    "id": 450,
    "cmd": "validate",
    "desc": "Check whether an idea is sound",
    "category": "creative"
  },
  {
    "id": 451,
    "cmd": "assumptions",
    "desc": "List hidden assumptions",
    "category": "creative"
  },
  {
    "id": 452,
    "cmd": "constraints",
    "desc": "Identify constraints",
    "category": "creative"
  },
  {
    "id": 453,
    "cmd": "tradeoffs",
    "desc": "Explain trade-offs",
    "category": "creative"
  },
  {
    "id": 454,
    "cmd": "opportunities",
    "desc": "Find opportunities",
    "category": "creative"
  },
  {
    "id": 455,
    "cmd": "risksfuture",
    "desc": "Future risk analysis",
    "category": "creative"
  },
  {
    "id": 456,
    "cmd": "trendanalysis",
    "desc": "Analyze trends",
    "category": "creative"
  },
  {
    "id": 457,
    "cmd": "forecastfuture",
    "desc": "Predict possible futures",
    "category": "creative"
  },
  {
    "id": 458,
    "cmd": "signals",
    "desc": "Weak signal detection",
    "category": "creative"
  },
  {
    "id": 459,
    "cmd": "emergingtech",
    "desc": "Emerging technology overview",
    "category": "creative"
  },
  {
    "id": 460,
    "cmd": "futureproof",
    "desc": "Make something future-ready",
    "category": "creative"
  },
  {
    "id": 461,
    "cmd": "automation",
    "desc": "Identify automation opportunities",
    "category": "creative"
  },
  {
    "id": 462,
    "cmd": "workflow",
    "desc": "Design a workflow",
    "category": "creative"
  },
  {
    "id": 463,
    "cmd": "pipeline",
    "desc": "Create a process pipeline",
    "category": "creative"
  },
  {
    "id": 464,
    "cmd": "systemthinking",
    "desc": "Analyze as an interconnected system",
    "category": "creative"
  },
  {
    "id": 465,
    "cmd": "mentalmodels",
    "desc": "Apply mental models",
    "category": "creative"
  },
  {
    "id": 466,
    "cmd": "heuristics",
    "desc": "Decision heuristics",
    "category": "creative"
  },
  {
    "id": 467,
    "cmd": "principles",
    "desc": "Core principles",
    "category": "creative"
  },
  {
    "id": 468,
    "cmd": "frameworkcompare",
    "desc": "Compare analytical frameworks",
    "category": "creative"
  },
  {
    "id": 469,
    "cmd": "bestpractice",
    "desc": "Industry best practices",
    "category": "creative"
  },
  {
    "id": 470,
    "cmd": "mistakes",
    "desc": "Common mistakes to avoid",
    "category": "creative"
  },
  {
    "id": 471,
    "cmd": "dosanddonts",
    "desc": "Do's and Don'ts list",
    "category": "creative"
  },
  {
    "id": 472,
    "cmd": "quickwins",
    "desc": "Fast improvements",
    "category": "creative"
  },
  {
    "id": 473,
    "cmd": "optimization",
    "desc": "Optimize performance",
    "category": "creative"
  },
  {
    "id": 474,
    "cmd": "efficiency",
    "desc": "Increase efficiency",
    "category": "creative"
  },
  {
    "id": 475,
    "cmd": "automationplan",
    "desc": "Automation roadmap",
    "category": "creative"
  },
  {
    "id": 476,
    "cmd": "aiworkflow",
    "desc": "AI-assisted workflow",
    "category": "creative"
  },
  {
    "id": 477,
    "cmd": "promptaudit",
    "desc": "Review and improve prompts",
    "category": "creative"
  },
  {
    "id": 478,
    "cmd": "promptlibrary",
    "desc": "Organize prompts",
    "category": "creative"
  },
  {
    "id": 479,
    "cmd": "promptchain",
    "desc": "Chain prompts together",
    "category": "creative"
  },
  {
    "id": 480,
    "cmd": "metaprompt",
    "desc": "Generate prompts that create prompts",
    "category": "creative"
  },
  {
    "id": 481,
    "cmd": "systemprompt",
    "desc": "Draft a system prompt",
    "category": "creative"
  },
  {
    "id": 482,
    "cmd": "persona",
    "desc": "Create a role/persona",
    "category": "creative"
  },
  {
    "id": 483,
    "cmd": "role",
    "desc": "Respond as a specific role",
    "category": "creative"
  },
  {
    "id": 484,
    "cmd": "simulateexpert",
    "desc": "Emulate an expert's reasoning style",
    "category": "creative"
  },
  {
    "id": 485,
    "cmd": "multiexpert",
    "desc": "Multiple expert perspectives",
    "category": "creative"
  },
  {
    "id": 486,
    "cmd": "consensus",
    "desc": "Find common ground",
    "category": "creative"
  },
  {
    "id": 487,
    "cmd": "disagreement",
    "desc": "Highlight disagreements",
    "category": "creative"
  },
  {
    "id": 488,
    "cmd": "evidence",
    "desc": "Support with evidence",
    "category": "creative"
  },
  {
    "id": 489,
    "cmd": "confidence",
    "desc": "Estimate confidence level",
    "category": "creative"
  },
  {
    "id": 490,
    "cmd": "uncertainty",
    "desc": "Explain what's uncertain",
    "category": "creative"
  },
  {
    "id": 491,
    "cmd": "limitations",
    "desc": "State limitations",
    "category": "creative"
  },
  {
    "id": 492,
    "cmd": "assess",
    "desc": "Evaluate comprehensively",
    "category": "creative"
  },
  {
    "id": 493,
    "cmd": "scorecard",
    "desc": "Create a scoring framework",
    "category": "creative"
  },
  {
    "id": 494,
    "cmd": "ranking",
    "desc": "Rank options",
    "category": "creative"
  },
  {
    "id": 495,
    "cmd": "matrixcompare",
    "desc": "Comparison matrix",
    "category": "creative"
  },
  {
    "id": 496,
    "cmd": "finalanswer",
    "desc": "Provide only the final answer",
    "category": "creative"
  },
  {
    "id": 497,
    "cmd": "thinking",
    "desc": "Show reasoning at a high level (not hidden reasoning)",
    "category": "creative"
  },
  {
    "id": 498,
    "cmd": "executemode",
    "desc": "Focus on producing the requested output",
    "category": "creative"
  },
  {
    "id": 499,
    "cmd": "masterprompt",
    "desc": "Combine multiple prompt techniques",
    "category": "creative"
  },
  {
    "id": 500,
    "cmd": "allinone",
    "desc": "Use the best combination of structures, reasoning, visuals (where appropriate), and formatting for the task",
    "category": "creative"
  }
];
