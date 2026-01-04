import { API_MODE, type ApiMode } from '@/shared/constants';
import type {
  ClassFeedApiService,
  Comment,
  CommentCreateRequest,
  FeedFilter,
  Post,
  PostCreateRequest,
  PostListResponse,
  PostUpdateRequest,
} from '../types';

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    classId: '1',
    authorId: 'teacher1',
    type: 'announcement',
    content: `
# Welcome to Advanced Mathematics 2025!

I'm excited to embark on this mathematical journey with you all.

---

## Important Dates

* **First quiz:** December 15th
* **Mid-term exam:** January 20th
* **Final project due:** February 28th

---

## What to Expect

* Weekly problem sets
* Group discussions
* Real-world applications
* Guest lectures from industry professionals

---

**Please introduce yourselves in the comments below and share one thing you're most excited to learn this semester!**
	  `,
    attachments: ['https://example.com/syllabus.pdf'],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: true,
    allowComments: true,
    commentCount: 8,
    createdAt: new Date('2025-12-01T10:00:00Z'),
    updatedAt: new Date('2025-12-01T10:00:00Z'),
  },
  {
    id: '2',
    classId: '1',
    authorId: 'student1',
    type: 'general',
    content:
      "Hi everyone! I'm Alex, a sophomore majoring in Computer Science. I'm really excited about this class because I want to improve my mathematical foundations for my CS courses. Looking forward to working with all of you!\n\nWhat got you interested in advanced mathematics? 🤔",
    attachments: [],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: false,
    allowComments: true,
    commentCount: 5,
    createdAt: new Date('2025-12-01T11:15:00Z'),
    updatedAt: new Date('2025-12-01T11:15:00Z'),
  },
  {
    id: '3',
    classId: '1',
    authorId: 'student2',
    type: 'general',
    content:
      "Hello! I'm Maria, a junior Physics major. I'm taking this class to strengthen my math skills for quantum mechanics. I love how mathematics reveals the underlying patterns in nature.\n\nHas anyone taken quantum physics before? I'd love to hear your experiences!",
    attachments: [],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: false,
    allowComments: true,
    commentCount: 3,
    createdAt: new Date('2025-12-01T12:30:00Z'),
    updatedAt: new Date('2025-12-01T12:30:00Z'),
  },
  {
    id: '4',
    classId: '1',
    authorId: 'teacher1',
    type: 'announcement',
    content:
      "**Study Groups Announcement**\n\nI've noticed some of you are interested in forming study groups. This is a great idea! Here's how we'll organize:\n\n**Objectives:**\n- Peer learning and support\n- Practice problem-solving together\n- Share different approaches to problems\n\n**Guidelines:**\n- Groups of 3-4 students\n- Meet 1-2 times per week\n- Rotate who leads the discussion\n- Focus on understanding concepts, not just getting answers\n\nIf you're interested in joining a study group, please reply to this post with:\n1. Your availability (days/times)\n2. Preferred meeting format (in-person/virtual)\n3. Any specific topics you'd like to focus on\n\nI'll help coordinate the groups based on your responses!",
    attachments: [],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: true,
    allowComments: true,
    commentCount: 12,
    createdAt: new Date('2025-12-02T09:00:00Z'),
    updatedAt: new Date('2025-12-02T09:00:00Z'),
  },
  {
    id: '5',
    classId: '1',
    authorId: 'teacher1',
    type: 'schedule_event',
    content:
      '# Problem Set 1: Linear Transformations\n\n## Instructions\n\nComplete the following problems and submit your solutions by the deadline. Show all your work and explain your reasoning.\n\n### Problems\n\n1. **Matrix Representation** (20 points)\n   - Find the matrix representation of the linear transformation T: R³ → R² defined by T(x, y, z) = (2x - y, x + 3z)\n   - Verify your answer with at least two test vectors\n\n2. **Kernel and Range** (25 points)\n   - For the transformation in problem 1, find:\n     - The kernel (null space) of T\n     - The range (column space) of T\n     - The rank and nullity, and verify the rank-nullity theorem\n\n3. **Composition** (25 points)\n   - Let S: R² → R³ be defined by S(x, y) = (x + y, 2x, y)\n   - Find the matrix representation of the composition T ∘ S\n   - What is the dimension of the range of T ∘ S?\n\n4. **Eigenvalues and Eigenvectors** (30 points)\n   - Find all eigenvalues and eigenvectors for the matrix:\n     ```\n     A = [3  -1]\n         [2   0]\n     ```\n   - Determine if A is diagonalizable. If so, find matrices P and D such that A = PDP⁻¹\n\n### Submission Guidelines\n\n- Submit your work as a PDF file\n- Type your solutions using LaTeX or write them clearly and scan/photograph them\n- Include your name and student ID on the first page\n- Late submissions will receive a 10% penalty per day\n\n**Good luck! Feel free to ask questions in the comments below.**',
    attachments: ['https://example.com/problem-set-1.pdf'],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: false,
    allowComments: true,
    commentCount: 7,
    createdAt: new Date('2025-12-03T10:00:00Z'),
    updatedAt: new Date('2025-12-03T10:00:00Z'),
  },
  {
    id: '6',
    classId: '1',
    authorId: 'teacher1',
    type: 'schedule_event',
    content:
      "# Reading Assignment: Chapter 4 - Vector Spaces\n\n## Overview\n\nFor our next class, please read **Chapter 4** of our textbook covering vector spaces and subspaces.\n\n## Key Topics to Focus On\n\n1. **Definition of Vector Spaces** (Section 4.1)\n   - Understand the 10 axioms that define a vector space\n   - Review examples and non-examples\n\n2. **Subspaces** (Section 4.2)\n   - Subspace test (3 conditions)\n   - Common subspaces: zero subspace, spans, null space, column space\n\n3. **Linear Independence** (Section 4.3)\n   - Definition and geometric interpretation\n   - Testing for linear independence\n\n## Discussion Questions\n\nBe prepared to discuss these questions in class:\n\n1. Why is the set of all 2×2 matrices a vector space?\n2. Can you give an example of a subset of R³ that is NOT a subspace? Why not?\n3. What's the relationship between linear independence and spanning sets?\n\n## Optional Practice\n\n- Work through the examples in sections 4.1-4.3\n- Try the odd-numbered exercises (solutions in the back)\n\n*This reading is essential preparation for our class discussion. Come with questions!*",
    attachments: [],
    linkedResourceIds: [],
    linkedLessonId: undefined,
    isPinned: false,
    allowComments: true,
    commentCount: 3,
    createdAt: new Date('2025-12-04T14:00:00Z'),
    updatedAt: new Date('2025-12-04T14:00:00Z'),
  },
];

