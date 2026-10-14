// Every service Kraftor offers. `category` drives the dropdown on the Services page.
export const serviceCategories = [
  'Animation',
  'App Development',
  'Digital Marketing',
  'Graphic Design',
  'Video Editing',
  'Website Development',
]

const s = (category, id, title, icon, short, points) => ({ category, id, title, icon, short, points })

export const services = [
  // ---------- Animation ----------
  s('Animation', '2d-animation', '2D Animation', 'pen', 'Hand-crafted 2D animation for stories, ads and brands.', ['Character animation', 'Frame-by-frame', 'Cut-out style']),
  s('Animation', '3d-animation', '3D Animation', 'cube', 'Full 3D scenes, characters and worlds.', ['Modelling & texturing', 'Rigging & animation', 'Lighting & rendering']),
  s('Animation', '3d-product-animation', '3D Product Animation', 'package', 'Realistic product films that show every detail.', ['Product reveals', '360° turntables', 'Exploded views']),
  s('Animation', 'motion-graphics', 'Motion Graphics', 'motion', 'Clean, bold motion for ads, reels and brands.', ['Kinetic typography', 'Infographics', 'Social reels']),
  s('Animation', 'explainer-videos', 'Explainer Videos', 'layers', 'Short animated videos that explain your idea simply.', ['Script & storyboard', 'Voice-over', '2D or 3D style']),
  s('Animation', 'logo-animation', 'Logo Animation', 'zap', 'Bring your logo to life for intros and reels.', ['Logo reveals', 'Intro / outro', 'Sound design']),
  s('Animation', 'character-animation', 'Character Animation', 'smile', 'Mascots and characters with real personality.', ['Character design', 'Lip-sync', 'Expressions']),
  s('Animation', 'arch-viz', '3D Architectural Walkthrough', 'home', 'Photo-real tours of buildings before they are built.', ['Exterior & interior', 'Walkthrough films', '360° tours']),
  s('Animation', 'whiteboard', 'Whiteboard Animation', 'edit', 'Hand-drawn style videos for training and education.', ['Drawn illustrations', 'Course videos', 'Voice-over']),

  // ---------- App Development ----------
  s('App Development', 'android-apps', 'Android Apps', 'mobile', 'Fast, reliable apps for Android phones.', ['Native & Flutter', 'Play Store launch', 'Push notifications']),
  s('App Development', 'ios-apps', 'iOS Apps', 'phone', 'Polished apps for iPhone and iPad.', ['Swift & Flutter', 'App Store launch', 'Apple sign-in']),
  s('App Development', 'cross-platform', 'Cross-Platform Apps', 'copy', 'One app for Android and iOS — faster and cheaper.', ['Flutter', 'React Native', 'Shared codebase']),
  s('App Development', 'app-ui-ux', 'App UI / UX Design', 'layout', 'Simple, beautiful screens people enjoy using.', ['User flows', 'Clickable prototypes', 'Design systems']),
  s('App Development', 'custom-software', 'Custom Software', 'code', 'Tools built around how your business works.', ['ERP / CRM', 'Billing & inventory', 'Automation']),
  s('App Development', 'admin-dashboards', 'Admin Dashboards', 'monitor', 'Control panels to manage your app and data.', ['Reports & charts', 'User management', 'Role-based access']),
  s('App Development', 'app-support', 'App Maintenance & Support', 'tool', 'Updates, fixes and new features after launch.', ['Bug fixes', 'OS updates', 'Monthly support']),

  // ---------- Digital Marketing ----------
  s('Digital Marketing', 'social-media', 'Social Media Marketing', 'social', 'Content and posting that grows your page.', ['Content calendar', 'Reels & posts', 'Page management']),
  s('Digital Marketing', 'performance-ads', 'Google & Meta Ads', 'target', 'Paid ads that bring real leads and sales.', ['Campaign setup', 'Audience targeting', 'Monthly reports']),
  s('Digital Marketing', 'seo', 'Search Engine Optimisation', 'search', 'Get found on Google by the right people.', ['Keyword research', 'On-page SEO', 'Local SEO']),
  s('Digital Marketing', 'content-creation', 'Content Creation', 'camera', 'Photos, reels and posts made for your brand.', ['Product shoots', 'Reel scripts', 'Captions']),
  s('Digital Marketing', 'google-business', 'Google Business Profile', 'map', 'Show up on Google Maps and get more calls.', ['Profile setup', 'Reviews strategy', 'Regular posts']),
  s('Digital Marketing', 'whatsapp-email', 'WhatsApp & Email Marketing', 'mail', 'Reach customers directly with offers and updates.', ['Broadcast campaigns', 'Newsletters', 'Automation']),

  // ---------- Graphic Design ----------
  s('Graphic Design', 'logo-design', 'Logo Design', 'pen', 'A memorable logo that fits your brand.', ['Multiple concepts', 'Revisions', 'All file formats']),
  s('Graphic Design', 'brand-identity', 'Brand Identity', 'award', 'A complete look for your brand, used everywhere.', ['Colours & fonts', 'Brand guidelines', 'Stationery']),
  s('Graphic Design', 'social-creatives', 'Social Media Creatives', 'image', 'Scroll-stopping posts, stories and banners.', ['Post designs', 'Story templates', 'Ad creatives']),
  s('Graphic Design', 'print-design', 'Print Design', 'printer', 'Brochures, flyers and banners that look sharp.', ['Brochures', 'Flyers & posters', 'Standees']),
  s('Graphic Design', 'packaging', 'Packaging Design', 'package', 'Packaging that stands out on the shelf.', ['Box & label design', 'Mock-ups', 'Print-ready files']),
  s('Graphic Design', 'presentation', 'Presentation Design', 'monitor', 'Clean decks for pitches, sales and company profiles.', ['Pitch decks', 'Company profiles', 'Templates']),
  s('Graphic Design', 'ui-ux', 'UI / UX Design', 'layout', 'Website and app screens designed for people.', ['Wireframes', 'Prototypes', 'Design systems']),

  // ---------- Video Editing ----------
  s('Video Editing', 'youtube-editing', 'YouTube Video Editing', 'youtube', 'Edits that keep viewers watching till the end.', ['Cuts & pacing', 'Thumbnails', 'Subtitles']),
  s('Video Editing', 'reels-shorts', 'Reels & Shorts', 'film', 'Short, punchy vertical videos for social media.', ['Trending formats', 'Captions', 'Music & effects']),
  s('Video Editing', 'corporate-videos', 'Corporate Videos', 'briefcase', 'Company films, interviews and testimonials.', ['Company profile films', 'Interviews', 'Training videos']),
  s('Video Editing', 'event-videos', 'Event Videos', 'calendar', 'Highlights of your events, launches and fests.', ['Highlight reels', 'Same-day edits', 'Multi-camera']),
  s('Video Editing', 'ad-films', 'Ad Films', 'video', 'Short ads made to sell, for TV and social.', ['15s / 30s ads', 'Product ads', 'Social cut-downs']),
  s('Video Editing', 'colour-grading', 'Colour Grading', 'droplet', 'A cinematic, consistent look for your footage.', ['Colour correction', 'Cinematic looks', 'Skin tones']),
  s('Video Editing', 'ai-video', 'AI Video Creation', 'ai', 'Fast, smart videos made with AI tools.', ['AI avatars', 'AI ads', 'Script to video']),

  // ---------- Website Development ----------
  s('Website Development', 'business-websites', 'Business Websites', 'web', 'A fast, mobile-friendly home for your business.', ['Custom design', 'Contact forms', 'Google ready']),
  s('Website Development', 'ecommerce', 'E-commerce Websites', 'cart', 'Online stores with payments and order tracking.', ['Product catalogue', 'Payment gateway', 'Order management']),
  s('Website Development', 'landing-pages', 'Landing Pages', 'zap', 'Single pages built to turn visitors into leads.', ['Ad campaigns', 'Lead forms', 'Fast loading']),
  s('Website Development', 'web-apps', 'Web Applications', 'code', 'Online tools, portals and platforms.', ['User accounts', 'Dashboards', 'Firebase / APIs']),
  s('Website Development', 'institute-sites', 'School & College Websites', 'school', 'Websites and portals for institutes.', ['Admission forms', 'Notices & results', 'Gallery & events']),
  s('Website Development', 'portfolio-sites', 'Portfolio Websites', 'image', 'Show your work beautifully — for creators and studios.', ['Galleries', 'Video showcase', 'Smooth animation']),
  s('Website Development', 'redesign', 'Website Redesign', 'refresh', 'Give your old website a fresh, modern look.', ['New design', 'Speed boost', 'Mobile-first']),
  s('Website Development', 'web-maintenance', 'Maintenance & Hosting', 'server', 'We keep your site fast, safe and up to date.', ['Domain & hosting', 'Backups', 'Security updates']),
]

// Short list shown on the Home page
export const homeServiceIds = ['3d-product-animation', 'motion-graphics', 'logo-design', 'business-websites', 'android-apps', 'social-media']
