'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Rocket,
  BookOpen,
  Video,
  Sparkles,
  CreditCard,
  LifeBuoy,
  Info,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Terminal,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

type SectionId = 'getting-started' | 'courses-lessons' | 'live-sessions' | 'for-creators' | 'account-billing' | 'developer-api' | 'troubleshooting';

interface DocSection {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Rocket;
}

interface ArticleBlock {
  heading: string;
  paragraphs: string[];
  list?: { items: string[]; ordered?: boolean };
  callout?: { variant: 'note' | 'tip'; text: string };
  code?: { language: string; filename?: string; snippet: string };
}

interface Article {
  slug: string;
  sectionId: SectionId;
  title: string;
  lastUpdated: string;
  readTime: string;
  intro: string;
  blocks: ArticleBlock[];
  isNew?: boolean;
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'getting-started', label: 'Getting Started', description: 'Set up your account and find your first course.', icon: Rocket },
  { id: 'courses-lessons', label: 'Courses & Lessons', description: 'Track progress, take notes, and manage resources.', icon: BookOpen },
  { id: 'live-sessions', label: 'Live Sessions', description: 'Join live classes and find replays afterwards.', icon: Video },
  { id: 'for-creators', label: 'For Creators', description: 'Build, publish, and grow your courses.', icon: Sparkles },
  { id: 'account-billing', label: 'Account & Billing', description: 'Manage your plan, payments, and refunds.', icon: CreditCard },
  { id: 'developer-api', label: 'Developer API', description: 'Integrate the catalog and subscribe to event webhooks.', icon: Terminal },
  { id: 'troubleshooting', label: 'Troubleshooting', description: 'Fix common errors and check requirements.', icon: LifeBuoy },
];

