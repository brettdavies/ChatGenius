import type { Message, User } from '../types/store.types';

export const sampleUsers: User[] = [
  {
    id: 'user1',
    email: 'sarah@example.com',
    name: 'Sarah Chen',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 'user2',
    email: 'alex@example.com',
    name: 'Alex Kim',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: 'user3',
    email: 'maya@example.com',
    name: 'Maya Patel',
    status: 'away',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
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
    content: 'Welcome Sarah! Great to have you on board. Let me know if you need any help getting set up.',
    userId: 'user2',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
    updatedAt: new Date(Date.now() - 3300000).toISOString()
  },
  {
    id: 'msg3',
    content: 'Thanks Alex! 😊 I was wondering if someone could point me to the documentation for our current sprint?',
    userId: 'user1',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
    updatedAt: new Date(Date.now() - 3000000).toISOString()
  },
  {
    id: 'msg4',
    content: 'I can help with that! Check out the #resources channel - I\'ve pinned all the important docs there.',
    userId: 'user3',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 2700000).toISOString()
  },
  {
    id: 'msg5',
    content: 'Perfect, thanks Maya! 🙌',
    userId: 'user1',
    channelId: '1', // general channel
    createdAt: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
    updatedAt: new Date(Date.now() - 2400000).toISOString()
  },
  {
    id: 'msg8',
    content: 'Hey team! I\'ve just updated our <a href="https://docs.example.com/getting-started" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">getting started guide</a>. Take a look when you have a chance! 📚',
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
    content: '<strong>Important announcement:</strong> We\'ll be upgrading our servers this weekend. Check #maintenance for the detailed schedule.',
    userId: 'user3',
    channelId: '1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    reactions: {
      '👀': ['user1', 'user2']
    }
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
    content: 'Just found this amazing article about AI: <a href="https://example.com/ai-trends" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">2024 AI Trends</a>\n\nKey points:\n<ul><li>Advancement in LLMs</li><li>Multimodal AI</li><li>Edge Computing</li></ul>',
    userId: 'user1',
    channelId: '2',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    reactions: {
      '🤖': ['user2'],
      '🔥': ['user3']
    }
  }
];

// Thread messages
export const threadMessages: { [key: string]: Message[] } = {
  'msg8': [
    {
      id: 'thread1',
      content: 'Great work! I especially like the new <code class="bg-gray-800 text-pink-400 px-1 rounded">quickstart</code> section. @Maya, could you review the API examples?',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg8',
      parentId: 'msg8',
      createdAt: new Date(Date.now() - 1900000).toISOString(),
      updatedAt: new Date(Date.now() - 1900000).toISOString(),
      reactions: {
        '💡': ['user2']
      }
    },
    {
      id: 'thread2',
      content: 'Sure! I\'ll take a look. By the way, here\'s a useful tip:\n<pre class="relative my-2"><div class="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400">typescript</div><code class="block w-full rounded-md border border-gray-600 bg-gray-900 p-4 text-gray-100 font-mono text-sm">const api = new API({\n  endpoint: "api.example.com",\n  version: "v2"\n});</code></pre>',
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
      content: 'Fascinating article! The part about <em>multimodal AI</em> reminds me of our discussion in #ai-projects last week.',
      userId: 'user2',
      channelId: '2',
      threadId: 'msg10',
      parentId: 'msg10',
      createdAt: new Date(Date.now() - 1100000).toISOString(),
      updatedAt: new Date(Date.now() - 1100000).toISOString()
    },
    {
      id: 'thread4',
      content: '@Alex We should definitely incorporate some of these ideas into our roadmap! I\'ve created a <a href="https://example.com/tasks/123" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">task</a> to track this.',
      userId: 'user3',
      channelId: '2',
      threadId: 'msg10',
      parentId: 'msg10',
      createdAt: new Date(Date.now() - 1000000).toISOString(),
      updatedAt: new Date(Date.now() - 1000000).toISOString(),
      reactions: {
        '💪': ['user1', 'user2']
      }
    }
  ],
  'msg3': [
    {
      id: 'thread5',
      content: 'Here\'s a quick overview of our sprint goals:\n<pre class="relative my-2"><div class="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400">markdown</div><code class="block w-full rounded-md border border-gray-600 bg-gray-900 p-4 text-gray-100 font-mono text-sm"># Q1 Objectives\n- Feature A: Real-time collaboration\n- Feature B: Enhanced security\n- Feature C: Performance optimization</code></pre>',
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
      content: 'Thanks for the breakdown! I\'ll focus on the <em>real-time collaboration</em> feature first. @Maya, want to pair program on this?',
      userId: 'user1',
      channelId: '1',
      threadId: 'msg3',
      parentId: 'msg3',
      createdAt: new Date(Date.now() - 2900000).toISOString(),
      updatedAt: new Date(Date.now() - 2900000).toISOString()
    }
  ],
  'msg9': [
    {
      id: 'thread7',
      content: 'Here\'s the detailed maintenance schedule:\n<ul><li><strong>Start:</strong> Saturday 2AM PST</li><li><strong>Duration:</strong> ~2 hours</li><li><strong>Impact:</strong> Brief service interruption</li></ul>',
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
      content: 'Should we post an announcement on our <a href="https://status.example.com" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">status page</a>?',
      userId: 'user2',
      channelId: '1',
      threadId: 'msg9',
      parentId: 'msg9',
      createdAt: new Date(Date.now() - 1700000).toISOString(),
      updatedAt: new Date(Date.now() - 1700000).toISOString()
    },
    {
      id: 'thread9',
      content: 'Good call! I\'ll prepare the notification with a link to our <code class="bg-gray-800 text-pink-400 px-1 rounded">maintenance-guide.md</code> for more details.',
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
  ]
};

export const sampleMessages: Message[] = [
  ...generalMessages,
  ...randomMessages,
  ...Object.values(threadMessages).flat()
]; 