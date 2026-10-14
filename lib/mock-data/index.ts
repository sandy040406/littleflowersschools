import { Teacher, Student, Parent, SchoolClass, SchoolEvent, MediaItem, Enquiry } from '@/lib/types';

export type GalleryCategory = 'all' | 'events' | 'sports' | 'celebrations' | 'activities' | 'campus' | 'achievements';

// ============================================================
// Placeholder Images
// Using high-quality stock photo services for realistic placeholders
// These will be replaced with actual school photography
// ============================================================

export const PLACEHOLDER_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&h=600&fit=crop',
  school: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
  classroom: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&h=600&fit=crop',
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=500&fit=crop',
  sports: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
  art: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop',
  campus: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop',
  students: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=500&fit=crop',
  celebration: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
  principal: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
  about: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&h=600&fit=crop',
  playground: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=500&fit=crop',
  computer: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
  music: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
  trip: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop',
};

// Generic person photos for faculty/parents (royalty-free)
const PERSON_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
];

// ============================================================
// Mock Teachers
// ============================================================

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Anita Verma',
    email: 'anita.verma@littleflowersschools.com',
    phone: '+91 98765 43210',
    designation: 'Senior Teacher',
    subject: 'Mathematics',
    experience: '15 years',
    bio: 'Passionate about making mathematics accessible and enjoyable. Specializes in conceptual learning approaches.',
    photoUrl: PERSON_PHOTOS[0],
    assignedClasses: ['c3', 'c4'],
    department: 'Mathematics',
    status: 'active',
  },
  {
    id: 't2',
    name: 'Mr. Rajesh Kumar',
    email: 'rajesh.kumar@littleflowersschools.com',
    phone: '+91 98765 43211',
    designation: 'Senior Teacher',
    subject: 'Science',
    experience: '12 years',
    bio: 'Dedicated to fostering scientific curiosity through hands-on experiments and real-world applications.',
    photoUrl: PERSON_PHOTOS[1],
    assignedClasses: ['c4', 'c5'],
    department: 'Science',
    status: 'active',
  },
  {
    id: 't3',
    name: 'Ms. Priya Nair',
    email: 'priya.nair@littleflowersschools.com',
    phone: '+91 98765 43212',
    designation: 'Teacher',
    subject: 'English',
    experience: '8 years',
    bio: 'Believes in the power of storytelling and creative expression to develop strong communication skills.',
    photoUrl: PERSON_PHOTOS[3],
    assignedClasses: ['c2', 'c3'],
    department: 'English',
    status: 'active',
  },
  {
    id: 't4',
    name: 'Mrs. Sunita Sharma',
    email: 'sunita.sharma@littleflowersschools.com',
    phone: '+91 98765 43213',
    designation: 'Senior Teacher',
    subject: 'Hindi',
    experience: '18 years',
    bio: 'Experienced educator with a deep commitment to language development and cultural appreciation.',
    photoUrl: PERSON_PHOTOS[4],
    assignedClasses: ['c1', 'c2'],
    department: 'Languages',
    status: 'active',
  },
  {
    id: 't5',
    name: 'Mr. Arjun Patel',
    email: 'arjun.patel@littleflowersschools.com',
    phone: '+91 98765 43214',
    designation: 'Teacher',
    subject: 'Social Studies',
    experience: '6 years',
    bio: 'Brings history and geography to life through interactive learning and field experiences.',
    photoUrl: PERSON_PHOTOS[5],
    assignedClasses: ['c3', 'c5'],
    department: 'Social Studies',
    status: 'active',
  },
  {
    id: 't6',
    name: 'Ms. Deepa Iyer',
    email: 'deepa.iyer@littleflowersschools.com',
    phone: '+91 98765 43215',
    designation: 'Teacher',
    subject: 'Computer Science',
    experience: '5 years',
    bio: 'Passionate about digital literacy and introducing students to computational thinking.',
    photoUrl: PERSON_PHOTOS[6],
    assignedClasses: ['c4', 'c5'],
    department: 'Computer Science',
    status: 'active',
  },
  {
    id: 't7',
    name: 'Mr. Vikram Singh',
    email: 'vikram.singh@littleflowersschools.com',
    phone: '+91 98765 43216',
    designation: 'Physical Education Teacher',
    subject: 'Physical Education',
    experience: '10 years',
    bio: 'Dedicated to building fitness, teamwork, and sportsmanship in students.',
    photoUrl: PERSON_PHOTOS[7],
    assignedClasses: ['c1', 'c2', 'c3', 'c4', 'c5'],
    department: 'Physical Education',
    status: 'active',
  },
  {
    id: 't8',
    name: 'Mrs. Kavita Reddy',
    email: 'kavita.reddy@littleflowersschools.com',
    phone: '+91 98765 43217',
    designation: 'Pre-Primary Teacher',
    subject: 'Early Childhood Education',
    experience: '9 years',
    bio: 'Creates nurturing and stimulating environments for our youngest learners.',
    photoUrl: PERSON_PHOTOS[3],
    assignedClasses: ['c0'],
    department: 'Pre-Primary',
    status: 'active',
  },
];

