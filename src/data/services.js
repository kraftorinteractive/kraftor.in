// Every service Kraftor offers. `category` drives the filter on the Services page.
export const serviceCategories = ['All', 'Animation & Video', 'Design', 'Web & App', 'Software']

export const services = [
  { id: '3d-animation', title: '3D Product Animation', category: 'Animation & Video', icon: 'cube', short: 'Realistic 3D that sells your product.', points: ['Product films', '360° views', 'Exploded views'] },
  { id: 'motion-graphics', title: 'Motion Graphics', category: 'Animation & Video', icon: 'motion', short: 'Clean motion for ads and reels.', points: ['Logo animation', 'Explainers', 'Social reels'] },
  { id: 'ai-video', title: 'AI Video', category: 'Animation & Video', icon: 'ai', short: 'Fast, smart videos made with AI.', points: ['AI ads', 'AI avatars', 'Script to video'] },
  { id: 'video-editing', title: 'Video Editing', category: 'Animation & Video', icon: 'video', short: 'Sharp edits for YouTube and social.', points: ['YouTube', 'Shorts & reels', 'Colour grading'] },
  { id: 'graphic-design', title: 'Graphic Design', category: 'Design', icon: 'pen', short: 'Logos, brand kits and social posts.', points: ['Logo & brand kit', 'Social posts', 'Print'] },
  { id: 'ui-ux', title: 'UI / UX Design', category: 'Design', icon: 'layout', short: 'Simple screens people enjoy using.', points: ['Wireframes', 'Prototypes', 'Design systems'] },
  { id: 'web-dev', title: 'Websites', category: 'Web & App', icon: 'web', short: 'Fast websites that work on every phone.', points: ['Business sites', 'E-commerce', 'Landing pages'] },
  { id: 'app-dev', title: 'Mobile Apps', category: 'Web & App', icon: 'mobile', short: 'Android and iOS apps, start to launch.', points: ['Android & iOS', 'Firebase', 'Store launch'] },
  { id: 'custom-software', title: 'Custom Software', category: 'Software', icon: 'code', short: 'Tools built around your business.', points: ['Dashboards', 'ERP / CRM', 'Automation'] },
  { id: 'institute-solutions', title: 'For Institutes', category: 'Software', icon: 'school', short: 'Sites, films and portals for schools.', points: ['Admission portals', 'Campus films', 'Student apps'] },
]

// Short list shown on the Home page
export const homeServiceIds = ['3d-animation', 'motion-graphics', 'graphic-design', 'web-dev', 'app-dev', 'custom-software']
