import { API_MODE, type ApiMode } from '@/shared/constants';
import { type PresentationApiService, type OutlineItem } from '../types';
import { marked } from 'marked';
// import api from '@/shared/api';

const mockOutlineOutput = `\`\`\`markdown
### The Amazing World of Artificial Intelligence!

Did you know computers can now think and learn just like humans? Let's discover how AI is changing our world!

**What makes AI so special?**

- **AI systems are smart programs** that can learn from experience
- They are like **digital brains** that solve problems for us
- This incredible technology helps us in ways we never imagined

_AI doesn't get tired or forget - it keeps learning 24/7!_

### How Does AI Actually Learn?

The secret ingredient is massive amounts of **data**! AI systems feed on information to become smarter.

**Data: The Brain Food of AI**

- **Machine Learning** is like teaching a computer to recognize patterns
- AI systems use **algorithms** to process and understand information
- Without quality data, AI cannot make good decisions

> Just like we learn from our mistakes, AI gets better with every example!

### AI in Our Daily Lives

From your smartphone to your favorite streaming service, AI is everywhere working behind the scenes.

**Where Can You Find AI Today?**

- **Voice assistants** like Siri and Alexa understand what you say
- **Recommendation systems** suggest movies and music you might like
- **Navigation apps** find the fastest route to your destination

_AI is like having a super-smart friend who never sleeps and always wants to help!_
\`\`\``;

async function splitMarkdownToOutlineItems(markdown: string): Promise<OutlineItem[]> {
  const cleanMarkdown = markdown.replace(/^```markdown\n/, '').replace(/\n```$/, '').trim();
  
  const sections = cleanMarkdown.split(/(?=^#{2,}\s)/m).filter(Boolean);
  
  const items = await Promise.all(
    sections.map(async (section, index) => ({
      id: index.toString(),
      htmlContent: await marked.parse(section.trim())
    }))
  );
  
  return items;
}

export default class PresentationRealApiService implements PresentationApiService {
  //   async getPresentationItems(): Promise<PresentationItem[]> {
  //     const response = await api.get<PresentationItem[]>('/presentation/items');
  //     return response.data;
  //   }
  getType(): ApiMode {
    return API_MODE.real;
  }

  async getPresentationItems(): Promise<OutlineItem[]> {
    return splitMarkdownToOutlineItems(mockOutlineOutput);
  }
}