// ============================================================
// Mock Classes
// ============================================================

export const MOCK_CLASSES: SchoolClass[] = [
  { id: 'c0', name: 'Pre-Primary', section: 'A', classTeacherId: 't8', studentCount: 25 },
  { id: 'c1', name: 'Class I', section: 'A', classTeacherId: 't4', studentCount: 30 },
  { id: 'c2', name: 'Class II', section: 'A', classTeacherId: 't3', studentCount: 32 },
  { id: 'c3', name: 'Class III', section: 'A', classTeacherId: 't1', studentCount: 35 },
  { id: 'c4', name: 'Class IV', section: 'A', classTeacherId: 't2', studentCount: 33 },
  { id: 'c5', name: 'Class V', section: 'A', classTeacherId: 't5', studentCount: 30 },
  { id: 'c6', name: 'Class VI', section: 'A', classTeacherId: 't1', studentCount: 34 },
  { id: 'c7', name: 'Class VII', section: 'A', classTeacherId: 't2', studentCount: 32 },
  { id: 'c8', name: 'Class VIII', section: 'A', classTeacherId: 't5', studentCount: 30 },
  { id: 'c9', name: 'Class IX', section: 'A', classTeacherId: 't6', studentCount: 28 },
  { id: 'c10', name: 'Class X', section: 'A', classTeacherId: 't1', studentCount: 26 },
];

// ============================================================
// Mock Students
// ============================================================

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Aarav Sharma', classId: 'c3', section: 'A', parentId: 'p1', rollNumber: '301', dateOfBirth: '2016-03-15', admissionDate: '2022-04-01', status: 'active' },
  { id: 's2', name: 'Ananya Sharma', classId: 'c1', section: 'A', parentId: 'p1', rollNumber: '102', dateOfBirth: '2018-07-22', admissionDate: '2023-04-01', status: 'active' },
  { id: 's3', name: 'Vihaan Gupta', classId: 'c4', section: 'A', parentId: 'p2', rollNumber: '405', dateOfBirth: '2015-11-10', admissionDate: '2021-04-01', status: 'active' },
  { id: 's4', name: 'Diya Patel', classId: 'c2', section: 'A', parentId: 'p3', rollNumber: '210', dateOfBirth: '2017-05-08', admissionDate: '2022-04-01', status: 'active' },
  { id: 's5', name: 'Ishaan Reddy', classId: 'c5', section: 'A', parentId: 'p4', rollNumber: '512', dateOfBirth: '2014-09-18', admissionDate: '2020-04-01', status: 'active' },
  { id: 's6', name: 'Meera Singh', classId: 'c3', section: 'A', parentId: 'p5', rollNumber: '308', dateOfBirth: '2016-01-25', admissionDate: '2022-04-01', status: 'active' },
  { id: 's7', name: 'Arjun Nair', classId: 'c4', section: 'A', parentId: 'p6', rollNumber: '415', dateOfBirth: '2015-12-03', admissionDate: '2021-04-01', status: 'active' },
  { id: 's8', name: 'Saanvi Kumar', classId: 'c1', section: 'A', parentId: 'p7', rollNumber: '108', dateOfBirth: '2018-04-14', admissionDate: '2023-04-01', status: 'active' },
  { id: 's9', name: 'Reyansh Iyer', classId: 'c5', section: 'A', parentId: 'p8', rollNumber: '520', dateOfBirth: '2014-08-07', admissionDate: '2020-04-01', status: 'active' },
  { id: 's10', name: 'Anika Verma', classId: 'c2', section: 'A', parentId: 'p9', rollNumber: '215', dateOfBirth: '2017-02-19', admissionDate: '2023-04-01', status: 'active' },
];

