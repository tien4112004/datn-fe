import type { Assignment as CoreAssignment } from '@aiprimary/core';
import type { CreateAssignmentRequest, UpdateAssignmentRequest } from '../types';

// Mock data store (in-memory for development)
const mockAssignments: CoreAssignment[] = [];
let mockIdCounter = 1;

/**
 * Mock assignment API service
 * Simulates backend API with in-memory storage and network delays
 */
export const assignmentApi = {
  /**
   * List assignments with optional filters
   */
  async getAssignments(filters?: {
    classId?: string;
    status?: 'draft' | 'published' | 'archived';
    searchText?: string;
  }): Promise<{ assignments: CoreAssignment[]; total: number }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockAssignments];

    // Apply filters
    if (filters?.classId) {
      filtered = filtered.filter((a) => a.classId === filters.classId);
    }

    if (filters?.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters?.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(search) || a.description?.toLowerCase().includes(search)
      );
    }

    return {
      assignments: filtered,
      total: filtered.length,
    };
  },

  /**
   * Get single assignment by ID
   */
  async getAssignment(id: string): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignment = mockAssignments.find((a) => a.id === id);
    if (!assignment) {
      throw new Error(`Assignment ${id} not found`);
    }

    return assignment;
  },

  /**
   * Create new assignment
   */
  async createAssignment(request: CreateAssignmentRequest): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newAssignment: CoreAssignment = {
      id: `assignment-${mockIdCounter++}`,
      classId: request.classId || '',
      title: request.title,
      description: request.description,
      questions: request.questions || [],
      shuffleQuestions: request.shuffleQuestions || false,
      dueDate: request.dueDate,
      totalPoints: request.totalPoints || 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAssignments.push(newAssignment);
    return newAssignment;
  },

  /**
   * Update assignment
   */
  async updateAssignment(id: string, request: UpdateAssignmentRequest): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment ${id} not found`);
    }

    const updated: CoreAssignment = {
      ...mockAssignments[index],
      ...(request.title !== undefined && { title: request.title }),
      ...(request.description !== undefined && { description: request.description }),
      ...(request.dueDate !== undefined && { dueDate: request.dueDate }),
      ...(request.questions !== undefined && { questions: request.questions }),
      ...(request.totalPoints !== undefined && { totalPoints: request.totalPoints }),
      ...(request.subject !== undefined && { subject: request.subject }),
      ...(request.topics !== undefined && { topics: request.topics }),
      ...(request.matrixCells !== undefined && { matrixCells: request.matrixCells }),
      ...(request.shuffleQuestions !== undefined && { shuffleQuestions: request.shuffleQuestions }),
      updatedAt: new Date().toISOString(),
    };

    mockAssignments[index] = updated;
    return updated;
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment ${id} not found`);
    }

    mockAssignments.splice(index, 1);
  },

  /**
   * Publish assignment (change status from draft to published)
   */
  async publishAssignment(id: string): Promise<CoreAssignment> {
    const assignment = await this.getAssignment(id);
    const updated: CoreAssignment = {
      ...assignment,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };

    const index = mockAssignments.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAssignments[index] = updated;
    }

    return updated;
  },

  /**
   * Archive assignment
   */
  async archiveAssignment(id: string): Promise<CoreAssignment> {
    const assignment = await this.getAssignment(id);
    const updated: CoreAssignment = {
      ...assignment,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };

    const index = mockAssignments.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAssignments[index] = updated;
    }

    return updated;
  },
};

/**
 * Query keys for React Query
 * Used for cache management and invalidation
 */
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: any) => [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
};
