// Portfolio content.
// Videos live in /public/videos as <name>.mp4 + <name>.jpg poster.
// Sites: 2:1 `image` banner in /public/assets. Apps: phone screenshots in `gallery`.

export const portfolioTabs = [
  { key: 'animation', label: 'Motion & Video' },
  { key: 'web', label: 'Websites' },
  { key: 'app', label: 'Mobile Apps' },
]

const video = (name, title, type) => ({
  id: name,
  title,
  type,
  video: `/videos/${name}.mp4`,
  poster: `/videos/${name}.jpg`,
})

// YouTube videos open in a player on click; the thumbnail comes from YouTube
const youtube = (id, title, type) => ({
  id: `yt-${id}`,
  youtubeId: id,
  title,
  type,
  poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
})

// `layout`: reel = 9:16 cards, wide = 16:9 cards, youtube = 16:9 click-to-play
export const reelSections = [
  {
    key: 'motion',
    title: 'Motion Graphics',
    text: 'Bold motion design for brands, ads and reels.',
    layout: 'reel',
    items: [
      video('motion-kraftor-showreel', 'Kraftor Showreel', 'Studio Showreel'),
      video('motion-advanced-graphics', 'Advanced Motion Graphics', 'Motion Design'),
      video('motion-product-explainer', 'Product Explainer', 'Explainer Video'),
      video('motion-brand-feature', 'Brand Feature', 'Brand Motion'),
      video('motion-smooth-graphics', 'Smooth Motion Graphics', 'Motion Design'),
      video('motion-product-mograph', 'Product Mograph', 'Product Promo'),
    ],
  },
  {
    key: '3d',
    title: '3D Animation',
    text: 'Lifelike 3D that shows products at their best.',
    layout: 'reel',
    items: [
      video('3d-game-console', 'Game Console Reveal', '3D Product'),
      video('3d-dynamic-action', 'Dynamic Motion & Action', '3D Animation'),
      video('3d-simulation-fx', 'Simulation & FX', '3D Simulation'),
      video('3d-scifi-mecha', 'Sci-Fi Mecha', '3D Character'),
      video('3d-atmospheric-world', 'Atmospheric World', '3D Environment'),
    ],
  },
  {
    key: 'ai',
    title: 'AI-Generated Videos',
    text: 'Fast, smart ads and promos made with AI.',
    layout: 'reel',
    items: [
      video('ai-algo-trading-promo', 'Algo Trading Promo', 'AI Promo'),
      video('ai-gourmet-food-ad', 'Gourmet Food Ad', 'AI Social Ad'),
      video('ai-packers-movers-ad', 'Packers & Movers Ad', 'AI Visual Ad'),
      video('ai-real-estate-reel', 'Shreeji Real Estate', 'AI Property Reel'),
      video('ai-college-campus-life', 'Vision College Campus Life', 'AI Campus Promo'),
    ],
  },
  {
    key: 'edu',
    title: 'Institute Films',
    text: 'Campus stories for schools and colleges.',
    // Has its own small Portrait / Landscape filter
    groups: [
      {
        key: 'portrait',
        label: 'Portrait',
        layout: 'reel',
        items: [
          video('edu-student-life', 'Student Life & Highlights', 'Campus Reel'),
          video('edu-academic-excellence', 'Academic Excellence', 'Institute Promo'),
          video('edu-cinematic-grade', 'Cinematic Colour Grade', 'Colour Grading'),
          video('edu-sports-events', 'Sports & Events', 'Event Reel'),
          video('edu-campus-exhibition', 'Campus Exhibition', 'Event Coverage'),
        ],
      },
      {
        key: 'landscape',
        label: 'Landscape',
        layout: 'wide',
        items: [
          video('edu-campus-tour-1', 'Campus Infrastructure Tour', 'Campus Tour · Vol. 1'),
          video('edu-campus-tour-2', 'Academic Facilities Tour', 'Campus Tour · Vol. 2'),
        ],
      },
    ],
  },
  {
    key: 'youtube',
    title: 'On YouTube',
    text: 'Longer films from our channel.',
    layout: 'youtube',
    items: [
      youtube('rXqwIRF_o14', 'Kraftor Showreel 2026', 'Studio Showreel'),
      youtube('ouHDTEls8MM', 'Coz You Are My BFF', 'Short Film'),
      youtube('zv4HRZ7F438', 'Anjuman Polytechnic Tour', 'Campus Film'),
    ],
  },
]

/** All items in a video section, whether it has plain `items` or Portrait/Landscape `groups`. */
export const sectionItems = (s) => s.items || s.groups.flatMap((g) => g.items)

const site = (id, name, type, info, url, keywords) => ({
  id,
  name,
  type,
  info,
  url,
  keywords,
  image: `/assets/${id}-banner.webp`,
})

