import reels from './videos.json';

export const services = [
  { id: 'websites', number: '01', icon: 'web', title: 'Websites & platforms', short: 'A better home for your business.', text: 'From a memorable business website to a custom online platform, we make it easy for your customers to find their way.', items: ['Business websites', 'E-commerce & web apps', 'Responsive UI/UX'], category: 'Websites' },
  { id: 'apps', number: '02', icon: 'app', title: 'Mobile apps', short: 'Useful ideas. Right in your pocket.', text: 'Thoughtful mobile experiences that turn everyday tasks into simple, intuitive journeys.', items: ['Android & iOS experiences', 'App interface design', 'Business integrations'], category: 'Apps' },
  { id: 'motion', number: '03', icon: 'spark', title: 'CGI & motion', short: 'Make your audience look twice.', text: 'Bring products and stories to life with 3D animation, motion graphics, and carefully crafted video.', items: ['3D product animation', 'Motion graphics & editing', 'Social & brand films'], category: 'CGI & Motion' },
  { id: 'design', number: '04', icon: 'pen', title: 'Brand & design', short: 'A clear identity. A lasting impression.', text: 'Distinctive visuals and easy-to-use interfaces that make every interaction feel like your brand.', items: ['Brand identity', 'UI/UX design', 'Visual design systems'], category: 'All' },
];
const websites = [
 ['vertex','Vertex Studio','An architectural visualization studio, brought online.','https://vertexstudio.nz',['React','GSAP motion','WebGL 3D']],
 ['taleem','Taleem School','A digital home for a school community.','https://www.taaleem.ae',['Next.js','Bilingual EN / AR','Admissions portal']],
 ['amaani','Amaani Engineering','Engineering expertise, clearly presented.','https://amaanisolutions.com',['B2B platform','RFQ pipeline','SEO']],
 ['workon9','Work on 9','Connecting people with opportunities.',null,['Marketplace','Mobile friendly','Project platform']],
 ['triconect','Triconect Infra','A showcase for infrastructure and technology.','http://triconnectinfra.com',['Infrastructure','Project showcase','Responsive']],
 ['arcomm','AR Comm Televenture','A digital presence for a connected business.','http://arcommteleventure.com',['Telecom','Network services','Responsive']],
 ['olympiad','Indian Olympiad School','An accessible window into school life.','https://indianolympiadschool.com',['Education','School portal','Responsive']],
 ['kashish','Kashish Amruttulya','A welcoming online presence for a local brand.','https://kashishamruttulya.in/',['Local business','Brand website','Responsive']],
 ['mab','MAB Interior','A portfolio of spaces and interior ideas.',null,['Interior design','Portfolio','Responsive']],
].map(([id,title,description,url,tags])=>({id,title,description,url,tags,category:'Websites',image:`/assets/${id}-banner.webp`}));
const apps = [
 ['work-on-9','Work on 9','An app connecting people and work.','https://kraftor.anicomic.org/assets/apps/work-on-9/work-on-9.apk'],
 ['ustad','Ustad','A mobile experience built around learning.','https://play.google.com/store/apps/details?id=com.ustad.app'],
 ['kraftor','Kraftor App','A mobile companion for creative projects.','https://kraftor.anicomic.org/assets/apps/kraftor/kraftor.apk'],
 ['cloud-kitchen','Cloud Kitchen','A convenient mobile food experience.','https://kraftor.anicomic.org/assets/apps/cloud-kitchen/cloud-kitchen.apk'],
].map(([id,title,description,downloadUrl])=>({id,title,description,downloadUrl,category:'Apps',image:`/assets/${id}-0.webp`,gallery:[0,1,2,3].map(n=>`/assets/${id}-${n}.webp`)}));
export const projects = [...websites,...apps,...reels];
export const categories = ['All','Websites','Apps','CGI & Motion'];
export const navigation = [['/','Home'],['/portfolio','Portfolio'],['/services','Services'],['/about','About'],['/contact','Contact']];
export const footerNavigation = [['/terms','Terms & conditions'],['/client-guidelines','Client guidelines'],['/employee-guidelines','Employee guidelines'],['/careers','Career form']];
