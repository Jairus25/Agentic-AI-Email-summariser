import { EmailMessage } from '../types';

export const SAMPLE_EMAILS: EmailMessage[] = [
  {
    id: 'sample-1',
    sender: 'sarah.connor@quantumtech.io',
    senderName: 'Sarah Connor',
    subject: 'Q3 Product Roadmap Review & Urgent Sign-off Required',
    date: '10:15 AM',
    timestamp: Date.now() - 1000 * 60 * 35,
    read: false,
    priority: 'high',
    category: 'work',
    snippet: 'Hi team, please find attached the revised Q3 roadmap. We need final executive approvals by 4 PM today.',
    bodySnippet: `Hi team,

I have finalized the Q3 Product Roadmap based on last week's design sprints and engineering bandwidth calculations. We are prioritizing the mobile audio streaming engine and the automated inbox triage feature.

Critical action: We need final executive approval on slide 14 regarding third-party cloud audio budget before our 4:00 PM EST go/no-go meeting today. Please review the linked slide deck and add your comments or sign-off directly in the doc.

Looking forward to catching up soon,
Sarah Connor
VP of Product`,
    summary: {
      headline: 'Urgent sign-off needed on Q3 Roadmap slide 14 by 4 PM today.',
      keyPoints: [
        'Prioritizes mobile audio streaming engine and automated inbox triage.',
        'Final go/no-go meeting set for 4:00 PM EST today.',
        'Requires review and sign-off on slide 14 regarding cloud audio budget.'
      ],
      actionItems: ['Review slide 14 in the attached deck', 'Submit sign-off before 4 PM EST'],
      sentiment: 'action_required',
      audioNarrationText: 'Urgent email from Sarah Connor: Final approval is required on the Q3 roadmap by 4 PM today. The priority focus is on mobile audio streaming and automated inbox triage. Please review slide 14 regarding cloud audio budget before the afternoon sync.',
      estimatedReadSeconds: 18,
      reasoning: 'Sender is VP of Product requesting mandatory executive sign-off before 4 PM EST today for go/no-go meeting. Core topic is Q3 roadmap budget for cloud audio and automated inbox triage. Sentiment is action_required and urgency is high due to same-day deadline.'
    },
    starred: true,
    completedActionItems: [],
    inferenceLatencyMs: 1140
  },
  {
    id: 'sample-2',
    sender: 'billing-alert@cloudservices.net',
    senderName: 'CloudServices Billing',
    subject: 'Monthly Invoice #CS-89210 Ready (Auto-payment scheduled)',
    date: '08:45 AM',
    timestamp: Date.now() - 1000 * 60 * 125,
    read: true,
    starred: false,
    priority: 'medium',
    category: 'finance',
    snippet: 'Your monthly statement for July has been generated. Total balance of $412.50 will be auto-debited on the 20th.',
    bodySnippet: `Dear Customer,

Your statement for account #994821 is now ready for viewing. 
Summary:
- Total compute & API usage: $380.00
- Storage tier: $32.50
- Total Due: $412.50 USD

Auto-charge is scheduled for your card ending in 4102 on July 20th. No manual action is required unless you wish to update billing credentials or download the tax receipt.

Thank you for your business.`,
    summary: {
      headline: 'Monthly cloud invoice of $412.50 scheduled for auto-pay on July 20th.',
      keyPoints: [
        'Invoice #CS-89210 covers compute, API usage, and storage tiers.',
        'Card ending in 4102 will be debited automatically on the 20th.',
        'No action required unless updating payment method or needing tax receipt.'
      ],
      actionItems: ['None required (Auto-debit on 20th)'],
      sentiment: 'neutral',
      audioNarrationText: 'Notice from CloudServices Billing: Your monthly invoice of 412 dollars and 50 cents has been generated. Payment is scheduled to be automatically charged to your card ending in 4102 on July 20th. No action is required.',
      estimatedReadSeconds: 15,
      reasoning: 'Standard automated transaction receipt. Balance $412.50 scheduled for auto-pay on the 20th. No manual user intervention required unless changing payment method. Sentiment classified as neutral and priority medium.'
    },
    completedActionItems: [],
    inferenceLatencyMs: 980
  },
  {
    id: 'sample-3',
    sender: 'alex.rivera@designweekly.co',
    senderName: 'Alex Rivera',
    subject: 'Invitation: Keynote Speaker at Mobile UX Summit 2026',
    date: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    read: true,
    starred: true,
    priority: 'medium',
    category: 'personal',
    snippet: 'We loved your recent work on voice interfaces and would be thrilled to host you as a keynote speaker this October.',
    bodySnippet: `Hello!

Our program committee has been following your recent breakthroughs in voice-driven executive dashboards and mobile workflow agents. We believe our attendees would gain tremendous value from your insights.

The Mobile UX Summit takes place October 14-16 in San Francisco (with hybrid streaming). We cover all speaker travel, hotel, and an honorarium.

Could you let us know if you would be open to a 30-minute keynote slot by next Monday? We can schedule a brief 10-minute briefing whenever convenient.

Warm regards,
Alex Rivera
Program Director`,
    summary: {
      headline: 'Invitation to give a 30-minute keynote at Mobile UX Summit in October.',
      keyPoints: [
        'Event dates: October 14-16 in San Francisco with travel, lodging, and honorarium provided.',
        'Focus topic: Voice interfaces & executive agent workflows.',
        'Organizer requests an answer by next Monday.'
      ],
      actionItems: ['Reply by Monday if interested in speaking', 'Schedule 10-min briefing call'],
      sentiment: 'positive',
      audioNarrationText: 'Exciting invitation from Alex Rivera: You have been invited to deliver a 30-minute keynote at the Mobile UX Summit this October in San Francisco. Travel and lodging are fully covered. Please let them know by next Monday if you are interested in speaking.',
      estimatedReadSeconds: 18,
      reasoning: 'Prestige conference keynote invitation from Program Director Alex Rivera. Highly positive opportunity. All expenses and honorarium covered. Action needed: confirm interest by next Monday.'
    },
    completedActionItems: [],
    inferenceLatencyMs: 1220
  },
  {
    id: 'sample-4',
    sender: 'security@github.com',
    senderName: 'GitHub Security Advisory',
    subject: '[Action Recommended] Dependabot security update for repository',
    date: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    read: true,
    starred: false,
    priority: 'low',
    category: 'updates',
    snippet: 'Dependabot has opened a pull request to bump vite to patch vulnerability CVE-2026-1192 in your dependencies.',
    bodySnippet: `Hello,

A moderate severity security advisory affects one of your repository dependencies. Dependabot has prepared automated PR #84 to bump the package version safely.

CI checks have passed on main branch. Merge when ready.`,
    summary: {
      headline: 'Dependabot automated PR ready to merge for Vite dependency fix.',
      keyPoints: [
        'Moderate severity patch automated via PR #84.',
        'All automated CI test suites are passing.'
      ],
      actionItems: ['Merge PR #84 in GitHub repo'],
      sentiment: 'neutral',
      audioNarrationText: 'Notification from GitHub Security: Dependabot has created pull request 84 to resolve a moderate dependency vulnerability. All automated tests have passed and the PR is ready to merge.',
      estimatedReadSeconds: 12,
      reasoning: 'Automated dependency security patch via Dependabot PR #84. CI is green. Low priority routine maintenance.'
    },
    completedActionItems: [],
    inferenceLatencyMs: 870
  }
];