export const siteSections = [
  {
    key: 'international',
    title: 'International Clients',
    text: 'Websites for clients in the UAE, New Zealand and beyond.',
    items: [
      site('vertex', 'Vertex Studio', 'Architectural Visualization · New Zealand', 'An architectural visualization studio, brought online.', 'https://vertexstudio.nz', ['React', 'GSAP motion', 'WebGL 3D']),
      site('taleem', 'Taleem School', 'School Website · UAE', 'A digital home for a school community.', 'https://www.taaleem.ae', ['Next.js', 'Bilingual EN / AR', 'Admissions portal']),
      site('amaani', 'Amaani Engineering', 'Engineering B2B Platform', 'Engineering expertise, clearly presented.', 'https://amaanisolutions.com', ['B2B platform', 'RFQ pipeline', 'SEO']),
    ],
  },
  {
    key: 'infra',
    title: 'Infrastructure & Institutes',
    text: 'Sites for infrastructure, telecom and schools.',
    items: [
      site('triconect', 'Triconect Infra', 'Infrastructure Company', 'A showcase for infrastructure and technology.', 'http://triconnectinfra.com', ['Infrastructure', 'Project showcase', 'Responsive']),
      site('arcomm', 'AR Comm Televenture', 'Telecom & Network Services', 'A digital presence for a connected business.', 'http://arcommteleventure.com', ['Telecom', 'Network services', 'Responsive']),
      site('olympiad', 'Indian Olympiad School', 'School Portal', 'An accessible window into school life.', 'https://indianolympiadschool.com', ['Education', 'School portal', 'Responsive']),
    ],
  },
  {
    key: 'local',
    title: 'Local Business',
    text: 'Simple, fast websites for local brands.',
    items: [
      site('kashish', 'Kashish Amruttulya', 'Local Brand Website', 'A welcoming online presence for a local brand.', 'https://kashishamruttulya.in/', ['Local business', 'Brand website', 'Responsive']),
      site('workon9', 'Work on 9', 'Job Marketplace', 'Connecting people with opportunities.', null, ['Marketplace', 'Mobile friendly', 'Project platform']),
      site('mab', 'MAB Interior', 'Interior Design Portfolio', 'A portfolio of spaces and interior ideas.', null, ['Interior design', 'Portfolio', 'Responsive']),
    ],
  },
]

export const appHeader = {
  title: 'Mobile Apps',
  text: 'Android apps for jobs, learning, food and business.',
}

const app = (id, name, type, info, download) => ({
  id,
  name,
  type,
  info,
  download,
  image: `/assets/${id}-0.webp`,
  gallery: [0, 1, 2, 3].map((n) => `/assets/${id}-${n}.webp`),
})

export const apps = [
  app('work-on-9', 'Work on 9', 'Jobs & Services', 'An app connecting people and work.', 'https://kraftor.anicomic.org/assets/apps/work-on-9/work-on-9.apk'),
  app('kraftor', 'Kraftor App', 'Business', 'A mobile companion for creative projects.', 'https://kraftor.anicomic.org/assets/apps/kraftor/kraftor.apk'),
  // Play Store apps — images load from Google Play
  {
    id: 'uptodo',
    name: 'To-Do List & Daily Planner',
    type: 'Productivity · 4.4★ · 1L+ downloads',
    info: 'Plan your day with tasks, reminders and a calendar.',
    download: 'https://play.google.com/store/apps/details?id=com.to_do_list_studio.uptodo',
    image: 'https://play-lh.googleusercontent.com/_R6QsEJ6w2PpDINeiCPKaFVhqI-Un3y_qn0CSetfS27VgSre8ODPz_CoEAuM512MNcMZyWykfGssUV9eEG7gIA=w240-h480-rw',
    gallery: [
      'https://play-lh.googleusercontent.com/ZFcA-FeYRAEbYuczDvn3PmF3Y8Kx_gjkWpZCzJvCB6SkAR6N2RLEDHGEyjCZHsJ-ZytpiaBau80-5bcHxvPFrqw=w526-h296-rw',
      'https://play-lh.googleusercontent.com/8dTg8Lz2R_sn2lUOzLcwhnBl-Rjs4yqQHahMkeAkgx6BZZQetdhlzOaDB8tgqnvy8V9uquXx8UtggfcqOY6CNw=w526-h296-rw',
      'https://play-lh.googleusercontent.com/wWZu-kjH2OmOWidsiaCIiEQjCv-1f7SgMJIbxVIHz6fIOW3Jd8LCTKxJCqnAY_88oVyVBANTXHbr9m_CWH8kgjk=w526-h296-rw',
    ],
  },
  {
    id: 'favhiker',
    name: 'favhiker',
    type: 'Food & Drink · 4.4★ · 50K+ downloads',
    info: 'Discover and share must-try food spots with friends.',
    download: 'https://play.google.com/store/apps/details?id=com.delnie.favhiker',
    image: 'https://play-lh.googleusercontent.com/zIadpCnNXCCTFtIp3p2_JHmpH2eoZjLsdg1LpqWLikcVkjYqbsQNvnEMwdT_Wt0h_M54NgeVq9K5ec-TCqel=w240-h480-rw',
    gallery: [
      'https://play-lh.googleusercontent.com/BIyb3hF6q2XJ_n5IFldna2wt6ZbhgYUVzMZTDKz0z3TIN_MTs5B4hc9X0-cAQ6RIu06-kESrA3wX6oasnedAQaQ=w526-h296-rw',
      'https://play-lh.googleusercontent.com/o-6Cr-9rE0sQovav5kNMwFAi67-kl7cEiS7dpm32df1-ufrAwEJmEf19Fnr5y9IPc5yVthHRqC4OgbIqxoLxqA=w526-h296-rw',
      'https://play-lh.googleusercontent.com/3aacjJqgVEx6_DTLxNQzVFqsHfDhPxhSlpye_B4qe1Wibc1qVA0FRZJ4_KV9LFlWzHpNZaRLP2CmPHugBD0ePfI=w526-h296-rw',
    ],
  },
]

// Counts used on the Home page
export const counts = {
  reels: reelSections.reduce((n, s) => n + sectionItems(s).length, 0),
  sites: siteSections.reduce((n, s) => n + s.items.length, 0),
  apps: apps.length,
}
