import type { LoaderFunctionArgs } from 'react-router-dom';
import { getClassApiService } from '../api';

export async function getClassById({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error('Class ID is required');
  }

  try {
    const classApiService = getClassApiService();
    const classData = await classApiService.getClassById(id);
    if (!classData) {
      throw new Error('Class not found');
    }
    return { class: classData };
  } catch (error) {
    console.error('Failed to load class:', error);
    throw error;
  }
}

export async function getClassesData() {
  try {
    const classApiService = getClassApiService();
    const response = await classApiService.getClasses({ pageSize: 50 });
    return { classes: response.data, pagination: response.pagination };
  } catch (error) {
    console.error('Failed to load classes:', error);
    throw error;
  }
}
