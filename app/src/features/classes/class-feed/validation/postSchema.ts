import { z } from 'zod';

export const contentSchema = z
  .string()
  .min(1, 'feed.creator.validation.contentRequired')
  .min(10, 'feed.creator.validation.contentTooShort')
  .max(10000, 'feed.creator.validation.contentTooLong');

export const postCreatorSchema = z.object({
  type: z.enum(['Post', 'Exercise']),
  content: contentSchema,
  attachments: z.array(z.string()).max(10, 'feed.creator.validation.maxAttachmentsExceeded').optional(),
  linkedResources: z.array(z.any()).optional(),
  assignmentId: z.string().optional(),
  dueDate: z.string().optional(),
  allowComments: z.boolean().optional(),
});

export const postEditorSchema = z.object({
  content: contentSchema,
});
