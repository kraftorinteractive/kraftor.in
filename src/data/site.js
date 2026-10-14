// Central business info — used by navbar, menu, footer, contact page.
export const site = {
  name: 'Kraftor Interactive',
  tagline: 'Multimedia and IT Solution',
  phone: '7378626422',
  phoneDisplay: '+91 73786 26422',
  email: 'info@kraftor.in',
  website: 'www.kraftor.in',
  websiteUrl: 'https://www.kraftor.in',
  description: 'Animation, design and tech for brands that want to stand out.',
  address: 'Flat 707, Rai Gulmohar Apt, A Wing, Teka Naka, Nagpur',
  city: 'Nagpur, India',
  hours: 'Mon – Sat, 10:00 AM – 7:00 PM IST',
  companyProfile: '/company-profile.pdf',
  mapEmbed: 'https://www.google.com/maps?q=Teka%20Naka%2C%20Nagpur&output=embed',
}

export const links = {
  tel: `tel:+91${site.phone}`,
  mail: `mailto:${site.email}`,
  whatsapp: `https://wa.me/91${site.phone}`,
  whatsappMsg: (text) => `https://wa.me/91${site.phone}?text=${encodeURIComponent(text)}`,
}

export const socials = [
  { name: 'Instagram', key: 'instagram', url: 'https://www.instagram.com/' }, // TODO: profile URL
  { name: 'WhatsApp', key: 'whatsapp', url: links.whatsapp },
  { name: 'Reddit', key: 'reddit', url: 'https://www.reddit.com/' }, // TODO: profile URL
]

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const infoLinks = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Client Guidelines', to: '/client-guidelines' },
  { label: 'Employee Guidelines', to: '/employee-guidelines' },
  { label: 'Career Form', to: '/careers' },
]