// ============================================================
// Mock Parents
// ============================================================

export const MOCK_PARENTS: Parent[] = [
  { id: 'p1', name: 'Mrs. Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 99887 76543', children: ['s1', 's2'], status: 'active' },
  { id: 'p2', name: 'Mr. Amit Gupta', email: 'amit.gupta@email.com', phone: '+91 99887 76544', children: ['s3'], status: 'active' },
  { id: 'p3', name: 'Mrs. Neha Patel', email: 'neha.patel@email.com', phone: '+91 99887 76545', children: ['s4'], status: 'active' },
  { id: 'p4', name: 'Mr. Suresh Reddy', email: 'suresh.reddy@email.com', phone: '+91 99887 76546', children: ['s5'], status: 'active' },
  { id: 'p5', name: 'Mrs. Kavita Singh', email: 'kavita.singh@email.com', phone: '+91 99887 76547', children: ['s6'], status: 'active' },
  { id: 'p6', name: 'Mr. Rahul Nair', email: 'rahul.nair@email.com', phone: '+91 99887 76548', children: ['s7'], status: 'active' },
  { id: 'p7', name: 'Mrs. Anita Kumar', email: 'anita.kumar@email.com', phone: '+91 99887 76549', children: ['s8'], status: 'active' },
  { id: 'p8', name: 'Mr. Venkat Iyer', email: 'venkat.iyer@email.com', phone: '+91 99887 76550', children: ['s9'], status: 'active' },
  { id: 'p9', name: 'Mrs. Shalini Verma', email: 'shalini.verma@email.com', phone: '+91 99887 76551', children: ['s10'], status: 'active' },
];

// ============================================================
// Mock Admins
// ============================================================

export const MOCK_ADMINS = [
  { id: 'a1', name: 'Super Admin', email: 'admin@demo.com', role: 'admin' },
];

// ============================================================
// Mock Events
// ============================================================

