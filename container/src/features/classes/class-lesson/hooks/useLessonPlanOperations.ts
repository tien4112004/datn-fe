import { useCallback } from 'react';
import type { LessonPlan, LearningObjective, LessonResource } from '../types';

/**
 * Hook providing utility functions for managing lesson plan objectives and resources.
 * These functions help with optimistic updates and state management when working
 * with nested objectives and resources within lesson plans.
 */
export const useLessonPlanOperations = () => {
  /**
   * Add a new objective to a lesson plan
   */
  const addObjectiveToLesson = useCallback(
    (lessonPlan: LessonPlan, objective: Omit<LearningObjective, 'id'>): LessonPlan => {
      const newObjective: LearningObjective = {
        ...objective,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      return {
        ...lessonPlan,
        objectives: [...lessonPlan.objectives, newObjective],
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Remove an objective from a lesson plan
   */
  const removeObjectiveFromLesson = useCallback((lessonPlan: LessonPlan, objectiveId: string): LessonPlan => {
    return {
      ...lessonPlan,
      objectives: lessonPlan.objectives.filter((obj) => obj.id !== objectiveId),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Update an objective within a lesson plan
   */
  const updateObjectiveInLesson = useCallback(
    (lessonPlan: LessonPlan, objectiveId: string, updates: Partial<LearningObjective>): LessonPlan => {
      return {
        ...lessonPlan,
        objectives: lessonPlan.objectives.map((obj) =>
          obj.id === objectiveId ? { ...obj, ...updates } : obj
        ),
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Add a new resource to a lesson plan
   */
  const addResourceToLesson = useCallback(
    (lessonPlan: LessonPlan, resource: Omit<LessonResource, 'id'>): LessonPlan => {
      const newResource: LessonResource = {
        ...resource,
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      return {
        ...lessonPlan,
        resources: [...lessonPlan.resources, newResource],
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Remove a resource from a lesson plan
   */
  const removeResourceFromLesson = useCallback((lessonPlan: LessonPlan, resourceId: string): LessonPlan => {
    return {
      ...lessonPlan,
      resources: lessonPlan.resources.filter((res) => res.id !== resourceId),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Update a resource within a lesson plan
   */
  const updateResourceInLesson = useCallback(
    (lessonPlan: LessonPlan, resourceId: string, updates: Partial<LessonResource>): LessonPlan => {
      return {
        ...lessonPlan,
        resources: lessonPlan.resources.map((res) => (res.id === resourceId ? { ...res, ...updates } : res)),
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Update multiple objectives at once (bulk update)
   */
  const updateObjectivesInLesson = useCallback(
    (lessonPlan: LessonPlan, objectives: LearningObjective[]): LessonPlan => {
      return {
        ...lessonPlan,
        objectives,
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Update multiple resources at once (bulk update)
   */
  const updateResourcesInLesson = useCallback(
    (lessonPlan: LessonPlan, resources: LessonResource[]): LessonPlan => {
      return {
        ...lessonPlan,
        resources,
        updatedAt: new Date().toISOString(),
      };
    },
    []
  );

  /**
   * Find an objective by ID within a lesson plan
   */
  const findObjectiveInLesson = useCallback(
    (lessonPlan: LessonPlan, objectiveId: string): LearningObjective | undefined => {
      return lessonPlan.objectives.find((obj) => obj.id === objectiveId);
    },
    []
  );

  /**
   * Find a resource by ID within a lesson plan
   */
  const findResourceInLesson = useCallback(
    (lessonPlan: LessonPlan, resourceId: string): LessonResource | undefined => {
      return lessonPlan.resources.find((res) => res.id === resourceId);
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
