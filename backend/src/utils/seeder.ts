import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';
import { User, Submission, Recommendation, Notification, PublicDataset } from '../models/db.types';

const CATEGORIES: Submission['category'][] = [
  'Roads & Transport', 'Water Supply', 'Electricity & Power',
  'Sanitation & Waste', 'Healthcare', 'Education', 'Public Spaces', 'Other'
];

const URGENCIES: Submission['urgency'][] = ['low', 'medium', 'high', 'critical'];

const DEMO_COMPLAINTS = [
  // Hindi - Water Supply
  { title: 'पानी की समस्या - मुख्य सड़क', description: 'पिछले 3 दिनों से पानी नहीं आ रहा। बच्चे स्कूल नहीं जा पा रहे।', category: 'Water Supply', urgency: 'critical' as const, lat: 28.6141, lng: 77.2096, district: 'New Delhi', state: 'Delhi', village: 'Paharganj', scheme: 'Jal Jeevan Mission' },
  { title: 'सड़क टूटी हुई - बड़ा हादसा होगा', description: 'NH8 पर गड्ढे बहुत बड़े हो गए हैं। 2 बाइक दुर्घटनाएं हो चुकी हैं इस महीने।', category: 'Roads & Transport', urgency: 'critical' as const, lat: 28.5200, lng: 77.1800, district: 'New Delhi', state: 'Delhi', village: 'Vasant Kunj', scheme: 'PMGSY' },
  { title: 'बिजली 10 घंटे नहीं आती', description: 'गर्मी में 10-12 घंटे बिजली नहीं आती। मरीज़ और बच्चे परेशान हैं।', category: 'Electricity & Power', urgency: 'high' as const, lat: 28.6800, lng: 77.0500, district: 'New Delhi', state: 'Delhi', village: 'Najafgarh', scheme: 'DDUGJY' },
  { title: 'कूड़ा उठाव बंद है 1 हफ्ते से', description: 'सफाई कर्मी 7 दिन से नहीं आए। गली में बदबू और बीमारी का डर।', category: 'Sanitation & Waste', urgency: 'high' as const, lat: 28.6530, lng: 77.2300, district: 'New Delhi', state: 'Delhi', village: 'Laxmi Nagar', scheme: 'Swachh Bharat Mission' },
  // Bengali - Various
  { title: 'রাস্তা খারাপ, বর্ষায় যাতায়াত অসম্ভব', description: 'গ্রামের মেঠো রাস্তা এখন বর্ষায় কাদায় ভরে গেছে। স্কুলের বাচ্চারা আসতে পারছে না।', category: 'Roads & Transport', urgency: 'high' as const, lat: 22.4300, lng: 87.3100, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Kharagpur I', scheme: 'PMGSY' },
  { title: 'জল পাওয়া যাচ্ছে না - হ্যান্ডপাম্প নষ্ট', description: 'গ্রামের একমাত্র হ্যান্ডপাম্প নষ্ট। মহিলারা ৩ কিমি দূরে যাচ্ছেন জলের জন্য।', category: 'Water Supply', urgency: 'critical' as const, lat: 22.5000, lng: 87.2500, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Narayangarh', scheme: 'Jal Jeevan Mission' },
  { title: 'স্বাস্থ্য কেন্দ্র বন্ধ ৩ মাস', description: 'গ্রামের PHC ৩ মাস ধরে বন্ধ। ডাক্তার নেই। মা ও শিশু স্বাস্থ্য বিপদে।', category: 'Healthcare', urgency: 'critical' as const, lat: 22.3800, lng: 87.4000, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Ghatal', scheme: 'National Health Mission' },
  { title: 'স্কুলে শৌচালয় নেই মেয়েদের জন্য', description: 'মাধ্যমিক বিদ্যালয়ে মেয়েদের আলাদা শৌচালয় নেই। অনেক মেয়ে স্কুল ছেড়ে দিচ্ছে।', category: 'Education', urgency: 'high' as const, lat: 22.4800, lng: 87.3500, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Salboni', scheme: 'Samagra Shiksha' },
  // Tamil - Various
  { title: 'தண்ணீர் பிரச்சினை - குழாய் உடைந்தது', description: 'முக்கிய குழாய் 5 நாட்களாக உடைந்து கிடக்கிறது. 500 குடும்பங்களுக்கு தண்ணீர் இல்லை.', category: 'Water Supply', urgency: 'critical' as const, lat: 12.9600, lng: 77.5900, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Kengeri', scheme: 'AMRUT' },
  { title: 'சாலை பழுது - வாகன விபத்துகள்', description: 'Outer Ring Road-ல் பெரிய குழிகள். கடந்த மாதம் 3 விபத்துகள் நடந்தன. உடனடி சரி செய்யவும்.', category: 'Roads & Transport', urgency: 'critical' as const, lat: 12.9700, lng: 77.6000, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Electronic City', scheme: 'Smart Cities Mission' },
  { title: 'மின்சாரம் வரவில்லை 8 மணி நேரம்', description: 'தினமும் 8-10 மணி நேரம் மின்சாரம் இல்லை. தொழில் நிறுவனங்கள் பாதிக்கப்படுகின்றன.', category: 'Electricity & Power', urgency: 'high' as const, lat: 13.0100, lng: 77.5500, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Yelahanka', scheme: 'DDUGJY' },
  // English complaints
  { title: 'Dangerous open manhole on MG Road', description: 'Open manhole on MG Road has been uncovered for 10 days. A scooterist fell in last week and was injured. Immediate cover needed.', category: 'Public Spaces', urgency: 'critical' as const, lat: 12.9750, lng: 77.6060, district: 'Bengaluru Urban', state: 'Karnataka', village: 'MG Road', scheme: 'Smart Cities Mission' },
  { title: 'Garbage not collected for 2 weeks', description: 'BBMP garbage collection has stopped in Ward 109. Mountains of garbage near school. Disease outbreak feared.', category: 'Sanitation & Waste', urgency: 'high' as const, lat: 12.9800, lng: 77.5700, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Rajajinagar', scheme: 'Swachh Bharat Mission' },
  { title: 'Primary school building collapsed wall', description: 'The boundary wall of Govt Primary School No. 4 has partially collapsed after rains. Children at risk.', category: 'Education', urgency: 'critical' as const, lat: 13.0000, lng: 77.5800, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Hebbal', scheme: 'Samagra Shiksha' },
  { title: 'No street lights on highway stretch', description: '3 km stretch of NH-48 has no functional street lights. Multiple accidents in last 6 months. Night travel is very dangerous.', category: 'Electricity & Power', urgency: 'high' as const, lat: 12.9500, lng: 77.6500, district: 'Bengaluru Urban', state: 'Karnataka', village: 'Hosur Road', scheme: 'DDUGJY' },
  { title: 'Community health center out of medicine', description: 'PHC Ward 24 has been out of basic medicines for 3 weeks. Patients are turning away. Malaria season approaching.', category: 'Healthcare', urgency: 'critical' as const, lat: 22.5200, lng: 87.3000, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Kharagpur II', scheme: 'National Health Mission' },
  { title: 'Pothole caused accident near market', description: 'A 2-foot pothole near the main vegetable market caused a truck to skid. Road has not been repaired in 2 years.', category: 'Roads & Transport', urgency: 'high' as const, lat: 28.6300, lng: 77.2200, district: 'New Delhi', state: 'Delhi', village: 'Okhla', scheme: 'PMGSY' },
  { title: 'Water contamination - yellow water from taps', description: 'Tap water has turned yellow in the last week. Children are falling ill. Government must test and fix the water pipeline.', category: 'Water Supply', urgency: 'critical' as const, lat: 28.7000, lng: 77.1500, district: 'New Delhi', state: 'Delhi', village: 'Rohini', scheme: 'Jal Jeevan Mission' },
  { title: 'Park maintenance neglected for 6 months', description: 'The Ambedkar Park in our ward has broken benches, no lights, and overgrown grass. Children have nowhere to play.', category: 'Public Spaces', urgency: 'medium' as const, lat: 28.5900, lng: 77.2700, district: 'New Delhi', state: 'Delhi', village: 'Noida Ext', scheme: 'Smart Cities Mission' },
  { title: 'Hospital OPD closed on weekends', description: 'District hospital OPD is closed on Saturdays and Sundays. Emergency patients from rural areas suffer massively.', category: 'Healthcare', urgency: 'high' as const, lat: 22.4600, lng: 87.3300, district: 'Paschim Medinipur', state: 'West Bengal', village: 'Medinipur', scheme: 'Ayushman Bharat' },
];

// Extend with more similar-category complaints
const EXTRA_COMPLAINTS = [
  { title: 'Road repair needed urgently', description: 'Road full of potholes after monsoon. Vehicles getting damaged daily.', category: 'Roads & Transport', urgency: 'medium' as const },
  { title: 'Water pipe burst on main road', description: 'Water flowing continuously on road for 5 days. Nobody attended.', category: 'Water Supply', urgency: 'high' as const },
  { title: 'Power line hanging dangerously', description: 'Broken electric wire hanging near school. Dangerous for kids.', category: 'Electricity & Power', urgency: 'critical' as const },
  { title: 'Open drains breeding mosquitoes', description: 'Uncovered drains in Ward 8 are breeding grounds. Dengue cases increasing.', category: 'Sanitation & Waste', urgency: 'high' as const },
  { title: 'Doctor not visiting rural PHC', description: 'MBBS doctor has not visited our PHC for 3 weeks. Nurse managing alone.', category: 'Healthcare', urgency: 'critical' as const },
  { title: 'School has no drinking water', description: 'Government school students drinking from open well. Contamination risk.', category: 'Education', urgency: 'high' as const },
  { title: 'Street lights not working', description: 'Street lights in main bazaar area have been off for 2 months.', category: 'Electricity & Power', urgency: 'medium' as const },
  { title: 'Garbage dump near residential area', description: 'Municipality has created unauthorized dump near housing colony.', category: 'Sanitation & Waste', urgency: 'high' as const },
  { title: 'Road divider damaged causing accidents', description: 'Road divider on state highway damaged. 3 accidents this month.', category: 'Roads & Transport', urgency: 'critical' as const },
  { title: 'Borewell motor stolen', description: 'Community borewell motor stolen 2 weeks ago. No water supply.', category: 'Water Supply', urgency: 'critical' as const },
];

const DEMO_USERS = [
  { uid: 'usr_citizen_demo', name: 'Citizen Demo', email: 'citizen.demo@jansetu.in', password: 'Citizen@123', role: 'citizen' as const, constituency: 'New Delhi' },
  { uid: 'usr_officer_demo', name: 'Dr. Suresh Bose (Officer)', email: 'officer.demo@jansetu.in', password: 'Officer@123', role: 'officer' as const, constituency: 'Paschim Medinipur' },
  { uid: 'usr_mp_demo', name: 'Mohan Reddy (MP)', email: 'mp.demo@jansetu.in', password: 'MP@123', role: 'mp' as const, constituency: 'Bengaluru Urban' },
  { uid: 'usr_admin_demo', name: 'Admin Demo', email: 'admin.demo@jansetu.in', password: 'Admin@123', role: 'admin' as const, constituency: 'New Delhi' },
  
  { uid: 'usr_arjun', name: 'Arjun Kumar', email: 'citizen.arjun@demo.jansetu.in', password: 'demo1234', role: 'citizen' as const, constituency: 'New Delhi' },
  { uid: 'usr_priya', name: 'Priya Sharma', email: 'citizen.priya@demo.jansetu.in', password: 'demo1234', role: 'citizen' as const, constituency: 'Paschim Medinipur' },
  { uid: 'usr_ravi', name: 'Ravi Naidu', email: 'citizen.ravi@demo.jansetu.in', password: 'demo1234', role: 'citizen' as const, constituency: 'Bengaluru Urban' },
  { uid: 'usr_anita', name: 'Anita Devi', email: 'citizen.anita@demo.jansetu.in', password: 'demo1234', role: 'citizen' as const, constituency: 'New Delhi' },
  { uid: 'usr_mohan', name: 'Mohan Reddy', email: 'mp.mohan@demo.jansetu.in', password: 'demo1234', role: 'mp' as const, constituency: 'Bengaluru Urban' },
  { uid: 'usr_suresh', name: 'Dr. Suresh Bose', email: 'officer.suresh@demo.jansetu.in', password: 'demo1234', role: 'officer' as const, constituency: 'Paschim Medinipur' },
  { uid: 'usr_admin', name: 'Admin User', email: 'admin@demo.jansetu.in', password: 'demo1234', role: 'admin' as const, constituency: 'New Delhi' },
];

const ID = () => Math.random().toString(36).substr(2, 9);
const RND = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const seedDemoData = async (): Promise<{ seeded: number; message: string }> => {
  try {
    console.log('🌱 DEMO SEEDER: Starting seed operation...');

    // ──── 1. Seed users ────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const userIds: string[] = [];

    for (const u of DEMO_USERS) {
      const uid = u.uid;
      userIds.push(uid);
      const passwordHash = await bcrypt.hash(u.password, salt);
      
      await db.addDoc('users', uid, {
        uid,
        email: u.email,
        name: u.name,
        displayName: u.name,
        role: u.role,
        constituency: u.constituency,
        passwordHash,
        status: 'Active',
        createdAt: new Date(Date.now() - RND(1, 90) * 86400000).toISOString()
      });

      // Synchronize with Firebase Auth if Firebase Admin is enabled
      if (!db.isLocal) {
        try {
          const { admin } = await import('../config/firebase');
          await admin.auth().createUser({
            uid,
            email: u.email,
            password: u.password,
            displayName: u.name,
          });
          console.log(`Created Firebase Auth user: ${u.email}`);
        } catch (err: any) {
          if (err.code === 'auth/email-already-exists' || err.code === 'auth/uid-already-exists') {
            try {
              const { admin } = await import('../config/firebase');
              await admin.auth().updateUser(uid, {
                password: u.password,
                displayName: u.name,
              });
              console.log(`Updated Firebase Auth user: ${u.email}`);
            } catch (updateErr) {
              console.warn(`Could not update Firebase Auth user ${u.email}:`, updateErr);
            }
          } else {
            console.warn(`Could not create Firebase Auth user ${u.email}:`, err.message || err);
          }
        }
      }
    }

    // ──── 2. Seed PublicDataset ────────────────────────
    const datasets: PublicDataset[] = [
      {
        id: 'pd_delhi', constituency: 'New Delhi', population: 450000, roadDensity: 2.1,
        waterAvailability: 72, electricityAvailability: 89, schoolsCount: 63, hospitalsCount: 11,
        gaps: {
          waterSupply: ['Arsenic contamination in wards 14-18', 'Borewell failures in outer areas'],
          healthcare: ['No CHC in 4 rural clusters', 'Shortage of MBBS doctors'],
          schools: ['Girls toilet missing in 8 schools', 'Science lab missing in 12 schools'],
          roads: ['3 feeder roads unmettalled', 'NH connector missing at 2 junctions']
        },
        hospitalLocations: [{ lat: 28.6500, lng: 77.2200, name: 'Ram Manohar Lohia Hospital' }],
        schoolLocations: [{ lat: 28.6200, lng: 77.2100, name: 'Govt Senior Secondary School, Roop Nagar' }],
        roadLocations: [], waterLocations: []
      },
      {
        id: 'pd_medi', constituency: 'Paschim Medinipur', population: 280000, roadDensity: 0.9,
        waterAvailability: 55, electricityAvailability: 76, schoolsCount: 42, hospitalsCount: 5,
        gaps: {
          waterSupply: ['No functional handpumps in 3 villages', 'River water contamination'],
          healthcare: ['PHC doctor vacancy 40%', 'No ambulance in 2 blocks'],
          schools: ['Roof repair needed in 6 schools', 'Toilet missing in 9 schools'],
          roads: ['7 village roads earthen', '2 bridges damaged']
        },
        hospitalLocations: [{ lat: 22.4200, lng: 87.3200, name: 'Midnapore Medical College' }],
        schoolLocations: [{ lat: 22.4500, lng: 87.3400, name: 'Midnapore Collegiate School' }],
        roadLocations: [], waterLocations: []
      },
      {
        id: 'pd_blr', constituency: 'Bengaluru Urban', population: 650000, roadDensity: 3.5,
        waterAvailability: 81, electricityAvailability: 94, schoolsCount: 89, hospitalsCount: 22,
        gaps: {
          waterSupply: ['Water pressure low in outer wards', 'Old pipeline replacements due'],
          healthcare: ['Long OPD wait times', 'Specialist shortage in East zone'],
          schools: ['Digital lab missing in 14 schools'],
          roads: ['15 km inner ring roads potholed', 'Sidewalk missing on 8 km stretch']
        },
        hospitalLocations: [{ lat: 12.9700, lng: 77.6000, name: 'Victoria Hospital Bengaluru' }],
        schoolLocations: [{ lat: 12.9650, lng: 77.5800, name: 'Central High School Jayanagar' }],
        roadLocations: [], waterLocations: []
      }
    ];
    for (const d of datasets) {
      await db.addDoc('publicDatasets', d.id, d);
    }

    // ──── 3. Seed Submissions ──────────────────────────
    const citizenIds = userIds.slice(0, 4);
    const citizenNames = DEMO_USERS.slice(0, 4).map(u => u.name);
    const allComplaints = [...DEMO_COMPLAINTS] as any[];

    // Add extra complaints with varying locations
    const baseCoords: Record<string, [number, number]> = {
      'New Delhi': [28.62, 77.21],
      'Paschim Medinipur': [22.45, 87.32],
      'Bengaluru Urban': [12.97, 77.59],
    };
    const constituencies = ['New Delhi', 'Paschim Medinipur', 'Bengaluru Urban'];
    const districts = ['New Delhi', 'Paschim Medinipur', 'Bengaluru Urban'];
    const states = ['Delhi', 'West Bengal', 'Karnataka'];

    for (let i = 0; i < EXTRA_COMPLAINTS.length * 20; i++) {
      const ec = EXTRA_COMPLAINTS[i % EXTRA_COMPLAINTS.length];
      const constIdx = i % 3;
      const base = baseCoords[constituencies[constIdx]];
      allComplaints.push({
        ...ec,
        title: `${ec.title} (#${i + 21})`,
        description: ec.description,
        category: ec.category as Submission['category'],
        urgency: URGENCIES[RND(0, 3)],
        lat: base[0] + (Math.random() - 0.5) * 0.3,
        lng: base[1] + (Math.random() - 0.5) * 0.3,
        district: districts[constIdx],
        state: states[constIdx],
        village: `Village ${String.fromCharCode(65 + (i % 12))}`,
        scheme: ['PMGSY', 'Jal Jeevan Mission', 'MPLADS', 'Swachh Bharat', 'DDUGJY'][i % 5]
      });
    }

    // Shuffle and limit to 200 (150+ complaints and 50+ suggestions)
    const shuffled = allComplaints.sort(() => Math.random() - 0.5).slice(0, 200);

    let complaintCount = 0;
    for (const c of shuffled) {
      const id = 'sub_' + ID();
      const cIdx = RND(0, citizenIds.length - 1);
      const priority = RND(35, 97);
      const confidence = RND(78, 98);
      const daysAgo = RND(0, 60);

      // Classify first 150 as complaint, remaining 50 as suggestion
      const subType = complaintCount < 150 ? 'complaint' : 'suggestion';
      complaintCount++;

      const submission: Submission = {
        id, citizenId: citizenIds[cIdx], citizenName: citizenNames[cIdx],
        title: c.title, description: c.description,
        category: (c.category || 'Other') as Submission['category'],
        type: subType,
        source: ['portal', 'whatsapp', 'sms'][RND(0, 2)] as any,
        department: subType === 'complaint' ? 'Public Works Department (PWD)' : undefined,
        assignedOfficerId: subType === 'complaint' ? 'usr_officer' : undefined,
        assignedOfficerName: subType === 'complaint' ? 'Dr. Suresh Bose' : undefined,
        timeline: [
          { status: 'Submitted', description: 'Grievance logged in portal/whatsapp.', updatedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
          { status: 'AI Analysis', description: 'Gemini workflow completed. Category and urgency generated.', updatedAt: new Date(Date.now() - 3.5 * 86400000).toISOString() },
          { status: 'Officer Verification', description: 'Grievance verified by inspection officer.', updatedAt: new Date(Date.now() - 3 * 86400000).toISOString() }
        ],
        location: {
          lat: (c as any).lat || 28.62 + (Math.random() - 0.5) * 0.5,
          lng: (c as any).lng || 77.21 + (Math.random() - 0.5) * 0.5,
          address: `${(c as any).village || 'Local Area'}, ${(c as any).district || 'New Delhi'}`,
          village: (c as any).village, district: (c as any).district || 'New Delhi',
          state: (c as any).state || 'Delhi',
        },
        status: ['pending', 'pending', 'in_progress', 'resolved'][RND(0, 3)] as any,
        urgency: (c.urgency || 'medium') as Submission['urgency'],
        priorityScore: priority, confidenceScore: confidence,
        aiAnalysis: {
          detectedLanguage: ['Hindi', 'Bengali', 'Tamil', 'English'][RND(0, 3)],
          englishTranslation: c.description,
          summary: c.description.substring(0, 120),
          sentiment: ['positive', 'neutral', 'negative'][RND(0, 2)] as any,
          urgencyReasoning: `Urgency determined based on safety impact and affected population estimates.`,
          suggestedSchemes: [(c as any).scheme || 'MPLADS'],
          isDuplicate: RND(0, 5) === 0,
          evidence: ['Documented by citizen', 'Geo-verified location'],
          uncertaintyLevel: 'low',
        },
        createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.addDoc('submissions', id, submission);

      // Notify citizen
      const notifId = 'notif_' + ID();
      const notif: Notification = {
        id: notifId, userId: citizenIds[cIdx],
        title: 'Submission Received',
        message: `Your report "${c.title}" was logged. Priority Score: ${priority}.`,
        type: 'info', isRead: Math.random() > 0.3,
        createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString()
      };
      await db.addDoc('notifications', notifId, notif);
    }

    // ──── 4. Seed Recommendations ─────────────────────
    const recTemplates = [
      { cat: 'Water Supply', const: 'New Delhi', title: 'Ward 14-18 Drinking Water Pipeline Upgrade', budget: 1850000, timeline: '3-5 months', sdg: ['SDG 6: Clean Water'], schemes: ['Jal Jeevan Mission', 'AMRUT'], reduction: 88 },
      { cat: 'Roads & Transport', const: 'Paschim Medinipur', title: 'Kharagpur-Narayangarh Feeder Road Blacktopping', budget: 3200000, timeline: '4-6 months', sdg: ['SDG 9: Infrastructure'], schemes: ['PMGSY'], reduction: 82 },
      { cat: 'Healthcare', const: 'Paschim Medinipur', title: 'Rural PHC Doctor Deployment & Medicine Supply', budget: 620000, timeline: '1-2 months', sdg: ['SDG 3: Good Health'], schemes: ['NHM', 'Ayushman Bharat'], reduction: 91 },
      { cat: 'Electricity & Power', const: 'New Delhi', title: 'Outer Ward Power Grid Feeder Separation', budget: 2400000, timeline: '3-4 months', sdg: ['SDG 7: Clean Energy'], schemes: ['DDUGJY', 'Saubhagya'], reduction: 79 },
      { cat: 'Sanitation & Waste', const: 'Bengaluru Urban', title: 'Ward 109 Solid Waste Management System', budget: 950000, timeline: '2-3 months', sdg: ['SDG 12: Responsible Production'], schemes: ['Swachh Bharat Mission'], reduction: 85 },
      { cat: 'Education', const: 'Bengaluru Urban', title: 'School Sanitation & Digital Lab Construction', budget: 1100000, timeline: '3-4 months', sdg: ['SDG 4: Quality Education'], schemes: ['Samagra Shiksha'], reduction: 76 },
    ];

    for (const rt of recTemplates) {
      const id = 'rec_' + ID();
      const rec: Recommendation = {
        id, title: rt.title, description: `Comprehensive infrastructure development project to address ${rt.cat.toLowerCase()} deficit.`,
        category: rt.cat, constituency: rt.const, linkedSubmissions: [],
        priorityScore: RND(72, 95), confidenceScore: RND(85, 97),
        populationImpact: RND(800, 3500), infrastructureGapIndex: RND(6, 9),
        estimatedBudget: rt.budget, estimatedTimeline: rt.timeline,
        governmentSchemes: rt.schemes, riskAnalysis: 'Seasonal weather delays, land documentation.',
        benefits: `Directly resolves citizen-reported ${rt.cat} issues and provides lasting infrastructure improvement.`,
        expectedComplaintReduction: rt.reduction,
        sdgMapping: rt.sdg, reasoning: 'Selected based on AI analysis of clustered citizen submissions and infrastructure gap index.',
        retrievedDocuments: [`${rt.schemes[0]} Guidelines`, 'MPLADS Master Guidelines 2023'],
        status: ['proposed', 'approved', 'proposed'][RND(0, 2)] as any,
        responsibleDepartment: rt.cat === 'Water Supply' ? 'Ministry of Water Resources & Jal Jeevan' : rt.cat === 'Roads & Transport' ? 'Public Works Department (PWD)' : 'Municipal Sanitation & Solid Waste Dept',
        assignedOfficerId: 'usr_officer',
        assignedOfficerName: 'Dr. Suresh Bose',
        environmentalImpact: 'Green project design. Materials locally sourced. Zero net emissions impact on local ecology.',
        createdAt: new Date(Date.now() - RND(1, 30) * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addDoc('recommendations', id, rec);
    }

    console.log('✅ DEMO SEEDER: Seed complete!');
    return { seeded: shuffled.length, message: `Demo data seeded: ${shuffled.length} complaints, ${datasets.length} public datasets, ${recTemplates.length} recommendations.` };
  } catch (err) {
    console.error('DEMO SEEDER ERROR:', err);
    throw err;
  }
};