export const MOCK_EVENTS: SchoolEvent[] = [
  {
    id: 'e1',
    title: 'Annual Day Celebration',
    description: 'A grand celebration of talent, creativity, and achievement featuring performances by students across all grades.',
    date: '2025-02-15',
    classId: undefined,
    className: 'All Classes',
    category: 'celebrations',
    imageUrl: PLACEHOLDER_IMAGES.celebration,
    visibility: 'public',
    photoCount: 45,
    videoCount: 3,
  },
  {
    id: 'e2',
    title: 'Sports Day',
    description: 'An exciting day of athletic competitions, team events, and sportsmanship fostering physical fitness and healthy competition.',
    date: '2025-01-20',
    classId: undefined,
    className: 'All Classes',
    category: 'sports',
    imageUrl: PLACEHOLDER_IMAGES.sports,
    visibility: 'public',
    photoCount: 62,
    videoCount: 5,
  },
  {
    id: 'e3',
    title: 'Science Exhibition',
    description: 'Students showcase innovative science projects and experiments, demonstrating their understanding of scientific concepts.',
    date: '2025-03-10',
    classId: 'c4',
    className: 'Class IV',
    category: 'activities',
    imageUrl: PLACEHOLDER_IMAGES.science,
    visibility: 'private',
    photoCount: 28,
    videoCount: 2,
  },
  {
    id: 'e4',
    title: 'Independence Day',
    description: 'Patriotic celebration with flag hoisting, cultural performances, and speeches honoring our national heritage.',
    date: '2025-08-15',
    classId: undefined,
    className: 'All Classes',
    category: 'celebrations',
    imageUrl: PLACEHOLDER_IMAGES.campus,
    visibility: 'public',
    photoCount: 35,
    videoCount: 2,
  },
  {
    id: 'e5',
    title: 'Art & Craft Exhibition',
    description: 'A colorful display of student artwork, handicrafts, and creative expressions from across all grades.',
    date: '2025-04-05',
    classId: 'c3',
    className: 'Class III',
    category: 'activities',
    imageUrl: PLACEHOLDER_IMAGES.art,
    visibility: 'private',
    photoCount: 42,
    videoCount: 1,
  },
  {
    id: 'e6',
    title: 'Field Trip to Museum',
    description: 'An educational excursion to the city museum, enriching students with historical and cultural knowledge.',
    date: '2025-03-25',
    classId: 'c5',
    className: 'Class V',
    category: 'events',
    imageUrl: PLACEHOLDER_IMAGES.trip,
    visibility: 'private',
    photoCount: 38,
    videoCount: 4,
  },
];

// ============================================================
// Mock Gallery Media
// ============================================================

const galleryImages = [
  PLACEHOLDER_IMAGES.celebration,
  PLACEHOLDER_IMAGES.sports,
  PLACEHOLDER_IMAGES.science,
  PLACEHOLDER_IMAGES.art,
  PLACEHOLDER_IMAGES.campus,
  PLACEHOLDER_IMAGES.classroom,
  PLACEHOLDER_IMAGES.library,
  PLACEHOLDER_IMAGES.students,
  PLACEHOLDER_IMAGES.playground,
  PLACEHOLDER_IMAGES.computer,
  PLACEHOLDER_IMAGES.music,
  PLACEHOLDER_IMAGES.trip,
];

export const MOCK_MEDIA: MediaItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `m${i + 1}`,
  eventId: MOCK_EVENTS[i % MOCK_EVENTS.length].id,
  uploadedBy: MOCK_TEACHERS[i % MOCK_TEACHERS.length].id,
  fileName: i % 5 === 0 ? `VID_${String(i + 1).padStart(3, '0')}.mp4` : `IMG_${String(i + 1).padStart(3, '0')}.jpg`,
  storageKey: `media/${i + 1}`,
  thumbnailUrl: galleryImages[i % galleryImages.length],
  fullUrl: galleryImages[i % galleryImages.length],
  fileType: i % 5 === 0 ? 'video' : 'image',
  fileSize: i % 5 === 0 ? 52428800 : 3145728,
  duration: i % 5 === 0 ? '2:35' : undefined,
  title: i % 5 === 0 ? `Video from ${MOCK_EVENTS[i % MOCK_EVENTS.length].title}` : undefined,
  createdAt: '2025-03-15',
  visibility: i % 3 === 0 ? 'public' : 'private',
}));

// ============================================================
// Mock Enquiries
// ============================================================

