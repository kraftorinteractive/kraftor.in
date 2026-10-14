// About page content. Replace placeholder photos and names with real ones.

export const company = [
  { key: 'kraftor', title: 'Kraftor', text: 'A multimedia and IT studio. Animation, design and tech under one roof.' },
  { key: 'anicomic', title: 'Anicomic', text: 'Our parent studio, built on years of animation and storytelling.' },
  { key: 'founder', title: 'Our founder', text: 'Shahnawaj Iliyas leads every project with care and craft.' },
]

export const mission = 'Make world-class creative work simple and affordable.'

export const vision = 'Be India’s most trusted creative-tech studio.'

export const founder = {
  name: 'Shahnawaj Iliyas',
  role: 'Founder & CEO, Anicomic International',
  bio: 'Leads the creative and tech vision of Anicomic and Kraftor.',
  photo: '',
}

export const hod = {
  name: 'Name Surname',
  role: 'Head of Department, Kraftor',
  bio: 'Leads production and delivery.',
  photo: '',
}

export const crew = [
  { name: 'Crew Member', role: '3D Animator', photo: '' },
  { name: 'Crew Member', role: 'Motion Designer', photo: '' },
  { name: 'Crew Member', role: 'Video Editor', photo: '' },
  { name: 'Crew Member', role: 'Graphic Designer', photo: '' },
  { name: 'Crew Member', role: 'Web Developer', photo: '' },
  { name: 'Crew Member', role: 'App Developer', photo: '' },
]

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
  { name: 'Ustad', place: 'Education app' },
  { name: 'Cloud Kitchen', place: 'Food app' },
  { name: 'Vision College', place: 'Institute' },
].map((c) => ({ logo: '', ...c }))

// TODO: placeholder testimonials — replace with real, client-approved quotes before going live.
export const testimonials = [
  { name: 'Client Name', company: 'Company, Country', text: 'Great quality. Delivered before the deadline.' },
  { name: 'Client Name', company: 'Institute, India', text: 'Our new website looks modern and brings more enquiries.' },
  { name: 'Client Name', company: 'Business, India', text: 'Quick replies and clear updates all the way.' },
  { name: 'Client Name', company: 'Startup, UAE', text: 'Logo to app — one team, no stress.' },
]
