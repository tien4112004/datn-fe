import type {
  ExamMatrixApiService,
  CreateExamMatrixRequest,
  UpdateExamMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/exam-matrix/types/service';
import type { ExamMatrix, Topic, MatrixCell, SubjectCode } from '@/features/exam-matrix/types';
import { generateId } from '@/shared/lib/utils';

// Deterministic IDs for mock matrices (so URLs are stable)
const MOCK_MATRIX_IDS = [
  'eijkrw07o', // ID from the user's URL
  'abc123def',
  'xyz789ghi',
  'mno456pqr',
  'stu012vwx',
  'jkl345mno',
  'pqr678stu',
  'vwx901yza',
  'bcd234efg',
  'hij567klm',
];

// Create sample matrix - now with empty topics for freestyle creation
const createSampleMatrix = (id: string, index: number): ExamMatrix => {
  const subjects: SubjectCode[] = ['T', 'TV', 'TA'];
  const subjectCode = subjects[index % 3];

  // Start with empty topics - users will create their own
  const subjectTopics: Topic[] = [];
  const cells: MatrixCell[] = [];

  // No predefined cells - users will define their own matrix structure
  const targetTotalPoints = 0;

  return {
    id,
    name: `${subjectCode === 'T' ? 'Math' : subjectCode === 'TV' ? 'Vietnamese' : 'English'} Exam Matrix ${index + 1}`,
    description: `Sample exam matrix for ${subjectCode === 'T' ? 'Math' : subjectCode === 'TV' ? 'Vietnamese' : 'English'}`,
    subjectCode,
    targetTotalPoints,
    topics: subjectTopics,
    cells,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
  };
};

export default class ExamMatrixMockApiService implements ExamMatrixApiService {
  private matrices: ExamMatrix[];
  private topics: Topic[];

  constructor() {
    // Initialize with empty topic library - users will create their own topics
    this.topics = [];
    // Use deterministic IDs so URLs are stable across page refreshes
    this.matrices = MOCK_MATRIX_IDS.map((id, i) => createSampleMatrix(id, i));
  }

  async getMatrixById(id: string): Promise<ExamMatrix> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const matrix = this.matrices.find((m) => m.id === id);
    if (!matrix) {
      throw new Error(`Matrix with id ${id} not found`);
    }
    return matrix;
  }

  async createMatrix(data: CreateExamMatrixRequest): Promise<ExamMatrix> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newMatrix: ExamMatrix = {
      ...data.matrix,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.matrices.unshift(newMatrix);
    return newMatrix;
  }

  async updateMatrix(id: string, data: UpdateExamMatrixRequest): Promise<ExamMatrix> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.matrices.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Matrix with id ${id} not found`);
    }

    const updated: ExamMatrix = {
      ...this.matrices[index],
      ...data.matrix,
      updatedAt: new Date().toISOString(),
    };

    this.matrices[index] = updated;
    return updated;
  }

  async getTopicsBySubject(subjectCode: SubjectCode): Promise<Topic[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return this.topics.filter((t) => t.subjectCode === subjectCode);
  }

  async createTopic(data: CreateTopicRequest): Promise<Topic> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Check for duplicate name within subject (case-insensitive)
    const duplicate = this.topics.find(
      (t) =>
        t.subjectCode === data.topic.subjectCode &&
        t.name.trim().toLowerCase() === data.topic.name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error(`A topic named "${data.topic.name}" already exists for this subject`);
    }

    const newTopic: Topic = {
      ...data.topic,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.topics.push(newTopic);
    return newTopic;
  }

  async updateTopic(id: string, data: UpdateTopicRequest): Promise<Topic> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = this.topics.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Topic with id ${id} not found`);
    }

    const updated: Topic = {
      ...this.topics[index],
      ...data.topic,
    };

    this.topics[index] = updated;
    return updated;
  }

  async deleteTopic(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Check if topic is used in any matrix
    const isUsed = this.matrices.some((m) => m.topics.some((t) => t.id === id));
    if (isUsed) {
      throw new Error('Cannot delete topic that is used in matrices');
    }

    const index = this.topics.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Topic with id ${id} not found`);
    }

    this.topics.splice(index, 1);
  }
}
