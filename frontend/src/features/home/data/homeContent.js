import { ROUTES } from '@/constants/routes'

export const REGISTER_MODAL_CARDS = [
  {
    id: 'civilian',
    title: 'Register as a civilian',
    description:
      'Report civic issues, follow updates, join eco events, and stay connected with initiatives in your area.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Neighbors talking together in a community space',
    to: ROUTES.REGISTER_CIVILIAN,
    accent: 'emerald',
  },
  {
    id: 'organization',
    title: 'Register as an organization',
    description:
      'Host sustainability programs, publish events, and collaborate with citizens to drive local impact.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=80',
    imageAlt: 'Modern city buildings at dusk',
    to: ROUTES.REGISTER_ORGANIZATION,
    accent: 'sky',
  },
]

export const NAV_ITEMS = [
  { label: 'Home', href: '#top' },
  { label: 'Report Issues', href: '#features' },
  { label: 'Eco Events', href: '#how-it-works' },
  { label: 'Recycling', href: '#features' },
  { label: 'Organizations', href: '#roles' },
  { label: 'Contact', href: '#footer' },
]

export const FEATURES = [
  {
    title: 'Issue Reporting',
    description:
      'Report road damage, streetlight failures, illegal dumping, drainage issues, and other civic problems in just a few steps.',
    icon: '🚨',
  },
  {
    title: 'Civic Complaints',
    description:
      'Help improve your neighborhood by submitting complaints, tracking updates, and staying informed about community action.',
    icon: '📝',
  },
  {
    title: 'Eco Events & Programs',
    description:
      'Discover clean-up drives, tree planting campaigns, recycling workshops, and sustainability programs hosted by organizations.',
    icon: '🌿',
  },
  {
    title: 'Recycling & Waste Management',
    description:
      'Learn how to sort waste, find nearby recycling opportunities, and support better waste management in your area.',
    icon: '♻️',
  },
]

export const STATS = [
  { value: '2.5K+', label: 'Issues Reported' },
  { value: '180+', label: 'Community Events' },
  { value: '95+', label: 'Active Organizations' },
  { value: '12K+', label: 'Citizens Engaged' },
]

export const STEPS = [
  {
    title: 'Spot a problem',
    description:
      'Notice a civic issue in your neighborhood, such as waste dumping, broken infrastructure, or unsafe public spaces.',
  },
  {
    title: 'Report or connect',
    description:
      'Submit the complaint through the platform and connect with organizations or local initiatives working on solutions.',
  },
  {
    title: 'Build a better city',
    description:
      'Track progress, join eco programs, and become part of a more sustainable, responsive urban community.',
  },
]

export const ROLE_CARDS = [
  {
    id: 'citizen',
    icon: '👥',
    title: 'Become a registered civilian',
    description:
      'Join as a civilian to report civic issues, raise complaints, follow progress, and participate in events that improve the environment and daily life in your area.',
    points: [
      'Submit complaints and issue reports quickly',
      'Track responses and updates',
      'Discover local green initiatives',
      'Be part of real urban change',
    ],
    buttonText: 'Register as Civilian',
    accent: 'emerald',
  },
  {
    id: 'organization',
    icon: '🏢',
    title: 'Login as an organization',
    description:
      'Empower your organization to host eco events, promote programs, engage with the public, and build trust by supporting sustainability and civic responsibility.',
    points: [
      'Publish eco events and campaigns',
      'Reach active community members',
      'Promote recycling and awareness programs',
      'Create measurable local impact',
    ],
    buttonText: 'Login as Organization',
    accent: 'sky',
  },
]

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'

export const HOW_IT_WORKS_IMAGE =
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80'
