import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Presentation,
  Video,
  Image,
  FileAudio,
  Monitor,
  MoreHorizontal,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { LessonResource, ResourceType, Lesson } from '../../../shared/types';

interface ResourceManagerProps {
  lesson: Lesson;
  resources: LessonResource[];
  onAddResource: (
    lessonId: string,
    resource: Omit<LessonResource, 'id' | 'lessonId' | 'createdAt'>
  ) => Promise<void>;
  onUpdateResource: (lessonId: string, resourceId: string, updates: Partial<LessonResource>) => Promise<void>;
  onDeleteResource: (lessonId: string, resourceId: string) => Promise<void>;
  onUploadFile?: (file: File) => Promise<string>; // Returns file path/URL
  canEdit?: boolean;
}

interface ResourceStats {
  total: number;
  prepared: number;
  required: number;
  byType: Record<ResourceType, number>;
  preparationProgress: number;
}

export const ResourceManager = ({
  lesson,
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onUploadFile,
  canEdit = true,
}: ResourceManagerProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.resources' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'document' as ResourceType,
    url: '',
    filePath: '',
    description: '',
    isRequired: true,
    isPrepared: false,
  });

  const stats = useMemo((): ResourceStats => {
    const total = resources.length;
    const prepared = resources.filter((r) => r.isPrepared).length;
    const required = resources.filter((r) => r.isRequired).length;
    const preparationProgress = total > 0 ? Math.round((prepared / total) * 100) : 0;

    const byType: Record<ResourceType, number> = {
      presentation: 0,
      mindmap: 0,
      document: 0,
      video: 0,
      audio: 0,
      image: 0,
      worksheet: 0,
      equipment: 0,
      other: 0,
    };

    resources.forEach((resource) => {
      byType[resource.type]++;
    });

    return { total, prepared, required, byType, preparationProgress };
  }, [resources]);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      case 'mindmap':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'worksheet':
        return <FileText className="h-4 w-4" />;
      case 'equipment':
        return <Monitor className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getResourceTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'presentation':
        return t('types.presentation');
      case 'mindmap':
        return t('types.mindmap');
      case 'document':
        return t('types.document');
      case 'video':
        return t('types.video');
      case 'audio':
        return t('types.audio');
      case 'image':
        return t('types.image');
      case 'worksheet':
        return t('types.worksheet');
      case 'equipment':
        return t('types.equipment');
      default:
        return t('types.other');
    }
  };

  const getResourceTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'presentation':
        return 'bg-blue-100 text-blue-800';
      case 'mindmap':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'audio':
        return 'bg-yellow-100 text-yellow-800';
      case 'image':
        return 'bg-pink-100 text-pink-800';
      case 'worksheet':
        return 'bg-indigo-100 text-indigo-800';
      case 'equipment':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddResource = async () => {
    try {
      await onAddResource(lesson.id, newResource);
      setNewResource({
        name: '',
        type: 'document',
        url: '',
        filePath: '',
        description: '',
        isRequired: true,
        isPrepared: false,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add resource:', error);
    }
  };

  const handleUpdateResource = async (resourceId: string, updates: Partial<LessonResource>) => {
    try {
      await onUpdateResource(lesson.id, resourceId, updates);
      // TODO: Implement editing resource functionality
      console.log('Resource updated:', resourceId, updates);
    } catch (error) {
      console.error('Failed to update resource:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadFile) return;

    setIsUploading(true);
    try {
      const filePath = await onUploadFile(file);
      setNewResource((prev) => ({
        ...prev,
        name: prev.name || file.name,
        filePath,
        type: getFileType(file.type),
      }));
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (mimeType: string): ResourceType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('presentation')) return 'presentation';
    return 'document';
  };

  const resourceTypes = [
    { value: 'presentation', label: t('types.presentation') },
    { value: 'mindmap', label: t('types.mindmap') },
    { value: 'document', label: t('types.document') },
    { value: 'video', label: t('types.video') },
    { value: 'audio', label: t('types.audio') },
    { value: 'image', label: t('types.image') },
    { value: 'worksheet', label: t('types.worksheet') },
    { value: 'equipment', label: t('types.equipment') },
    { value: 'other', label: t('types.other') },
  ];

  return (
    <div className="space-y-6">
      {/* Resource Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('title')} - {lesson.title}
            </CardTitle>
            {canEdit && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('actions.addResource')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('actions.addResource')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('fields.name')}</Label>
                        <Input
                          value={newResource.name}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder={t('placeholders.name')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('fields.type')}</Label>
                        <Select
                          value={newResource.type}
                          onValueChange={(value) =>
                            setNewResource((prev) => ({ ...prev, type: value as ResourceType }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {resourceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('fields.url')}</Label>
                        <Input
                          value={newResource.url}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder={t('placeholders.url')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('fields.file')}</Label>
                        <div className="flex gap-2">
                          <Input type="file" onChange={handleFileUpload} disabled={isUploading} />
                          {isUploading && (
                            <Button disabled size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('fields.description')}</Label>
                      <Textarea
                        value={newResource.description}
                        onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder={t('placeholders.description')}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={newResource.isRequired}
                          onCheckedChange={(checked) =>
                            setNewResource((prev) => ({ ...prev, isRequired: checked as boolean }))
                          }
                        />
                        <span className="text-sm">{t('fields.isRequired')}</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={newResource.isPrepared}
                          onCheckedChange={(checked) =>
                            setNewResource((prev) => ({ ...prev, isPrepared: checked as boolean }))
                          }
                        />
                        <span className="text-sm">{t('fields.isPrepared')}</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t('actions.cancel')}
                      </Button>
                      <Button onClick={handleAddResource}>{t('actions.add')}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preparation Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('preparationProgress')}</span>
                <span className="text-muted-foreground text-sm">
                  {stats.prepared}/{stats.total} {t('prepared')}
                </span>
              </div>
              <Progress value={stats.preparationProgress} className="h-3" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-muted-foreground text-xs">{t('stats.total')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.prepared}</div>
                <p className="text-muted-foreground text-xs">{t('stats.prepared')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.required}</div>
                <p className="text-muted-foreground text-xs">{t('stats.required')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.preparationProgress}%</div>
                <p className="text-muted-foreground text-xs">{t('stats.completion')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('resourceList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t('noResources')}</p>
              {canEdit && (
                <Button variant="outline" className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addFirstResource')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-200',
                    resource.isPrepared && 'border-green-200 bg-green-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="pt-1">{getResourceIcon(resource.type)}</div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{resource.name}</h4>
                          {resource.description && (
                            <p className="text-muted-foreground text-sm">{resource.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getResourceTypeColor(resource.type)}>
                            {getResourceTypeLabel(resource.type)}
                          </Badge>
                          {resource.isPrepared ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </div>

                      {/* Resource Links */}
                      <div className="flex items-center gap-2">
                        {resource.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {t('actions.openLink')}
                            </a>
                          </Button>
                        )}

                        {resource.filePath && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.filePath} download>
                              <Download className="mr-2 h-4 w-4" />
                              {t('actions.download')}
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {resource.isRequired && (
                            <Badge variant="outline" className="text-red-600">
                              {t('required')}
                            </Badge>
                          )}
                          {resource.isPrepared && (
                            <Badge variant="outline" className="text-green-600">
                              {t('prepared')}
                            </Badge>
                          )}
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleUpdateResource(resource.id, {
                                  isPrepared: !resource.isPrepared,
                                })
                              }
                            >
                              {resource.isPrepared ? t('actions.markUnprepared') : t('actions.markPrepared')}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteResource(lesson.id, resource.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Type Distribution */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('resourceDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
              {Object.entries(stats.byType)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div
                      className={cn(
                        'mb-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                        getResourceTypeColor(type as ResourceType)
                      )}
                    >
                      {getResourceTypeLabel(type as ResourceType)}
                    </div>
                    <div className="text-lg font-semibold">{count}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
