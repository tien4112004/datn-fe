import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Settings2, Eye, Wand2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { LAYOUT_TYPE } from '../../types';
import type { LayoutType } from '../../types';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface GenerateTreeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (prompt: string, options: GenerateOptions) => void;
}

interface GenerateOptions {
  layoutType: LayoutType;
  maxDepth: number;
  maxChildren: number;
  includeDescriptions: boolean;
}

// Mock preview data for UI demonstration
const MOCK_PREVIEW_NODES = [
  { id: '1', label: 'Main Topic', level: 0 },
  { id: '2', label: 'Subtopic 1', level: 1 },
  { id: '3', label: 'Subtopic 2', level: 1 },
  { id: '4', label: 'Detail 1.1', level: 2 },
  { id: '5', label: 'Detail 1.2', level: 2 },
  { id: '6', label: 'Detail 2.1', level: 2 },
];

function GenerateTreeDialog({ isOpen, onOpenChange, onGenerate }: GenerateTreeDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [layoutType, setLayoutType] = useState<LayoutType>(LAYOUT_TYPE.HORIZONTAL_BALANCED);
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxChildren, setMaxChildren] = useState(5);
  const [includeDescriptions, setIncludeDescriptions] = useState(false);

  const handleGenerate = () => {
    onGenerate?.(prompt, {
      layoutType,
      maxDepth,
      maxChildren,
      includeDescriptions,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] !max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            {t('generate.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Prompt and Options */}
          <div className="flex w-1/2 flex-col border-r">
            <ScrollArea className="flex-1 p-6">
              {/* Prompt Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="text-muted-foreground h-4 w-4" />
                  <h3 className="font-semibold">{t('generate.prompt.title')}</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">{t('generate.prompt.label')}</Label>
                  <Textarea
                    id="prompt"
                    placeholder={t('generate.prompt.placeholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-muted-foreground text-xs">{t('generate.prompt.hint')}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Options Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-muted-foreground h-4 w-4" />
                  <h3 className="font-semibold">{t('generate.options.title')}</h3>
                </div>

                {/* Max Depth */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('generate.options.maxDepth')}</Label>
                    <span className="text-muted-foreground text-sm font-medium">{maxDepth}</span>
                  </div>
                  <Slider
                    value={[maxDepth]}
                    onValueChange={([value]) => setMaxDepth(value)}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-muted-foreground text-xs">{t('generate.options.maxDepthHint')}</p>
                </div>

                {/* Max Children per Node */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('generate.options.maxChildren')}</Label>
                    <span className="text-muted-foreground text-sm font-medium">{maxChildren}</span>
                  </div>
                  <Slider
                    value={[maxChildren]}
                    onValueChange={([value]) => setMaxChildren(value)}
                    min={2}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-muted-foreground text-xs">{t('generate.options.maxChildrenHint')}</p>
                </div>

                {/* Include Descriptions */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>{t('generate.options.includeDescriptions')}</Label>
                    <p className="text-muted-foreground text-xs">
                      {t('generate.options.includeDescriptionsHint')}
                    </p>
                  </div>
                  <Switch checked={includeDescriptions} onCheckedChange={setIncludeDescriptions} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Preview */}
          <div className="bg-muted/30 flex w-1/2 flex-col">
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div className="flex items-center gap-2">
                <Eye className="text-muted-foreground h-4 w-4" />
                <h3 className="font-semibold">{t('generate.preview.title')}</h3>
              </div>

              {/* Layout Selector */}
              <Select value={layoutType} onValueChange={(value) => setLayoutType(value as LayoutType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('generate.preview.selectLayout')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LAYOUT_TYPE.HORIZONTAL_BALANCED}>
                    {t('toolbar.layout.horizontalBalanced')}
                  </SelectItem>
                  <SelectItem value={LAYOUT_TYPE.VERTICAL_BALANCED}>
                    {t('toolbar.layout.verticalBalanced')}
                  </SelectItem>
                  <SelectItem value={LAYOUT_TYPE.RIGHT_ONLY}>{t('toolbar.layout.rightOnly')}</SelectItem>
                  <SelectItem value={LAYOUT_TYPE.LEFT_ONLY}>{t('toolbar.layout.leftOnly')}</SelectItem>
                  <SelectItem value={LAYOUT_TYPE.BOTTOM_ONLY}>{t('toolbar.layout.bottomOnly')}</SelectItem>
                  <SelectItem value={LAYOUT_TYPE.TOP_ONLY}>{t('toolbar.layout.topOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Area */}
            <div className="flex flex-1 items-center justify-center p-6">
              <PreviewMindmap nodes={MOCK_PREVIEW_NODES} layoutType={layoutType} />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={handleCancel}>
            {t('generate.actions.cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={!prompt.trim()} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t('generate.actions.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple preview component to visualize the mindmap structure
interface PreviewNode {
  id: string;
  label: string;
  level: number;
}

interface PreviewMindmapProps {
  nodes: PreviewNode[];
  layoutType: LayoutType;
}

function PreviewMindmap({ nodes, layoutType }: PreviewMindmapProps) {
  const isVertical =
    layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
    layoutType === LAYOUT_TYPE.TOP_ONLY ||
    layoutType === LAYOUT_TYPE.BOTTOM_ONLY;

  const rootNode = nodes.find((n) => n.level === 0);
  const level1Nodes = nodes.filter((n) => n.level === 1);
  const level2Nodes = nodes.filter((n) => n.level === 2);

  // Group level 2 nodes by their parent (simplified for demo)
  const level2ByParent: Record<string, PreviewNode[]> = {
    '2': level2Nodes.filter((n) => n.id === '4' || n.id === '5'),
    '3': level2Nodes.filter((n) => n.id === '6'),
  };

  return (
    <div className={cn('flex items-center justify-center gap-8', isVertical ? 'flex-col' : 'flex-row')}>
      {/* Left/Top side nodes */}
      {(layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED ||
        layoutType === LAYOUT_TYPE.LEFT_ONLY ||
        layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
        layoutType === LAYOUT_TYPE.TOP_ONLY) && (
        <div className={cn('flex gap-4', isVertical ? 'flex-row' : 'flex-col')}>
          {level1Nodes.slice(0, 1).map((node) => (
            <div
              key={node.id}
              className={cn('flex items-center gap-2', isVertical ? 'flex-col' : 'flex-row')}
            >
              <div className={cn('flex gap-2', isVertical ? 'flex-row' : 'flex-col')}>
                {level2ByParent[node.id]?.map((child) => (
                  <PreviewNodeCard key={child.id} label={child.label} level={child.level} />
                ))}
              </div>
              <PreviewNodeCard label={node.label} level={node.level} />
            </div>
          ))}
        </div>
      )}

      {/* Root Node */}
      {rootNode && <PreviewNodeCard label={rootNode.label} level={rootNode.level} isRoot />}

      {/* Right/Bottom side nodes */}
      {(layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED ||
        layoutType === LAYOUT_TYPE.RIGHT_ONLY ||
        layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
        layoutType === LAYOUT_TYPE.BOTTOM_ONLY) && (
        <div className={cn('flex gap-4', isVertical ? 'flex-row' : 'flex-col')}>
          {level1Nodes
            .slice(
              layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED || layoutType === LAYOUT_TYPE.VERTICAL_BALANCED
                ? 1
                : 0
            )
            .map((node) => (
              <div
                key={node.id}
                className={cn('flex items-center gap-2', isVertical ? 'flex-col' : 'flex-row')}
              >
                <PreviewNodeCard label={node.label} level={node.level} />
                <div className={cn('flex gap-2', isVertical ? 'flex-row' : 'flex-col')}>
                  {level2ByParent[node.id]?.map((child) => (
                    <PreviewNodeCard key={child.id} label={child.label} level={child.level} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

interface PreviewNodeCardProps {
  label: string;
  level: number;
  isRoot?: boolean;
}

function PreviewNodeCard({ label, level, isRoot }: PreviewNodeCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors',
        isRoot
          ? 'border-primary from-primary/10 to-primary/20 text-primary bg-gradient-to-br'
          : level === 1
            ? 'border-border bg-card text-card-foreground'
            : 'border-border/50 bg-muted/50 text-muted-foreground'
      )}
    >
      {label}
    </div>
  );
}

export default GenerateTreeDialog;