export const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: 'eq1',
    parentName: 'Mr. Vikash Mehta',
    studentName: 'Rohan Mehta',
    studentClass: 'Class III',
    phone: '+91 98765 11111',
    email: 'vikash.mehta@email.com',
    message: 'We are interested in admitting our son for the upcoming academic session. Could you share details about the admission process and fee structure?',
    preferredContact: 'phone',
    status: 'new',
    createdAt: '2025-09-28',
  },
  {
    id: 'eq2',
    parentName: 'Mrs. Deepa Joshi',
    studentName: 'Tara Joshi',
    studentClass: 'Pre-Primary',
    phone: '+91 98765 22222',
    email: 'deepa.joshi@email.com',
    message: 'Looking for a good pre-primary school for my daughter. Would like to visit the campus and understand the curriculum.',
    preferredContact: 'email',
    status: 'contacted',
    createdAt: '2025-09-25',
  },
  {
    id: 'eq3',
    parentName: 'Mr. Sanjay Rao',
    studentName: 'Aditya Rao',
    studentClass: 'Class V',
    phone: '+91 98765 33333',
    email: 'sanjay.rao@email.com',
    message: 'We are relocating to the city and are looking for a school with strong academics and extracurricular programs. Is mid-session admission possible?',
    status: 'new',
    createdAt: '2025-09-30',
  },
  {
    id: 'eq4',
    parentName: 'Mrs. Rekha Pillai',
    studentName: 'Nandini Pillai',
    studentClass: 'Class I',
    phone: '+91 98765 44444',
    email: 'rekha.pillai@email.com',
    message: 'Could you share information about the school transport facilities and safety measures?',
    preferredContact: 'phone',
    status: 'closed',
    createdAt: '2025-09-20',
  },
];

// ============================================================
// School Information
// ============================================================

export const SCHOOL_INFO = {
  name: 'Little Flowers Schools',
  tagline: 'Growing Curious Minds. Building Confident Futures.',
  phone: '+91 11 2345 6789',
  email: 'info@littleflowersschools.com',
  address: '123 Education Lane, New Delhi, India 110001',
  timings: 'Mon – Fri: 8:00 AM – 2:30 PM',
  officeHours: 'Mon – Sat: 9:00 AM – 4:00 PM',
  website: 'www.littleflowersschools.com',
  social: {
    facebook: '#',
    instagram: '#',
    youtube: '#',
    twitter: '#',
  },
};


// ============================================================
// Navigation Items
// ============================================================

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Activities', href: '/activities' },
  { label: 'Our Strengths', href: '/strengths' },
  { label: 'Contact', href: '/contact' },
];

// ============================================================
// Activities Data
// ============================================================

export const ACTIVITIES_DATA = [
  {
    title: 'Sports',
    description: 'A comprehensive sports program including athletics, cricket, football, basketball, and indoor games to promote physical fitness and teamwork.',
    imageUrl: PLACEHOLDER_IMAGES.sports,
    icon: 'Trophy',
  },
  {
    title: 'Cultural Events',
    description: 'Regular cultural programs, dance performances, music recitals, and drama productions that celebrate diversity and artistic expression.',
    imageUrl: PLACEHOLDER_IMAGES.celebration,
    icon: 'Music',
  },
  {
    title: 'Celebrations',
    description: 'Festivals, national days, and special occasions celebrated together to build community spirit and cultural awareness.',
    imageUrl: PLACEHOLDER_IMAGES.campus,
    icon: 'PartyPopper',
  },
  {
    title: 'Clubs',
    description: 'Student-led clubs including Science Club, Literary Club, Art Club, Eco Club, and more for pursuing varied interests.',
    imageUrl: PLACEHOLDER_IMAGES.science,
    icon: 'Users',
  },
  {
    title: 'Competitions',
    description: 'Inter-class and inter-school competitions in academics, sports, and arts to encourage healthy competition and excellence.',
    imageUrl: PLACEHOLDER_IMAGES.students,
    icon: 'Award',
  },
  {
    title: 'Educational Trips',
    description: 'Carefully planned excursions to museums, heritage sites, nature parks, and educational institutions for experiential learning.',
    imageUrl: PLACEHOLDER_IMAGES.trip,
    icon: 'MapPin',
  },
  {
    title: 'Community Service',
    description: 'Initiatives that encourage students to give back to the community through social awareness programs and service projects.',
    imageUrl: PLACEHOLDER_IMAGES.about,
    icon: 'Heart',
  },
];

// ============================================================
// Strengths Data
// ============================================================

