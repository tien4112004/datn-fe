import { API_MODE, type ApiMode, type ApiResponse } from '@aiprimary/api';
import type { Assignment as CoreAssignment, Submission } from '@aiprimary/core';
import type { AssignmentApiService, AssignmentCollectionRequest } from '../types/service';
import type { CreateAssignmentRequest, UpdateAssignmentRequest } from '../types';
import { mockAssignments } from './data/assignments.data';

export default class AssignmentMockService implements AssignmentApiService {
  baseUrl: string;
  private assignments: CoreAssignment[] = [...mockAssignments];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getAssignments(request: AssignmentCollectionRequest): Promise<ApiResponse<CoreAssignment[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...this.assignments];

    // Filter by classId if provided
    if (request.classId) {
      filtered = filtered.filter((a) => a.classId === request.classId);
    }

    // Simple sorting
    if (request.sort === 'asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (request.sort === 'desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    // Pagination
    const page = request.page || 0;
    const pageSize = request.pageSize || 20;
    const start = page * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return {
      success: true,
      code: 200,
      data: paginated,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  async getAssignmentById(id: string): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignment = this.assignments.find((a) => a.id === id);
    if (!assignment) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    return assignment;
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newAssignment: CoreAssignment = {
      id: `assignment-${Date.now()}`,
      classId: data.classId || '',
      title: data.title,
      description: data.description,
      questions: data.questions || [],
      dueDate: data.dueDate,
      totalPoints: data.totalPoints,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.assignments.push(newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<CoreAssignment> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = this.assignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }

    const updated: CoreAssignment = {
      ...this.assignments[index],
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.dueDate && { dueDate: data.dueDate }),
      ...(data.questions && { questions: data.questions }),
      ...(data.totalPoints && { totalPoints: data.totalPoints }),
      updatedAt: new Date().toISOString(),
    };

    this.assignments[index] = updated;
    return updated;
  }

  async deleteAssignment(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.assignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }

    this.assignments.splice(index, 1);
  }

  async submitAssignment(_assignmentId: string, submission: Submission): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would calculate the score based on answers
    return {
      ...submission,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
  }

  async getSubmission(_assignmentId: string, _studentId: string): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock submission - in real app would fetch from database
    throw new Error('Submission not found');
  }
}