function PremiumDocIcon({ type, size = 'md' }: { type: SectionId; size?: 'sm' | 'md' | 'lg' }) {
  const boxSize = size === 'sm' ? 'h-6 w-6 rounded-lg' : size === 'lg' ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-xl';
  const svgSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const gradientId = `doc-icon-${type}`;

  const paths: Record<SectionId, React.ReactNode> = {
    'getting-started': (
      <>
        <path d="M31 7c-7 2.2-12 8.6-13.4 16.5l-7.1 3 4.2 4.2-3.2 8.8 8.8-3.2 4.2 4.2 3-7.1C35.4 32 41.8 27 44 20l-8.5-4.5L31 7Z" fill={`url(#${gradientId})`} />
        <circle cx="31.5" cy="19.5" r="4" fill="white" opacity=".95" />
        <path d="M19 36c-2.8 1.4-4.7 3.8-5.5 7.5 3.7-.8 6.1-2.7 7.5-5.5" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    'courses-lessons': (
      <>
        <path d="M11 13.5c0-2 1.7-3.5 3.7-3.1 4.8.9 8.5 2.9 11.3 6.1v27c-3.1-2.7-6.8-4.5-11.3-5.3-2-.4-3.7 1.1-3.7 3.1V13.5Z" fill={`url(#${gradientId})`} />
        <path d="M26 16.5c2.8-3.2 6.5-5.2 11.3-6.1 2-.4 3.7 1.1 3.7 3.1v27.8c0-2-1.7-3.5-3.7-3.1-4.5.8-8.2 2.6-11.3 5.3v-27Z" fill="#C4B5FD" />
        <path d="M17 20h5M17 27h5M31 20h5M31 27h5" stroke="white" strokeWidth="2.4" strokeLinecap="round" opacity=".95" />
      </>
    ),
    'live-sessions': (
      <>
        <rect x="10" y="15" width="25" height="22" rx="6" fill={`url(#${gradientId})`} />
        <path d="m35 23 9-5.5c1.4-.8 3 .2 3 1.8v13.4c0 1.6-1.6 2.6-3 1.8L35 29v-6Z" fill="#2DD4BF" />
        <circle cx="18" cy="22" r="3" fill="white" opacity=".95" />
        <path d="M17 31h10" stroke="white" strokeWidth="2.8" strokeLinecap="round" opacity=".9" />
      </>
    ),
    'for-creators': (
      <>
        <path d="M25 9 29.4 20 41 24.4 29.4 28.8 25 40 20.6 28.8 9 24.4 20.6 20 25 9Z" fill={`url(#${gradientId})`} />
        <path d="M39 8l2.3 5.7L47 16l-5.7 2.3L39 24l-2.3-5.7L31 16l5.7-2.3L39 8Z" fill="#FBBF24" />
        <path d="M37 34l1.5 3.5L42 39l-3.5 1.5L37 44l-1.5-3.5L32 39l3.5-1.5L37 34Z" fill="#2DD4BF" />
      </>
    ),
    'account-billing': (
      <>
        <rect x="9" y="14" width="38" height="28" rx="8" fill={`url(#${gradientId})`} />
        <path d="M9 22h38" stroke="white" strokeWidth="3" opacity=".9" />
        <rect x="15" y="30" width="12" height="5" rx="2.5" fill="white" opacity=".95" />
        <path d="M34 33h6" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    'developer-api': (
      <>
        <rect x="10" y="11" width="36" height="34" rx="8" fill="#111827" />
        <path d="M18 24 23 29l-5 5M29 35h10" stroke={`url(#${gradientId})`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="18" r="2" fill="#F87171" />
        <circle cx="25" cy="18" r="2" fill="#FBBF24" />
        <circle cx="32" cy="18" r="2" fill="#34D399" />
      </>
    ),
    troubleshooting: (
      <>
        <circle cx="28" cy="28" r="18" fill={`url(#${gradientId})`} />
        <path d="m17 17 7 7M39 17l-7 7M17 39l7-7M39 39l-7-7" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="28" r="6" fill="white" opacity=".95" />
        <path d="M28 22v12M22 28h12" stroke="#4F46E5" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <span className={`inline-grid shrink-0 place-items-center bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm shadow-indigo-500/5 ${boxSize}`}>
      <svg className={`${svgSize} overflow-visible`} viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="8" y1="8" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {paths[type]}
      </svg>
    </span>
  );
}

const ARTICLES: Article[] = [
  {
    slug: 'creating-an-account',
    sectionId: 'getting-started',
    title: 'Creating an Account',
    lastUpdated: 'May 12, 2026',
    readTime: '2 min read',
    intro: 'Everything you need to sign up for XE Academy and pick the right portal for how you plan to use the platform.',
    blocks: [
      {
        heading: 'Sign up with email or a provider',
        paragraphs: [
          'You can create an account using your email address and a password, or continue instantly with Google or Apple. We use Clerk for authentication, so your credentials are never stored on our own servers.',
        ],
        list: { ordered: true, items: ['Go to the sign-up page and choose Student or Creator.', 'Enter your name, email, and a password (or pick a provider).', 'Verify your email address with the 6-digit code we send you.'] },
      },
      {
        heading: 'Choosing Student or Creator',
        paragraphs: [
          'During onboarding you will be asked whether you are joining to learn or to teach. This choice determines which dashboard and navigation you see — you are not locked in permanently, and our support team can help you add a second role later.',
        ],
        callout: { variant: 'note', text: 'Creators are asked to select 1–3 teaching categories during onboarding so we can route students to the right catalog filters.' },
      },
    ],
  },
  {
    slug: 'choosing-a-course',
    sectionId: 'getting-started',
    title: 'Choosing a Course',
    lastUpdated: 'May 9, 2026',
    readTime: '3 min read',
    intro: 'A short guide to evaluating course quality and finding the right fit before you enroll.',
    blocks: [
      {
        heading: 'What to check before enrolling',
        paragraphs: ['Every course page shows the creator, total lessons, rating, and a short syllabus preview. Use these signals together rather than relying on rating alone — a newer course may not have many reviews yet.'],
        list: { items: ['Lesson count and total estimated hours', 'Whether live sessions are included', 'Creator response time in Q&A', 'Prerequisites listed on the syllabus'] },
      },
      {
        heading: 'Free previews and refunds',
        paragraphs: ['Most courses offer at least one free preview lesson. If a course turns out not to be the right fit, see Cancelling & Refunds for our refund window and process.'],
        callout: { variant: 'tip', text: 'Bookmark courses you are considering — the Bookmarking Lessons guide explains how saved items sync across devices.' },
      },
    ],
  },
  {
    slug: 'navigating-the-dashboard',
    sectionId: 'getting-started',
    title: 'Navigating the Dashboard',
    lastUpdated: 'May 9, 2026',
    readTime: '2 min read',
    intro: 'A quick tour of the sidebar, header, and the panels you will use most often.',
    blocks: [
      {
        heading: 'The sidebar',
        paragraphs: ['The left sidebar lists the views available to your role — Dashboard, My Courses, Live Sessions, and more. Resources like this Documentation page live below the main navigation, and your current plan tier is shown at the bottom.'],
      },
      {
        heading: 'The header',
        paragraphs: ['The top bar shows the title of whatever you are viewing along with a short subtitle, plus notifications and your profile menu on the right. Click your profile badge to sign out or switch roles if you have access to more than one portal.'],
      },
    ],
  },
  {
    slug: 'webhooks-integration',
    sectionId: 'developer-api',
    title: 'Webhooks Integration',
    lastUpdated: 'June 25, 2026',
    readTime: '3 min read',
    isNew: true,
    intro: 'Configure event webhooks to receive real-time JSON notifications when activities occur within your XE Academy workspace.',
    blocks: [
      {
        heading: 'Webhook events setup',
        paragraphs: [
          'Webhooks allow you to listen for workspace triggers like student enrollment, live class starts, or course builders publishing content. Set up your webhook URL in Platform Settings to receive secure HTTP POST payloads.',
        ],
      },
      {
        heading: 'Webhook JSON payload format',
        paragraphs: [
          'Webhook events are formatted in standardized JSON containing the event identifier and resource details:',
        ],
        code: {
          language: 'json',
          filename: 'enrollment-webhook.json',
          snippet: `{
  "event": "student.course.enrolled",
  "timestamp": "2026-06-25T16:00:00Z",
  "data": {
    "student_id": "usr_91238xa",
    "course_id": "course_react_19_advanced",
    "tier": "Student Pro",
    "referred_by": "marketing_campaign_q2"
  }
}`,
        },
      },
      {
        heading: 'HMAC signature verification',
        paragraphs: [
          'To ensure incoming webhooks originate securely from XE Academy, verify the SHA-256 HMAC signature passed in the `x-xe-signature` header using your webhook signing secret.',
        ],
      },
    ],
  },
  {
    slug: 'course-catalog-api',
    sectionId: 'developer-api',
    title: 'Course Catalog API',
    lastUpdated: 'June 24, 2026',
    readTime: '2 min read',
    isNew: true,
    intro: 'Integrate and query the active XE Academy course catalog directly from your external landing pages.',
    blocks: [
      {
        heading: 'Retrieve course listings',
        paragraphs: [
          'You can fetch the list of premium active courses using our REST API endpoint. Filter resources by category, rating, or creator details.',
        ],
      },
      {
        heading: 'Fetch query snippet',
        paragraphs: ['Here is an example using native javascript fetch to retrieve catalog items:'],
        code: {
          language: 'javascript',
          filename: 'catalog-fetch.js',
          snippet: `// Fetch catalog listing
const fetchCatalog = async () => {
  const url = 'https://api.xeacademy.com/v1/courses?status=published';
  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data.courses;
};

fetchCatalog().then(courses => console.log('Loaded:', courses.length));`,
        },
      },
    ],
  },
  {
    slug: 'tracking-progress',
    sectionId: 'courses-lessons',
    title: 'Tracking Progress',
    lastUpdated: 'Apr 28, 2026',
    readTime: '2 min read',
    intro: 'How XE Academy measures and displays your course completion.',
    blocks: [
      {
        heading: 'How progress is calculated',
        paragraphs: ['Progress is the percentage of lessons you have marked complete within a course. Video lessons are marked complete automatically once you reach the end; reading lessons require a manual "Mark complete" click.'],
        callout: { variant: 'note', text: 'Skipping ahead in a video will not mark it complete — playback has to reach the final few seconds.' },
      },
      {
        heading: 'Where to see it',
        paragraphs: ['Your overall progress across all enrolled courses appears on the main Dashboard. Per-course progress bars are visible on My Courses and inside the course player itself.'],
      },
    ],
  },
  {
    slug: 'taking-notes',
    sectionId: 'courses-lessons',
    title: 'Taking Notes',
    lastUpdated: 'Apr 22, 2026',
    readTime: '2 min read',
    intro: 'Capture timestamped notes while you watch a lesson and revisit them anytime.',
    blocks: [
      {
        heading: 'Adding a note',
        paragraphs: ['Open the Notes panel inside any lesson and click "Add note." Notes are automatically timestamped to the point in the video where you added them, so clicking a note later jumps playback right back to that moment.'],
      },
      {
        heading: 'Exporting your notes',
        paragraphs: ['From a course\'s notes overview you can export everything as a single text file — useful for revision before an assessment or live Q&A session.'],
      },
    ],
  },
  {
    slug: 'bookmarking-lessons',
    sectionId: 'courses-lessons',
    title: 'Bookmarking Lessons',
    lastUpdated: 'Apr 22, 2026',
    readTime: '1 min read',
    intro: 'Save lessons and courses you want to come back to later.',
    blocks: [
      {
        heading: 'Saving a lesson',
        paragraphs: ['Click the bookmark icon on any lesson or course card. Bookmarked items appear in a dedicated section of My Courses and sync across every device you are signed into.'],
      },
    ],
  },
  {
    slug: 'downloading-resources',
    sectionId: 'courses-lessons',
    title: 'Downloading Resources',
    lastUpdated: 'Apr 18, 2026',
    readTime: '2 min read',
    intro: 'Many lessons include slides, source code, or worksheets you can download for offline use.',
    blocks: [
      {
        heading: 'Where to find attachments',
        paragraphs: ['Look for the "Resources" tab inside a lesson. Attachments uploaded by the creator — PDFs, zipped project files, and slide decks — are listed there with a direct download link.'],
        callout: { variant: 'note', text: 'Downloaded files are for your personal use under the course license and should not be redistributed.' },
      },
    ],
  },
  {
    slug: 'joining-a-session',
    sectionId: 'live-sessions',
    title: 'Joining a Session',
    lastUpdated: 'May 2, 2026',
    readTime: '2 min read',
    intro: 'How to enter a live class from the Live Sessions tab, and what to expect when you arrive.',
    blocks: [
      {
        heading: 'Before the session',
        paragraphs: ['Live Sessions are filtered to the courses you are enrolled in. A session card will show a "Join" button once it goes live, or a countdown if it has not started yet. We recommend joining a minute or two early to test your mic and camera.'],
      },
      {
        heading: 'Inside the room',
        paragraphs: ['Once connected you will see the creator\'s main video feed, an optional screen-share panel, and a live chat sidebar for questions. Use the controls at the bottom to mute your mic or leave the room.'],
      },
    ],
  },
  {
    slug: 'session-etiquette',
    sectionId: 'live-sessions',
    title: 'Session Etiquette',
    lastUpdated: 'Apr 30, 2026',
    readTime: '1 min read',
    intro: 'A few guidelines that keep live sessions productive for everyone.',
    blocks: [
      {
        heading: 'Guidelines',
        paragraphs: ['Live sessions work best when the room stays focused and respectful.'],
        list: { items: ['Stay muted unless you are asked to speak', 'Use chat for questions rather than interrupting', 'Keep feedback constructive and on-topic', 'Recordings may capture chat — avoid sharing personal details'] },
      },
    ],
  },
  {
    slug: 'recordings-replays',
    sectionId: 'live-sessions',
    title: 'Recordings & Replays',
    lastUpdated: 'Apr 30, 2026',
    readTime: '2 min read',
    intro: 'Missed a live class? Most sessions are recorded and added to Past Recordings automatically.',
    blocks: [
      {
        heading: 'Finding a replay',
        paragraphs: ['Open Live Sessions and switch to the "Past Recordings" tab. Replays are typically published within a few hours of the session ending and remain available for the lifetime of your enrollment.'],
        callout: { variant: 'tip', text: 'Replays keep the original live chat alongside the video, so you can still follow along with questions that came up in real time.' },
      },
    ],
  },
  {
    slug: 'creating-a-course',
    sectionId: 'for-creators',
    title: 'Creating a Course',
    lastUpdated: 'May 15, 2026',
    readTime: '3 min read',
    intro: 'A walkthrough of building your first course in Course Builder, from outline to first published lesson.',
    blocks: [
      {
        heading: 'Start with an outline',
        paragraphs: ['Open Course Builder from My Courses and create a new draft. Begin by laying out your modules and lesson titles before recording or writing any content — this makes it much easier to spot gaps in the curriculum early.'],
      },
      {
        heading: 'Adding lesson content',
        paragraphs: ['Each lesson can contain video, written content, or both, plus downloadable resources. Drafts are saved automatically and are only visible to you until you choose to publish.'],
        callout: { variant: 'note', text: 'You can reorder modules and lessons at any time by dragging them in the builder — published students will not lose their progress.' },
      },
    ],
  },
  {
    slug: 'publishing-pricing',
    sectionId: 'for-creators',
    title: 'Publishing & Pricing',
    lastUpdated: 'May 15, 2026',
    readTime: '3 min read',
    intro: 'How to set a price, choose a launch date, and take a course live.',
    blocks: [
      {
        heading: 'Setting a price',
        paragraphs: ['Pricing is set per course and can include a discounted launch price for a limited window. We recommend reviewing similar courses in your category before settling on a number.'],
        list: { items: ['One-time purchase pricing', 'Optional limited-time launch discount', 'Bundle pricing across multiple courses (coming soon)'] },
      },
      {
        heading: 'Going live',
        paragraphs: ['Once your outline, lessons, and pricing are ready, click "Submit for review." Most courses are approved within one business day, after which they appear in the catalog immediately.'],
      },
    ],
  },
  {
    slug: 'creator-studio-analytics',
    sectionId: 'for-creators',
    title: 'Understanding Your Creator Studio Analytics',
    lastUpdated: 'May 18, 2026',
    readTime: '4 min read',
    intro: 'A breakdown of the metrics on your Creator dashboard and what they mean for your course business.',
    blocks: [
      {
        heading: 'Revenue and sales',
        paragraphs: ['The featured Revenue card on your dashboard reflects net revenue after platform fees, with a trend line comparing the selected period to the one before it. The Recent Sales list below shows individual transactions as they happen.'],
      },
      {
        heading: 'Students and watch time',
        paragraphs: ['Total Students counts unique enrollments across all of your published courses. Watch Time aggregates total minutes watched, which is a strong leading indicator of engagement before reviews start coming in.'],
        callout: { variant: 'tip', text: 'A high watch-time-to-enrollment ratio usually means your pacing and lesson length are working well — a low ratio is worth investigating lesson by lesson.' },
      },
    ],
  },
  {
    slug: 'payouts',
    sectionId: 'for-creators',
    title: 'Payouts',
    lastUpdated: 'May 18, 2026',
    readTime: '2 min read',
    intro: 'How and when you get paid for course sales.',
    blocks: [
      {
        heading: 'Payout schedule',
        paragraphs: ['Payouts are issued on a rolling monthly basis once your available balance clears the holding period shown on your Payout Health card. You can track your current balance and next payout date directly from the Creator dashboard.'],
      },
      {
        heading: 'Payout methods',
        paragraphs: ['We currently support direct bank transfer in most regions. Add or update your payout details from Settings → Billing.'],
      },
    ],
  },
  {
    slug: 'managing-your-plan',
    sectionId: 'account-billing',
    title: 'Managing Your Plan',
    lastUpdated: 'Apr 10, 2026',
    readTime: '2 min read',
    intro: 'View, upgrade, or downgrade your current plan from Settings.',
    blocks: [
      {
        heading: 'Viewing your plan',
        paragraphs: ['Your current tier is shown at the bottom of the sidebar and in full detail under Settings → Billing, alongside renewal date and included benefits.'],
      },
      {
        heading: 'Changing plans',
        paragraphs: ['Upgrades apply immediately and are prorated for the remainder of your billing cycle. Downgrades take effect at the start of your next cycle so you keep full access to what you have already paid for.'],
      },
    ],
  },
  {
    slug: 'updating-payment-info',
    sectionId: 'account-billing',
    title: 'Updating Payment Info',
    lastUpdated: 'Apr 10, 2026',
    readTime: '1 min read',
    intro: 'Keep your card or payout details current to avoid interrupted access.',
    blocks: [
      {
        heading: 'Updating a card',
        paragraphs: ['Go to Settings → Billing and select "Update payment method." Changes apply to your very next charge — there is no need to cancel and re-subscribe.'],
        callout: { variant: 'note', text: 'We never store full card numbers on our own servers; payment details are handled by our PCI-compliant billing provider.' },
      },
    ],
  },
  {
    slug: 'cancelling-refunds',
    sectionId: 'account-billing',
    title: 'Cancelling & Refunds',
    lastUpdated: 'Apr 10, 2026',
    readTime: '2 min read',
    intro: 'Our refund window and how to cancel a subscription or individual course purchase.',
    blocks: [
      {
        heading: 'Refund window',
        paragraphs: ['Individual course purchases are eligible for a full refund within 14 days of purchase, provided less than 30% of the course has been completed.'],
      },
      {
        heading: 'Cancelling a subscription',
        paragraphs: ['Subscriptions can be cancelled at any time from Settings → Billing. You will keep access until the end of the current billing period — no partial refunds are issued for unused time.'],
      },
    ],
  },
  {
    slug: 'common-errors',
    sectionId: 'troubleshooting',
    title: 'Common Errors',
    lastUpdated: 'May 1, 2026',
    readTime: '3 min read',
    intro: 'Fixes for the issues students and creators run into most often.',
    blocks: [
      {
        heading: 'Video will not play',
        paragraphs: ['This is almost always a network or browser caching issue rather than a problem with the lesson itself.'],
        list: { ordered: true, items: ['Refresh the page and try again', 'Switch to a wired or stronger Wi-Fi connection', 'Clear your browser cache, or try a private/incognito window'] },
      },
      {
        heading: '"Session expired" on sign-in',
        paragraphs: ['This usually means your authentication session timed out after a long period of inactivity. Sign in again — your progress is saved server-side and will not be affected.'],
        callout: { variant: 'note', text: 'If this happens repeatedly within the same session, check that your browser allows third-party cookies for our domain.' },
      },
    ],
  },
  {
    slug: 'browser-device-requirements',
    sectionId: 'troubleshooting',
    title: 'Browser & Device Requirements',
    lastUpdated: 'May 1, 2026',
    readTime: '1 min read',
    intro: 'Minimum requirements for the smoothest experience on XE Academy.',
    blocks: [
      {
        heading: 'Recommended setup',
        paragraphs: ['XE Academy works best on the latest version of Chrome, Safari, Firefox, or Edge. Live Sessions specifically require camera and microphone permissions to be enabled in your browser.'],
        list: { items: ['Chrome, Safari, Firefox, or Edge — latest two major versions', 'Stable internet connection of at least 5 Mbps for live video', 'Camera and microphone access enabled for Live Sessions'] },
      },
    ],
  },
];

const ARTICLE_INDEX = ARTICLES.reduce<Record<string, Article>>((acc, article) => {
  acc[article.slug] = article;
  return acc;
}, {});

function headingId(slug: string, index: number) {
  return `${slug}-h${index}`;
}

function CalloutBox({ variant, text }: { variant: 'note' | 'tip'; text: string }) {
  const isTip = variant === 'tip';
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-6 ${isTip ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-indigo-200 bg-indigo-50 text-indigo-900'}`}>
      {isTip ? <Lightbulb size={18} className="mt-0.5 flex-shrink-0 text-amber-500" /> : <Info size={18} className="mt-0.5 flex-shrink-0 text-indigo-500" />}
      <p>
        <span className="font-bold">{isTip ? 'Tip: ' : 'Note: '}</span>
        {text}
      </p>
    </div>
  );
}

function CodeBlock({ language, filename, snippet }: { language: string; filename?: string; snippet: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] font-mono text-xs text-slate-200 shadow-md">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
        <span>{filename || language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed text-slate-300">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

function NavTree({
  query,
  activeSlug,
  expanded,
  onToggleSection,
  onSelectArticle,
}: {
  query: string;
  activeSlug: string | null;
  expanded: Set<SectionId>;
  onToggleSection: (id: SectionId) => void;
  onSelectArticle: (slug: string) => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <nav className="space-y-1">
      {DOC_SECTIONS.map((section) => {
        const articles = ARTICLES.filter((article) => article.sectionId === section.id && (!normalizedQuery || article.title.toLowerCase().includes(normalizedQuery)));
        if (normalizedQuery && articles.length === 0) return null;
        const isExpanded = expanded.has(section.id) || Boolean(normalizedQuery);

        return (
          <div key={section.id} className="pb-1">
            <button
              onClick={() => onToggleSection(section.id)}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <span className="flex items-center gap-2">
                <PremiumDocIcon type={section.id} size="sm" />
                {section.label}
              </span>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isExpanded && (
              <div className="mt-0.5 space-y-0.5 pl-3">
                {articles.map((article) => {
                  const isActive = article.slug === activeSlug;
                  return (
                    <button
                      key={article.slug}
                      onClick={() => onSelectArticle(article.slug)}
                      className={`block w-full rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-all ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{article.title}</span>
                        {article.isNew && (
                          <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">NEW</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function ArticleView({ article, onSelectArticle }: { article: Article; onSelectArticle: (slug: string) => void }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const flatSlugs = ARTICLES.map((item) => item.slug);
  const currentIndex = flatSlugs.indexOf(article.slug);
  const prev = currentIndex > 0 ? ARTICLES[currentIndex - 1] : null;
  const next = currentIndex < ARTICLES.length - 1 ? ARTICLES[currentIndex + 1] : null;

  useEffect(() => {
    setFeedback(null);
  }, [article.slug]);

  return (
    <article className="pb-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
        <span>{DOC_SECTIONS.find((s) => s.id === article.sectionId)?.label}</span>
        {article.isNew && (
          <span className="bg-indigo-600 text-white rounded px-2 py-0.5 text-[9px] tracking-normal font-black">NEW SPEC</span>
        )}
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{article.title}</h1>
      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-400">
        <span>Last updated {article.lastUpdated}</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1.5"><Clock size={13} /> {article.readTime}</span>
      </div>
      <p className="mt-6 text-lg leading-7 text-slate-500">{article.intro}</p>

      <div className="mt-10 space-y-10">
        {article.blocks.map((block, index) => (
          <section key={block.heading} id={headingId(article.slug, index)} className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">{block.heading}</h2>
            <div className="mt-3 space-y-4">
              {block.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-base leading-7 text-slate-600">{paragraph}</p>
              ))}
              {block.list && (
                block.list.ordered ? (
                  <ol className="list-decimal space-y-2 pl-5 text-base leading-7 text-slate-600">
                    {block.list.items.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                ) : (
                  <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-slate-600">
                    {block.list.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )
              )}
              {block.code && (
                <CodeBlock
                  language={block.code.language}
                  filename={block.code.filename}
                  snippet={block.code.snippet}
                />
              )}
              {block.callout && <CalloutBox variant={block.callout.variant} text={block.callout.text} />}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-slate-100 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">Was this article helpful?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedback('up')}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ${feedback === 'up' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <ThumbsUp size={15} /> Yes
            </button>
            <button
              onClick={() => setFeedback('down')}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ${feedback === 'down' ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <ThumbsDown size={15} /> No
            </button>
          </div>
        </div>
        {feedback && <p className="mt-3 text-sm text-slate-400">Thanks for the feedback — it helps us improve this page.</p>}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <button onClick={() => onSelectArticle(prev.slug)} className="group flex flex-col rounded-2xl border border-slate-200 px-5 py-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400"><ChevronLeft size={14} /> Previous</span>
            <span className="mt-1 text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{prev.title}</span>
          </button>
        ) : <div />}
        {next ? (
          <button onClick={() => onSelectArticle(next.slug)} className="group flex flex-col items-end rounded-2xl border border-slate-200 px-5 py-4 text-right transition-all hover:border-indigo-200 hover:bg-indigo-50/40">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">Next <ChevronRight size={14} /></span>
            <span className="mt-1 text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{next.title}</span>
          </button>
        ) : <div />}
      </div>
    </article>
  );
}

function TableOfContents({ article, activeHeading }: { article: Article; activeHeading: string | null }) {
  return (
    <div className="sticky top-6">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">On this page</p>
      <ul className="mt-3 space-y-2 border-l border-slate-100 pl-4">
        {article.blocks.map((block, index) => {
          const id = headingId(article.slug, index);
          const isActive = activeHeading === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`block text-sm leading-6 transition-colors ${isActive ? 'font-semibold text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {block.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocsHomeAside({ onSelectSection, onSelectArticle }: { onSelectSection: (id: SectionId) => void; onSelectArticle: (slug: string) => void }) {
  return (
    <div className="sticky top-6">
      <p className="text-sm font-bold text-slate-400">Start here</p>
      <div className="mt-4 space-y-3">
        <button onClick={() => onSelectArticle('creating-an-account')} className="block text-left text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
          What you can do with XE Academy
        </button>
        <button onClick={() => onSelectSection('courses-lessons')} className="block text-left text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
          Courses and lessons
        </button>
        <button onClick={() => onSelectSection('for-creators')} className="block text-left text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
          Creator resources
        </button>
        <button onClick={() => onSelectSection('developer-api')} className="block text-left text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">
          Developer API
        </button>
      </div>

      <div className="mt-7 space-y-3 border-t border-slate-200 pt-6">
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <Copy size={15} /> Copy page
        </button>
        <button onClick={() => onSelectSection('troubleshooting')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <LifeBuoy size={15} /> Get help
        </button>
      </div>
    </div>
  );
}

function DocsHome({ query, setQuery, onSelectSection, onSelectArticle }: { query: string; setQuery: (value: string) => void; onSelectSection: (id: SectionId) => void; onSelectArticle: (slug: string) => void }) {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery ? ARTICLES.filter((article) => article.title.toLowerCase().includes(normalizedQuery)) : [];

  const totalArticles = ARTICLES.length;
  const popular = ['getting-started', 'developer-api', 'for-creators', 'account-billing']
    .map((id) => ARTICLES.find((article) => article.sectionId === id))
    .filter((article): article is Article => Boolean(article));
  const suggestions = ['Creating an account', 'Webhooks', 'Refunds', 'Live sessions'];

  return (
    <div className="max-w-4xl space-y-10">
      <section>
        <p className="text-sm font-semibold text-slate-400">Get Started</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">XE Academy Documentation</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          XE Academy helps students learn, creators publish, and teams manage education workflows. Use these guides to understand the platform, connect tools, and move faster.
        </p>

        <div className="relative mt-7 max-w-2xl">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation..."
            className="h-[52px] w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
          {matches.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 text-left shadow-2xl shadow-slate-900/12">
              {matches.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => onSelectArticle(article.slug)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-slate-800">{article.title}</span>
                    <span className="text-xs text-slate-400">{DOC_SECTIONS.find((s) => s.id === article.sectionId)?.label}</span>
                  </span>
                  <ArrowRight size={15} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10">
        <div className="grid min-h-[340px] md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative p-8 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-100 ring-1 ring-white/15">Guides</span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">Build with clarity from day one.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">Start with account setup, then move into courses, live sessions, creator workflows, billing, and developer APIs.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {suggestions.map((term) => (
                  <button key={term} onClick={() => setQuery(term)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/10 hover:bg-white/15">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-8 md:block">
            <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative ml-auto flex max-w-xs flex-col gap-3">
              {[[String(totalArticles), 'Articles'], [String(DOC_SECTIONS.length), 'Topics'], ['24h', 'Support']].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-white shadow-lg shadow-indigo-950/20 backdrop-blur-md">
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950">Start here</h2>
          <button onClick={() => onSelectSection('getting-started')} className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {popular.map((article) => {
            const section = DOC_SECTIONS.find((s) => s.id === article.sectionId);
            return (
              <button key={article.slug} onClick={() => onSelectArticle(article.slug)} className="group flex w-full items-center gap-4 py-4 text-left">
                <PremiumDocIcon type={section?.id ?? 'getting-started'} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-slate-900 group-hover:text-indigo-600">{article.title}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><Clock size={13} /> {article.readTime}</span>
                </span>
                <ArrowRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 border-b border-slate-200 pb-3 text-xl font-extrabold tracking-tight text-slate-950">Browse by topic</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {DOC_SECTIONS.map((section) => {
            const count = ARTICLES.filter((a) => a.sectionId === section.id).length;
            return (
              <button key={section.id} onClick={() => onSelectSection(section.id)} className="group flex items-start gap-3 text-left">
                <span className="mt-1">
                  <PremiumDocIcon type={section.id} size="md" />
                </span>
                <span>
                  <span className="flex items-center gap-2 text-base font-bold text-slate-950 group-hover:text-indigo-600">
                    {section.label} <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">{section.description}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-slate-400">{count} articles</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <PremiumDocIcon type="troubleshooting" size="lg" />
          <div>
            <p className="text-sm font-bold text-slate-900">Can’t find what you’re looking for?</p>
            <p className="text-sm text-slate-500">Browse the API docs or contact support for product-specific help.</p>
          </div>
        </div>
        <button
          onClick={() => onSelectArticle('webhooks-integration')}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          Developer API <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Documentation() {
  const [query, setQuery] = useState('');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<SectionId>>(new Set(['getting-started']));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeArticle = activeSlug ? ARTICLE_INDEX[activeSlug] : null;

  const toggleSection = (id: SectionId) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectArticle = (slug: string) => {
    setActiveSlug(slug);
    setMobileNavOpen(false);
    setQuery('');
    setExpanded((current) => {
      const article = ARTICLE_INDEX[slug];
      const next = new Set(current);
      if (article) next.add(article.sectionId);
      return next;
    });
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'auto' }));
  };

  const selectSection = (id: SectionId) => {
    setExpanded((current) => new Set(current).add(id));
    const firstArticle = ARTICLES.find((article) => article.sectionId === id);
    if (firstArticle) selectArticle(firstArticle.slug);
  };

  useEffect(() => {
    if (!activeArticle || !contentRef.current) return;
    const scrollRoot = contentRef.current;
    const headingEls = activeArticle.blocks
      .map((_, index) => document.getElementById(headingId(activeArticle.slug, index)))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveHeading(visible[0].target.id);
        }
      },
      { root: scrollRoot, rootMargin: '-10% 0px -70% 0px', threshold: 0.1 }
    );

    headingEls.forEach((el) => observer.observe(el));
    setActiveHeading(headingEls[0].id);
    return () => observer.disconnect();
  }, [activeArticle]);

  return (
    <div className="grid w-full animate-in grid-cols-1 items-start gap-8 fade-in duration-500 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Desktop Left Sidebar Panel */}
      <aside className="sticky top-4 hidden max-h-[calc(100vh-120px)] overflow-y-auto border-r border-slate-200 pr-6 lg:block">
        <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Documentation</div>
        <NavTree query={query} activeSlug={activeSlug} expanded={expanded} onToggleSection={toggleSection} onSelectArticle={selectArticle} />
      </aside>

      {/* Mobile Sticky Mini Header bar */}
      <div className="col-span-1 flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNavOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-50">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-slate-900">Docs Navigation</span>
        </div>
        {activeSlug && (
          <button
            onClick={() => setActiveSlug(null)}
            className="text-xs font-semibold text-primary"
          >
            Back to Home
          </button>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileNavOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>
            <NavTree query={query} activeSlug={activeSlug} expanded={expanded} onToggleSection={toggleSection} onSelectArticle={selectArticle} />
          </div>
        </div>
      )}

      {/* Main Content Area Container */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-10 xl:grid-cols-[minmax(0,1fr)_240px]">
        {/* Main Content Card */}
        <div ref={contentRef} className="relative min-h-[600px] w-full">
          {/* Breadcrumb path */}
          {activeSlug && (
            <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
              <button onClick={() => setActiveSlug(null)} className="hover:text-primary transition-colors">Documentation</button>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-semibold">{activeArticle?.title}</span>
            </div>
          )}

          {activeArticle ? (
            <ArticleView article={activeArticle} onSelectArticle={selectArticle} />
          ) : (
            <DocsHome query={query} setQuery={setQuery} onSelectSection={selectSection} onSelectArticle={selectArticle} />
          )}
        </div>

        {/* Right Table of Contents (Desktop Sticky) */}
        {activeArticle && (
          <aside className="sticky top-4 hidden max-h-[calc(100vh-120px)] overflow-y-auto border-l border-slate-200 pl-6 xl:block">
            <TableOfContents article={activeArticle} activeHeading={activeHeading} />
          </aside>
        )}
        {!activeArticle && (
          <aside className="sticky top-4 hidden max-h-[calc(100vh-120px)] overflow-y-auto border-l border-slate-200 pl-6 xl:block">
            <DocsHomeAside onSelectSection={selectSection} onSelectArticle={selectArticle} />
          </aside>
        )}
      </div>
    </div>
  );
}
