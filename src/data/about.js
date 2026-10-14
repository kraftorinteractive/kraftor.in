// About page content — simple English, based on what Kraftor actually does.

export const company = [
  {
    key: 'kraftor',
    title: 'Kraftor Interactive',
    text: 'A multimedia and IT studio from Nagpur. We make 3D and motion videos, design brands, and build websites, apps and software — all with one team, so your project stays simple from idea to launch.',
  },
  {
    key: 'anicomic',
    title: 'Part of Anicomic International',
    text: 'Kraftor is a division of Anicomic International, a creative company rooted in animation, visual effects and digital storytelling. That creative base is what makes our tech work look and feel different.',
  },
  {
    key: 'clients',
    title: 'Who we work with',
    text: 'Startups, local businesses, schools and colleges, and international brands — from India to the UAE and New Zealand. Every project gets the same care, whatever its size.',
  },
]

export const mission = 'Make world-class creative and tech work simple, honest and affordable for every business.'

export const vision = 'Be India’s most trusted creative-tech studio — known for work that looks great and works well.'

// How we work
export const values = [
  { title: 'Clear from day one', text: 'A fixed scope, a clear quote and a timeline before we start.' },
  { title: 'Craft in every frame', text: 'We care about the small details — in pixels, motion and code.' },
  { title: 'Mobile first', text: 'Everything we build looks and works great on a phone.' },
  { title: 'Always reachable', text: 'Regular updates on WhatsApp and email. No disappearing.' },
]

export const founder = {
  name: 'Shahnawaj Iliyas',
  role: 'Founder & CEO, Anicomic International',
  bio: 'Shahnawaj leads the creative and technology vision of Anicomic International and Kraftor Interactive, and stays close to every project from first idea to final delivery.',
  photo: '',
}

// Add the Head of Department here when ready — the card stays hidden while `name` is empty.
export const hod = {
  name: '',
  role: 'Head of Department, Kraftor',
  bio: '',
  photo: '',
}

// Our teams (shown instead of individual names until crew profiles are ready)
export const teams = [
  { name: 'Animation Studio', role: '3D, 2D and motion graphics artists', icon: 'cube' },
  { name: 'Video & Post', role: 'Editors, colourists and sound', icon: 'video' },
  { name: 'Design Studio', role: 'Brand, graphic and UI / UX designers', icon: 'pen' },
  { name: 'Web & App', role: 'Front-end, app and back-end developers', icon: 'code' },
  { name: 'Digital Marketing', role: 'Social media, ads and SEO', icon: 'target' },
  { name: 'Client Success', role: 'Your single point of contact', icon: 'users' },
]

// Kept for when real crew profiles are added: { name, role, photo }
export const crew = []

// Add `logo: '/assets/clients/name.png'` when logo files are available — until then a name tile is shown.
export const clients = [
  { name: 'Taleem School', place: 'UAE' },
  { name: 'Vertex Studio', place: 'New Zealand' },
  { name: 'Amaani Engineering', place: 'B2B' },
  { name: 'Triconect Infra', place: 'Infrastructure' },
  { name: 'AR Comm Televenture', place: 'Telecom' },
  { name: 'Indian Olympiad School', place: 'Education' },
  { name: 'Kashish Amruttulya', place: 'Local brand' },
  { name: 'Work on 9', place: 'Marketplace' },
  { name: 'MAB Interior', place: 'Interiors' },
  { name: 'Vision College', place: 'Institute' },
  { name: 'Anjuman Polytechnic', place: 'Institute' },
  { name: 'Shreeji Real Estate', place: 'Real estate' },
].map((c) => ({ logo: '', ...c }))

// Client highlights — facts about real projects (from the portfolio), not quotes.
// Replace or add real, client-approved testimonials later if you collect them.
export const highlights = [
  {
    client: 'Vertex Studio',
    place: 'New Zealand',
    type: 'Website',
    icon: 'web',
    work: 'Website for an architectural visualisation studio, with smooth GSAP motion and WebGL 3D.',
    tags: ['React', 'GSAP', 'WebGL'],
    url: 'https://vertexstudio.nz',
  },
  {
    client: 'Taleem School',
    place: 'UAE',
    type: 'School website',
    icon: 'school',
    work: 'Bilingual English / Arabic school website with an online admissions portal.',
    tags: ['Next.js', 'EN / AR', 'Admissions'],
    url: 'https://www.taaleem.ae',
  },
  {
    client: 'Amaani Engineering',
    place: 'India',
    type: 'B2B platform',
    icon: 'briefcase',
    work: 'B2B platform that presents engineering services and handles quote requests.',
    tags: ['B2B', 'RFQ pipeline', 'SEO'],
    url: 'https://amaanisolutions.com',
  },
  {
    client: 'Indian Olympiad School',
    place: 'India',
    type: 'Website + films',
    icon: 'film',
    work: 'School portal plus campus tour films showing infrastructure and facilities.',
    tags: ['Website', 'Campus films'],
    url: 'https://indianolympiadschool.com',
  },
]
