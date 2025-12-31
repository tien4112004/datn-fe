import type {
  ExamMatrixApiService,
  CreateExamMatrixRequest,
  UpdateExamMatrixRequest,
  ValidateMatrixRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
} from '@/features/exam-matrix/types/service';
import type {
  ExamMatrix,
  Topic,
  MatrixCell,
  ExamMatrixFilters,
  ExamMatrixResponse,
  MatrixValidationResult,
  SubjectCode,
  MatrixCellStatus,
} from '@/features/exam-matrix/types';
import { generateId } from '@/shared/lib/utils';

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
    this.matrices = Array.from({ length: 10 }, (_, i) => createSampleMatrix(generateId(), i));
  }

  async getMatrices(filters?: ExamMatrixFilters): Promise<ExamMatrixResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...this.matrices];

    // Apply filters
    if (filters?.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (m) => m.name.toLowerCase().includes(search) || m.description?.toLowerCase().includes(search)
      );
    }

    if (filters?.subjectCode) {
      filtered = filtered.filter((m) => m.subjectCode === filters.subjectCode);
    }

    if (filters?.createdBy) {
      filtered = filtered.filter((m) => m.createdBy === filters.createdBy);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      matrices: paginated,
      total: filtered.length,
      page,
      limit,
    };
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

  async deleteMatrix(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = this.matrices.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Matrix with id ${id} not found`);
    }

    this.matrices.splice(index, 1);
  }

  async deleteMatrices(ids: string[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.matrices = this.matrices.filter((m) => !ids.includes(m.id));
  }

  async duplicateMatrix(id: string): Promise<ExamMatrix> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const matrix = this.matrices.find((m) => m.id === id);
    if (!matrix) {
      throw new Error(`Matrix with id ${id} not found`);
    }

    const duplicated: ExamMatrix = {
      ...matrix,
      id: generateId(),
      name: `${matrix.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.matrices.unshift(duplicated);
    return duplicated;
  }

  async validateMatrix(data: ValidateMatrixRequest): Promise<MatrixValidationResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const matrix = this.matrices.find((m) => m.id === data.matrixId);
    if (!matrix) {
      throw new Error(`Matrix with id ${data.matrixId} not found`);
    }

    // Group question selections by cell
    const selectionsByCell = new Map<string, string[]>();
    Object.entries(data.questionSelections).forEach(([questionId, cellId]) => {
      if (!selectionsByCell.has(cellId)) {
        selectionsByCell.set(cellId, []);
      }
      selectionsByCell.get(cellId)!.push(questionId);
    });

    // Validate each cell
    const cellsStatus: MatrixCellStatus[] = matrix.cells.map((cell) => {
      const selectedQuestions = selectionsByCell.get(cell.id) || [];
      const selectedCount = selectedQuestions.length;
      const selectedPoints = selectedCount * cell.pointsPerQuestion;
      const requiredPoints = cell.requiredQuestionCount * cell.pointsPerQuestion;

      return {
        cellId: cell.id,
        topicId: cell.topicId,
        difficulty: cell.difficulty,
        required: cell.requiredQuestionCount,
        selected: selectedCount,
        requiredPoints,
        selectedPoints,
        isFulfilled: selectedCount === cell.requiredQuestionCount,
      };
    });

    // Calculate summary
    const totalPoints = cellsStatus.reduce((sum, status) => sum + status.selectedPoints, 0);
    const pointsDifference = totalPoints - matrix.targetTotalPoints;

    const fulfilledCells = cellsStatus.filter((s) => s.isFulfilled).length;
    const partialCells = cellsStatus.filter((s) => s.selected > 0 && !s.isFulfilled).length;
    const emptyCells = cellsStatus.filter((s) => s.selected === 0).length;

    // Generate errors and warnings
    const errors: string[] = [];
    const warnings: string[] = [];

    cellsStatus.forEach((status) => {
      if (status.selected < status.required) {
        const topic = matrix.topics.find((t) => t.id === status.topicId);
        errors.push(
          `${topic?.name || status.topicId} (${status.difficulty}): Need ${status.required - status.selected} more question(s)`
        );
      } else if (status.selected > status.required) {
        const topic = matrix.topics.find((t) => t.id === status.topicId);
        warnings.push(
          `${topic?.name || status.topicId} (${status.difficulty}): ${status.selected - status.required} extra question(s) selected`
        );
      }
    });

    if (Math.abs(pointsDifference) > matrix.targetTotalPoints * 0.05) {
      const message =
        pointsDifference > 0
          ? `Total points (${totalPoints}) exceeds target (${matrix.targetTotalPoints}) by ${pointsDifference}`
          : `Total points (${totalPoints}) is ${Math.abs(pointsDifference)} points below target (${matrix.targetTotalPoints})`;
      warnings.push(message);
    }

    return {
      isValid: errors.length === 0 && Math.abs(pointsDifference) <= matrix.targetTotalPoints * 0.05,
      totalPoints,
      targetPoints: matrix.targetTotalPoints,
      pointsDifference,
      cellsStatus,
      errors,
      warnings,
      summary: {
        totalCells: cellsStatus.length,
        fulfilledCells,
        partialCells,
        emptyCells,
      },
    };
  }

  async exportMatrices(filters?: ExamMatrixFilters): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { matrices } = await this.getMatrices(filters);
    const json = JSON.stringify(matrices, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  async importMatrices(file: File): Promise<{ success: number; failed: number }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const text = await file.text();
    let imported: ExamMatrix[] = [];

    try {
      imported = JSON.parse(text) as ExamMatrix[];
    } catch (error) {
      console.error('JSON parse error:', error);
      return { success: 0, failed: 1 };
    }

    let success = 0;
    let failed = 0;

    for (const matrix of imported) {
      try {
        await this.createMatrix({ matrix });
        success++;
      } catch (error) {
        console.error('Error creating matrix:', error);
        failed++;
      }
    }

    return { success, failed };
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