const mockComments: Comment[] = [
  // Comments for post 1 (Welcome announcement)
  {
    id: '1',
    postId: '1',
    userId: 'student1',
    content:
      "Hi Dr. Johnson! I'm Alex, a sophomore CS major. I'm really excited about this class - I've been wanting to strengthen my math foundations for machine learning algorithms. Looking forward to learning from you!",
    createdAt: new Date('2025-12-01T10:15:00Z'),
    updatedAt: new Date('2025-12-01T10:15:00Z'),
  },
  {
    id: '2',
    postId: '1',
    userId: 'student2',
    content:
      "Hello! Maria here, Physics major. I'm taking this to prepare for quantum mechanics next semester. The syllabus looks comprehensive - I appreciate the clear expectations!",
    createdAt: new Date('2025-12-01T10:30:00Z'),
    updatedAt: new Date('2025-12-01T10:30:00Z'),
  },
  {
    id: '3',
    postId: '1',
    userId: 'student3',
    content:
      "James Wilson, Engineering. I'm here because I heard this class really helps with understanding structural analysis and finite element methods. The weekly problem sets sound challenging but rewarding!",
    createdAt: new Date('2025-12-01T11:00:00Z'),
    updatedAt: new Date('2025-12-01T11:00:00Z'),
  },
  {
    id: '4',
    postId: '1',
    userId: 'student4',
    content:
      "Hi everyone! Emma, Mathematics major. I'm excited to be in this class with such a diverse group. The guest lectures sound amazing - I'm particularly interested in the industry applications!",
    createdAt: new Date('2025-12-01T11:20:00Z'),
    updatedAt: new Date('2025-12-01T11:20:00Z'),
  },
  {
    id: '5',
    postId: '1',
    userId: 'student5',
    content:
      "David Kim, Computer Science. I'm taking this to improve my understanding of algorithms and data structures. The real-world applications mentioned in the syllabus really caught my attention!",
    createdAt: new Date('2025-12-01T11:45:00Z'),
    updatedAt: new Date('2025-12-01T11:45:00Z'),
  },
  {
    id: '6',
    postId: '1',
    userId: 'student6',
    content:
      "Lisa Park, Data Science major. I'm here because linear algebra is crucial for machine learning. I love that this class connects theory with practical applications!",
    createdAt: new Date('2025-12-01T12:10:00Z'),
    updatedAt: new Date('2025-12-01T12:10:00Z'),
  },
  {
    id: '7',
    postId: '1',
    userId: 'student7',
    content:
      'Michael Brown, Statistics major. Looking forward to the group discussions and peer learning aspects of this class. The problem sets will be a great way to practice!',
    createdAt: new Date('2025-12-01T12:30:00Z'),
    updatedAt: new Date('2025-12-01T12:30:00Z'),
  },
  {
    id: '8',
    postId: '1',
    userId: 'student8',
    content:
      "Sophie Anderson, Applied Mathematics. I'm excited about the geometric interpretations and visual approaches mentioned. Math becomes so much more intuitive when you can see it!",
    createdAt: new Date('2025-12-01T13:00:00Z'),
    updatedAt: new Date('2025-12-01T13:00:00Z'),
  },

  // Comments for post 2 (Alex's introduction)
  {
    id: '9',
    postId: '2',
    userId: 'student2',
    content:
      "Same here! I'm taking this for quantum physics preparation. The connection between linear algebra and quantum mechanics is fascinating - especially how eigenvectors represent quantum states.",
    createdAt: new Date('2025-12-01T11:25:00Z'),
    updatedAt: new Date('2025-12-01T11:25:00Z'),
  },
  {
    id: '10',
    postId: '2',
    userId: 'student4',
    content:
      "I got interested through cryptography! The math behind encryption algorithms is really elegant. Can't wait to dive deeper into the theory.",
    createdAt: new Date('2025-12-01T11:35:00Z'),
    updatedAt: new Date('2025-12-01T11:35:00Z'),
  },
  {
    id: '11',
    postId: '2',
    userId: 'student3',
    content:
      'For me it was structural engineering - finite element analysis relies heavily on matrix methods. The math actually helps solve real engineering problems!',
    createdAt: new Date('2025-12-01T11:50:00Z'),
    updatedAt: new Date('2025-12-01T11:50:00Z'),
  },
  {
    id: '12',
    postId: '2',
    userId: 'student6',
    content:
      'Machine learning algorithms! SVD, PCA, and eigenvalue decomposition are everywhere in ML. This class will really help me understand the "why" behind the algorithms.',
    createdAt: new Date('2025-12-01T12:15:00Z'),
    updatedAt: new Date('2025-12-01T12:15:00Z'),
  },
  {
    id: '13',
    postId: '2',
    userId: 'teacher1',
    content:
      "Great to see such diverse motivations! I love how linear algebra connects to so many different fields. We'll explore applications in all these areas throughout the semester.",
    createdAt: new Date('2025-12-01T12:45:00Z'),
    updatedAt: new Date('2025-12-01T12:45:00Z'),
  },

  // Comments for post 3 (Maria's introduction)
  {
    id: '14',
    postId: '3',
    userId: 'student1',
    content:
      'I took Modern Physics last semester and it was mind-blowing! The linear algebra-quantum connection is definitely one of the most beautiful parts of physics.',
    createdAt: new Date('2025-12-01T12:40:00Z'),
    updatedAt: new Date('2025-12-01T12:40:00Z'),
  },
  {
    id: '15',
    postId: '3',
    userId: 'student5',
    content:
      "I'm in the same boat! Taking quantum next semester too. The Hilbert spaces and operator theory really build on what we'll learn here.",
    createdAt: new Date('2025-12-01T13:10:00Z'),
    updatedAt: new Date('2025-12-01T13:10:00Z'),
  },

  // Comments for post 4 (Study groups announcement)
  {
    id: '16',
    postId: '4',
    userId: 'student1',
    content:
      "I'm interested! Available Tuesday/Thursday evenings after 6 PM. Prefer in-person meetings. Would love to focus on eigenvector/eigenvalue applications.",
    createdAt: new Date('2025-12-02T09:15:00Z'),
    updatedAt: new Date('2025-12-02T09:15:00Z'),
  },
  {
    id: '17',
    postId: '4',
    userId: 'student2',
    content:
      'Count me in! Wednesday evenings work best for me. Happy with either in-person or virtual. Interested in quantum mechanics applications.',
    createdAt: new Date('2025-12-02T09:30:00Z'),
    updatedAt: new Date('2025-12-02T09:30:00Z'),
  },
  {
    id: '18',
    postId: '4',
    userId: 'student3',
    content:
      "I'd like to join! Available Monday/Wednesday afternoons. In-person preferred. Focus on engineering applications and matrix decompositions.",
    createdAt: new Date('2025-12-02T09:45:00Z'),
    updatedAt: new Date('2025-12-02T09:45:00Z'),
  },
  {
    id: '19',
    postId: '4',
    userId: 'student4',
    content:
      "Study group sounds great! I'm free Friday afternoons and Saturday mornings. Virtual meetings work better for my schedule. Let's focus on proofs and theory.",
    createdAt: new Date('2025-12-02T10:00:00Z'),
    updatedAt: new Date('2025-12-02T10:00:00Z'),
  },
  {
    id: '20',
    postId: '4',
    userId: 'student6',
    content:
      'Very interested! Thursday evenings after 7 PM work for me. Open to both formats. Would like to focus on machine learning applications.',
    createdAt: new Date('2025-12-02T10:15:00Z'),
    updatedAt: new Date('2025-12-02T10:15:00Z'),
  },
  {
    id: '21',
    postId: '4',
    userId: 'student7',
    content:
      "I'm in! Sunday afternoons are best for me. Virtual preferred. Let's work on probability theory connections and statistical applications.",
    createdAt: new Date('2025-12-02T10:30:00Z'),
    updatedAt: new Date('2025-12-02T10:30:00Z'),
  },
  {
    id: '22',
    postId: '4',
    userId: 'student8',
    content:
      "Count me in! Tuesday/Thursday mornings before class. In-person preferred. I'd love to focus on geometric interpretations and visualizations.",
    createdAt: new Date('2025-12-02T10:45:00Z'),
    updatedAt: new Date('2025-12-02T10:45:00Z'),
  },
  {
    id: '23',
    postId: '4',
    userId: 'student5',
    content:
      "Study groups are a great idea! I'm available Monday/Wednesday evenings. Virtual works for me. Let's focus on algorithmic applications.",
    createdAt: new Date('2025-12-02T11:00:00Z'),
    updatedAt: new Date('2025-12-02T11:00:00Z'),
  },
];