export const STRENGTHS_DATA = [
  {
    title: 'Academic Excellence',
    description: 'Our rigorous curriculum is designed to develop critical thinking, problem-solving skills, and a genuine love for learning. We maintain high academic standards while ensuring every student receives the support they need to succeed.',
    icon: 'GraduationCap',
    highlights: ['Structured curriculum', 'Regular assessments', 'Personalized attention', 'Strong academic results'],
  },
  {
    title: 'Experienced Faculty',
    description: 'Our teachers are not just educators — they are mentors, guides, and role models. With years of experience and ongoing professional development, they bring passion and expertise to every classroom.',
    icon: 'Users',
    highlights: ['Qualified educators', 'Regular training', 'Student mentorship', 'Subject expertise'],
  },
  {
    title: 'Holistic Development',
    description: 'We believe education goes beyond textbooks. Our programs nurture intellectual, physical, emotional, and social growth to help students become well-rounded individuals.',
    icon: 'Sparkles',
    highlights: ['Arts & culture', 'Sports programs', 'Life skills', 'Emotional intelligence'],
  },
  {
    title: 'Safe & Caring Environment',
    description: 'The safety and well-being of every child is our highest priority. We maintain a secure campus with caring staff who create a warm, supportive atmosphere where children feel valued.',
    icon: 'Shield',
    highlights: ['Secure campus', 'Caring staff', 'Anti-bullying policies', 'Health & hygiene'],
  },
  {
    title: 'Technology-Enabled Learning',
    description: 'We integrate modern technology thoughtfully into our teaching to enhance learning outcomes while maintaining the human connection that is essential to education.',
    icon: 'Monitor',
    highlights: ['Smart classrooms', 'Computer labs', 'Digital literacy', 'Balanced screen time'],
  },
  {
    title: 'Co-Curricular Opportunities',
    description: 'From sports and arts to clubs and competitions, we offer diverse opportunities for students to explore their interests, discover talents, and build confidence.',
    icon: 'Palette',
    highlights: ['Sports teams', 'Art programs', 'Student clubs', 'Competitions'],
  },
  {
    title: 'Student-Centered Learning',
    description: 'Every child is unique, and our approach reflects that. We focus on understanding individual learning styles and adapting our methods to bring out the best in each student.',
    icon: 'Target',
    highlights: ['Individual attention', 'Adaptive teaching', 'Small class sizes', 'Regular feedback'],
  },
  {
    title: 'Parent Engagement',
    description: 'We value the partnership between school and home. Regular communication, parent-teacher meetings, and our parent portal keep families connected and involved in their child\'s education.',
    icon: 'Handshake',
    highlights: ['Parent portal', 'Regular updates', 'PTMs', 'Open communication'],
  },
];

// ============================================================
// FAQ Data for Academics
// ============================================================

export const ACADEMICS_FAQ = [
  {
    question: 'What curriculum does Little Flowers Schools follow?',
    answer: 'We follow a comprehensive curriculum that emphasizes both academic rigor and holistic development. Our teaching methodology integrates traditional learning with modern pedagogical approaches.',
  },
  {
    question: 'What is the student-teacher ratio?',
    answer: 'We maintain a favorable student-teacher ratio to ensure each child receives personalized attention and support in their learning journey.',
  },
  {
    question: 'How is student progress assessed?',
    answer: 'We use a combination of continuous assessment, periodic tests, projects, and examinations. Parents receive regular updates on their child\'s progress through our parent portal and scheduled parent-teacher meetings.',
  },
  {
    question: 'Does the school offer remedial support?',
    answer: 'Yes, we provide additional academic support for students who need it, including remedial classes, peer tutoring, and one-on-one guidance from teachers.',
  },
  {
    question: 'What co-curricular activities are available?',
    answer: 'We offer a wide range of co-curricular activities including sports, arts, music, dance, drama, debate, science club, eco club, and more. These are integrated into the school schedule.',
  },
];
