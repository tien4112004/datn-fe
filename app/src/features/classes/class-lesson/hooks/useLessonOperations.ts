import { useCallback } from 'react';
import type { Lesson, LearningObjective, LessonResource } from '../types';

/**
 * Hook providing utility functions for managing lesson objectives and resources.
 * These functions help with optimistic updates and state management when working
 * with nested objectives and resources within lessons.
 */
export const useLessonOperations = () => {
  /**
   * Add a new objective to a lesson
   */
  const addObjectiveToLesson = useCallback(
    (lesson: Lesson, objective: Omit<LearningObjective, 'id'>): Lesson => {
      const newObjective: LearningObjective = {
        ...objective,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      return {
        ...lesson,
        objectives: [...lesson.objectives, newObjective],
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Remove an objective from a lesson
   */
  const removeObjectiveFromLesson = useCallback((lesson: Lesson, objectiveId: string): Lesson => {
    return {
      ...lesson,
      objectives: lesson.objectives.filter((obj) => obj.id !== objectiveId),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Update an objective within a lesson
   */
  const updateObjectiveInLesson = useCallback(
    (lesson: Lesson, objectiveId: string, updates: Partial<LearningObjective>): Lesson => {
      return {
        ...lesson,
        objectives: lesson.objectives.map((obj) => (obj.id === objectiveId ? { ...obj, ...updates } : obj)),
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Add a new resource to a lesson
   */
  const addResourceToLesson = useCallback((lesson: Lesson, resource: Omit<LessonResource, 'id'>): Lesson => {
    const newResource: LessonResource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return {
      ...lesson,
      resources: [...lesson.resources, newResource],
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Remove a resource from a lesson
   */
  const removeResourceFromLesson = useCallback((lesson: Lesson, resourceId: string): Lesson => {
    return {
      ...lesson,
      resources: lesson.resources.filter((res) => res.id !== resourceId),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Update a resource within a lesson
   */
  const updateResourceInLesson = useCallback(
    (lesson: Lesson, resourceId: string, updates: Partial<LessonResource>): Lesson => {
      return {
        ...lesson,
        resources: lesson.resources.map((res) => (res.id === resourceId ? { ...res, ...updates } : res)),
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Update multiple objectives at once (bulk update)
   */
  const updateObjectivesInLesson = useCallback((lesson: Lesson, objectives: LearningObjective[]): Lesson => {
    return {
      ...lesson,
      objectives,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Update multiple resources at once (bulk update)
   */
  const updateResourcesInLesson = useCallback((lesson: Lesson, resources: LessonResource[]): Lesson => {
    return {
      ...lesson,
      resources,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Find an objective by ID within a lesson
   */
  const findObjectiveInLesson = useCallback(
    (lesson: Lesson, objectiveId: string): LearningObjective | undefined => {
      return lesson.objectives.find((obj) => obj.id === objectiveId);
    },
    []
  );

  /**
   * Find a resource by ID within a lesson
   */
  const findResourceInLesson = useCallback(
    (lesson: Lesson, resourceId: string): LessonResource | undefined => {
      return lesson.resources.find((res) => res.id === resourceId);
    },
    []
  );

  return {
    // Objective operations
    addObjectiveToLesson,
    removeObjectiveFromLesson,
    updateObjectiveInLesson,
    updateObjectivesInLesson,
    findObjectiveInLesson,

    // Resource operations
    addResourceToLesson,
    removeResourceFromLesson,
    updateResourceInLesson,
    updateResourcesInLesson,
    findResourceInLesson,
  };
};