export default class ClassFeedMockApiService implements ClassFeedApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }
  async getPosts(classId: string, filter?: FeedFilter, page = 1, pageSize = 20): Promise<PostListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filteredPosts = mockPosts.filter((post) => post.classId === classId);

    if (filter) {
      if (filter.type === 'general') {
        filteredPosts = filteredPosts.filter((post) => post.type === 'general');
      } else if (filter.type === 'announcement') {
        filteredPosts = filteredPosts.filter((post) => post.type === 'announcement');
      } else if (filter.type === 'schedule_event') {
        filteredPosts = filteredPosts.filter((post) => post.type === 'schedule_event');
      }
      // 'all' means no filtering
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredPosts = filteredPosts.filter((post) => post.content.toLowerCase().includes(searchLower));
      }
      if (filter.startDate) {
        filteredPosts = filteredPosts.filter((post) => post.createdAt >= filter.startDate!);
      }
      if (filter.endDate) {
        filteredPosts = filteredPosts.filter((post) => post.createdAt <= filter.endDate!);
      }
    }

    // Sort by pinned first, then by creation date (newest first)
    filteredPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      data: paginatedPosts,
      pagination: {
        page,
        pageSize,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / pageSize),
      },
      success: true,
    };
  }

  async createPost(request: PostCreateRequest): Promise<Post> {
    const newPost: Post = {
      id: Date.now().toString(),
      classId: request.classId,
      authorId: 'current-user', // Mock current user
      type: request.type,
      content: request.content,
      attachments: request.attachments?.map((file) => URL.createObjectURL(file)) || [],
      linkedResourceIds: request.linkedResourceIds,
      linkedLessonId: request.linkedLessonId,
      isPinned: false,
      allowComments: request.allowComments ?? true,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPosts.push(newPost);
    return newPost;
  }

  async updatePost(request: PostUpdateRequest): Promise<Post> {
    const postIndex = mockPosts.findIndex((p) => p.id === request.id);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const updatedPost = {
      ...mockPosts[postIndex],
      ...(request.content && { content: request.content }),
      ...(request.type && { type: request.type }),
      ...(request.linkedResourceIds && { linkedResourceIds: request.linkedResourceIds }),
      ...(request.linkedLessonId && { linkedLessonId: request.linkedLessonId }),
      ...(request.isPinned !== undefined && { isPinned: request.isPinned }),
      ...(request.allowComments !== undefined && { allowComments: request.allowComments }),
      attachments:
        request.attachments?.map((file) => URL.createObjectURL(file)) || mockPosts[postIndex].attachments,
      updatedAt: new Date(),
    };

    mockPosts[postIndex] = updatedPost;
    return updatedPost;
  }

  async deletePost(postId: string): Promise<void> {
    const postIndex = mockPosts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    mockPosts.splice(postIndex, 1);
  }

  async pinPost(postId: string, pinned: boolean): Promise<Post> {
    const postIndex = mockPosts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    // Backend toggles pin state
    mockPosts[postIndex].isPinned = !mockPosts[postIndex].isPinned;
    mockPosts[postIndex].updatedAt = new Date();
    return mockPosts[postIndex];
  }

  async getComments(postId: string): Promise<Comment[]> {
    return mockComments.filter((comment) => comment.postId === postId);
  }

  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: request.postId,
      userId: 'current-user',
      content: request.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockComments.push(newComment);

    // Update comment count on post
    const post = mockPosts.find((p) => p.id === request.postId);
    if (post) {
      post.commentCount++;
    }

    return newComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    const commentIndex = mockComments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const postId = mockComments[commentIndex].postId;
    mockComments.splice(commentIndex, 1);

    // Update comment count on post
    const post = mockPosts.find((p) => p.id === postId);
    if (post && post.commentCount > 0) {
      post.commentCount--;
    }
  }
}
