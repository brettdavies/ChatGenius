import type { Message, User } from '../types/store.types';

export const sampleUsers: User[] = [
  {
    id: 'user1',
    email: 'sarah@example.com',
    name: 'Sarah Chen',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    password: 'password123'
  },
  {
    id: 'user2',
    email: 'alex@example.com',
    name: 'Alex Kim',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    password: 'password123'
  },
  {
    id: 'user3',
    email: 'maya@example.com',
    name: 'Maya Patel',
    status: 'away',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    password: 'password123'
  }
];

// Messages for the general channel
export const generalMessages: Message[] = [
  {
    id: 'msg1',
    content: '👋 Hey everyone! Just joined the team and excited to get started!',
    userId: 'user1',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'msg2',
    content: 'Welcome @Sarah! Great to have you on board. Let me know if you need any help getting set up.',
    userId: 'user2',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
    updatedAt: new Date(Date.now() - 3300000).toISOString(),
    mentions: [
      {
        type: 'user',
        id: 'user1',
        index: 8,
        length: 6
      }
    ]
  },
  {
    id: 'msg3',
    content: 'Thanks @Alex! 😊 I was wondering if someone could point me to the documentation for our current sprint?',
    userId: 'user1',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
    updatedAt: new Date(Date.now() - 3000000).toISOString(),
    mentions: [
      {
        type: 'user',
        id: 'user2',
        index: 7,
        length: 5
      }
    ]
  },
  {
    id: 'msg4',
    content: 'I can help with that! Check out the #resources channel - I\'ve pinned all the important docs there.',
    userId: 'user3',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 2700000).toISOString(),
    mentions: [
      {
        type: 'channel',
        id: 'resources',
        index: 27,
        length: 10
      }
    ]
  },
  {
    id: 'msg5',
    content: 'Perfect, thanks @Maya! 🙌',
    userId: 'user1',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
    updatedAt: new Date(Date.now() - 2400000).toISOString(),
    mentions: [
      {
        type: 'user',
        id: 'user3',
        index: 14,
        length: 5
      }
    ]
  },
  {
    id: 'msg8',
    content: 'Hey team! I\'ve just updated our [getting started guide](https://docs.example.com/getting-started). Take a look when you have a chance! 📚',
    userId: 'user2',
    channelId: '1',
    createdAt: new Date(Date.now() - 2000000).toISOString(),
    updatedAt: new Date(Date.now() - 2000000).toISOString(),
    reactions: {
      '👍': ['user1', 'user3'],
      '🎉': ['user1']
    }
  },
  {
    id: 'msg9',
    content: '**Important announcement:** We\'ll be upgrading our servers this weekend. Check #maintenance for the detailed schedule.',
    userId: 'user3',
    channelId: '1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    reactions: {
      '👀': ['user1', 'user2']
    },
    mentions: [
      {
        type: 'channel',
        id: 'maintenance',
        index: 71,
        length: 11
      }
    ]
  },
  {
    id: 'msg11',
    content: 'Hey team, here are the deployment steps for next week:',
    userId: 'user2',
    channelId: '1',
    createdAt: new Date(Date.now() - 1600000).toISOString(),
    updatedAt: new Date(Date.now() - 1600000).toISOString(),
    deletedAt: new Date(Date.now() - 1400000).toISOString(), // Example of a deleted message with thread
  },
  {
    id: 'msg12',
    content: '**Code Review Guidelines Update**\nI\'ve made some changes to our review process:\n```markdown\n1. All PRs need 2 approvals\n2. Max review time: 24h\n3. Use suggested changes feature\n```',
    userId: 'user1',
    channelId: '1',
    createdAt: new Date(Date.now() - 1500000).toISOString(),
    updatedAt: new Date(Date.now() - 1300000).toISOString(), // Example of an edited message
    reactions: {
      '👍': ['user2', 'user3'],
      '🚀': ['user2'],
      '💯': ['user3']
    }
  },
  {
    id: 'msg14',
    content: '📢 Team sync discussion for Q2 planning - please add your topics below',
    userId: 'user1',
    channelId: '1',
    createdAt: new Date(Date.now() - 700000).toISOString(),
    updatedAt: new Date(Date.now() - 700000).toISOString(),
    deletedAt: new Date(Date.now() - 400000).toISOString(),
  }
];

// Messages for the random channel
export const randomMessages: Message[] = [
  {
    id: 'msg6',
    content: '🎉 Anyone up for a virtual coffee chat?',
    userId: 'user2',
    channelId: '2', // random channel
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'msg7',
    content: 'Count me in! ☕️',
    userId: 'user3',
    channelId: '2', // random channel
    createdAt: new Date(Date.now() - 1500000).toISOString(), // 25 minutes ago
    updatedAt: new Date(Date.now() - 1500000).toISOString()
  },
  {
    id: 'msg10',
    content: 'Just found this amazing article about AI: [2024 AI Trends](https://example.com/ai-trends)\n\nKey points:\n- Advancement in LLMs\n- Multimodal AI\n- Edge Computing',
    userId: 'user1',
    channelId: '2',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    reactions: {
      '🤖': ['user2'],
      '🔥': ['user3']
    }
  },
  {
    id: 'msg13',
    content: '🎨 Check out this AI art I generated!\n![AI Art](https://example.com/ai-art.png)\n*Generated using Stable Diffusion*',
    userId: 'user3',
    channelId: '2',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    reactions: {
      '🎨': ['user1', 'user2'],
      '🤖': ['user1'],
      '😍': ['user2']
    }
  }
];

// Thread messages
export const threadMessages: { [key: string]: Message[] } = {
  'msg8': [
    {
      id: 'thread1',
      content: 'Great work! I especially like the new `quickstart` section. @Maya, could you review the API examples?',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg8',
      parentId: 'msg8',
      createdAt: new Date(Date.now() - 1900000).toISOString(),
      updatedAt: new Date(Date.now() - 1900000).toISOString(),
      reactions: {
        '💡': ['user2']
      },
      mentions: [
        {
          type: 'user',
          id: 'user3',
          index: 47,
          length: 5
        }
      ]
    },
    {
      id: 'thread2',
      content: 'Sure! I\'ll take a look. By the way, here\'s a useful tip:\n```typescript\nconst api = new API({\n  endpoint: "api.example.com",\n  version: "v2"\n});\n```',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg8',
      parentId: 'msg8',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      reactions: {
        '🙏': ['user1']
      }
    }
  ],
  'msg10': [
    {
      id: 'thread3',
      content: 'Fascinating article! The part about *multimodal AI* reminds me of our discussion in #ai-projects last week.',
      userId: 'user2',
      channelId: '2',
      threadId: 'msg10',
      parentId: 'msg10',
      createdAt: new Date(Date.now() - 1100000).toISOString(),
      updatedAt: new Date(Date.now() - 1100000).toISOString(),
      mentions: [
        {
          type: 'channel',
          id: 'ai-projects',
          index: 63,
          length: 11
        }
      ]
    },
    {
      id: 'thread4',
      content: '@Alex We should definitely incorporate some of these ideas into our roadmap! I\'ve created a [task](https://example.com/tasks/123) to track this.',
      userId: 'user3',
      channelId: '2',
      threadId: 'msg10',
      parentId: 'msg10',
      createdAt: new Date(Date.now() - 1000000).toISOString(),
      updatedAt: new Date(Date.now() - 1000000).toISOString(),
      reactions: {
        '💪': ['user1', 'user2']
      },
      mentions: [
        {
          type: 'user',
          id: 'user2',
          index: 0,
          length: 5
        }
      ]
    }
  ],
  'msg3': [
    {
      id: 'thread5',
      content: 'Here\'s a quick overview of our sprint goals:\n```markdown\n# Q1 Objectives\n- Feature A: Real-time collaboration\n- Feature B: Enhanced security\n- Feature C: Performance optimization\n```',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg3',
      parentId: 'msg3',
      createdAt: new Date(Date.now() - 2950000).toISOString(),
      updatedAt: new Date(Date.now() - 2950000).toISOString(),
      reactions: {
        '📋': ['user1', 'user3']
      }
    },
    {
      id: 'thread6',
      content: 'Thanks for the breakdown! I\'ll focus on the real-time collaboration feature first. @Maya, want to pair program on this?',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg3',
      parentId: 'msg3',
      createdAt: new Date(Date.now() - 2900000).toISOString(),
      updatedAt: new Date(Date.now() - 2900000).toISOString(),
      mentions: [
        {
          type: 'user',
          id: 'user3',
          index: 71,
          length: 5
        }
      ]
    }
  ],
  'msg9': [
    {
      id: 'thread7',
      content: 'Here\'s the detailed maintenance schedule:\n- **Start:** Saturday 2AM PST\n- **Duration:** ~2 hours\n- **Impact:** Brief service interruption',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg9',
      parentId: 'msg9',
      createdAt: new Date(Date.now() - 1750000).toISOString(),
      updatedAt: new Date(Date.now() - 1750000).toISOString(),
      reactions: {
        '🕐': ['user1', 'user2'],
        '👌': ['user2']
      }
    },
    {
      id: 'thread8',
      content: 'Should we post an announcement on our [status page](https://status.example.com)?',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg9',
      parentId: 'msg9',
      createdAt: new Date(Date.now() - 1700000).toISOString(),
      updatedAt: new Date(Date.now() - 1700000).toISOString()
    },
    {
      id: 'thread9',
      content: 'Good call! I\'ll prepare the notification with a link to our `maintenance-guide.md` for more details.',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg9',
      parentId: 'msg9',
      createdAt: new Date(Date.now() - 1650000).toISOString(),
      updatedAt: new Date(Date.now() - 1650000).toISOString(),
      reactions: {
        '💯': ['user2']
      }
    }
  ],
  'msg11': [
    {
      id: 'thread10',
      content: 'Here\'s what I\'ve prepared for staging:\n```bash\nnpm run build\ndocker-compose up -d\n```',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg11',
      parentId: 'msg11',
      createdAt: new Date(Date.now() - 1550000).toISOString(),
      updatedAt: new Date(Date.now() - 1550000).toISOString(),
      reactions: {
        '👍': ['user2']
      }
    },
    {
      id: 'thread11',
      content: 'I\'ve added monitoring alerts for the deployment. @Alex can you verify the thresholds?',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg11',
      parentId: 'msg11',
      createdAt: new Date(Date.now() - 1500000).toISOString(),
      updatedAt: new Date(Date.now() - 1500000).toISOString(),
      mentions: [
        {
          type: 'user',
          id: 'user2',
          index: 45,
          length: 5
        }
      ]
    },
    {
      id: 'thread12',
      content: 'Thresholds look good! I\'ve also added rollback procedures in case of issues.',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg11',
      parentId: 'msg11',
      createdAt: new Date(Date.now() - 1450000).toISOString(),
      updatedAt: new Date(Date.now() - 1450000).toISOString(),
      reactions: {
        '🔄': ['user1', 'user3']
      }
    }
  ],
  'msg12': [
    {
      id: 'thread13',
      content: 'Great updates! For the 24h review time, should we add exceptions for complex changes?',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg12',
      parentId: 'msg12',
      createdAt: new Date(Date.now() - 1400000).toISOString(),
      updatedAt: new Date(Date.now() - 1400000).toISOString()
    },
    {
      id: 'thread14',
      content: 'Good point! Let\'s add:\n```markdown\n4. Complex changes may need extended review\n   - Architectural changes\n   - Security-critical code\n```',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg12',
      parentId: 'msg12',
      createdAt: new Date(Date.now() - 1350000).toISOString(),
      updatedAt: new Date(Date.now() - 1350000).toISOString(),
      reactions: {
        '✅': ['user2', 'user3']
      }
    }
  ],
  'msg13': [
    {
      id: 'thread15',
      content: 'This is amazing! What prompt did you use?',
      userId: 'user1',
      channelId: '2',
      threadId: 'msg13',
      parentId: 'msg13',
      createdAt: new Date(Date.now() - 850000).toISOString(),
      updatedAt: new Date(Date.now() - 850000).toISOString(),
      reactions: {
        '🎯': ['user3']
      }
    },
    {
      id: 'thread16',
      content: 'Here\'s the prompt:\n```\nA futuristic cityscape at sunset, cyberpunk style, volumetric lighting, 8k, hyperrealistic\n```\nUsed Stable Diffusion XL with these settings:\n- Steps: 50\n- CFG Scale: 7\n- Seed: 12345',
      userId: 'user3',
      channelId: '2',
      threadId: 'msg13',
      parentId: 'msg13',
      createdAt: new Date(Date.now() - 800000).toISOString(),
      updatedAt: new Date(Date.now() - 750000).toISOString(), // Example of an edited thread reply
      reactions: {
        '🔥': ['user1', 'user2'],
        '📝': ['user1']
      }
    }
  ],
  'msg14': [
    {
      id: 'thread17',
      content: '1. Review Q1 metrics\n2. Resource allocation\n3. Project timeline updates',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg14',
      parentId: 'msg14',
      createdAt: new Date(Date.now() - 650000).toISOString(),
      updatedAt: new Date(Date.now() - 650000).toISOString(),
      reactions: {
        '📊': ['user1', 'user3']
      }
    },
    {
      id: 'thread18',
      content: 'Adding security audit findings to the agenda. @Maya can you prepare a summary?',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg14',
      parentId: 'msg14',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString(),
      deletedAt: new Date(Date.now() - 550000).toISOString(),
      mentions: [
        {
          type: 'user',
          id: 'user3',
          index: 39,
          length: 5
        }
      ]
    },
    {
      id: 'thread19',
      content: 'We should also discuss the new feature prioritization framework:\n```yaml\npriority_levels:\n  P0: Critical path\n  P1: High impact\n  P2: Nice to have\n```',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg14',
      parentId: 'msg14',
      createdAt: new Date(Date.now() - 550000).toISOString(),
      updatedAt: new Date(Date.now() - 550000).toISOString(),
      reactions: {
        '💡': ['user1', 'user2'],
        '👆': ['user2']
      }
    },
    {
      id: 'thread20',
      content: 'I\'ll present the new onboarding improvements we\'ve been working on.',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg14',
      parentId: 'msg14',
      createdAt: new Date(Date.now() - 500000).toISOString(),
      updatedAt: new Date(Date.now() - 500000).toISOString(),
      deletedAt: new Date(Date.now() - 450000).toISOString()
    },
    {
      id: 'thread21',
      content: 'Great agenda! I\'ve added the meeting to our shared calendar for next Tuesday 10 AM PST. Link to meeting doc: [Q2 Planning](https://docs.example.com/q2-planning)',
      userId: 'user3',
      channelId: '1',
      threadId: 'msg14',
      parentId: 'msg14',
      createdAt: new Date(Date.now() - 450000).toISOString(),
      updatedAt: new Date(Date.now() - 450000).toISOString(),
      reactions: {
        '👍': ['user1', 'user2'],
        '📅': ['user1']
      }
    }
  ]
};

export const sampleMessages: Message[] = [
  ...generalMessages,
  ...randomMessages
]; 