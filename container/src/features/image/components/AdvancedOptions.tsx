import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { CardTitle } from '@/shared/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModels } from '@/features/model';
import { ModelSelect } from '@/shared/components/common/ModelSelect';

const AdvancedOptions = () => {
  const { t } = useTranslation('image', { keyPrefix: 'createImage.advancedOptions' });
  const [isOpen, setIsOpen] = useState(false);
  const { models, isLoading, isError } = useModels();

  const [selectedModel, setSelectedModel] = useState<string | undefined>('');

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4">
      {/* Title Toggle */}
      <div className="group flex cursor-pointer items-center" onClick={toggleOptions}>
        <CardTitle className="text-medium">{t('title')}</CardTitle>
        {isOpen ? (
          <ChevronUp className="text-muted-foreground group-hover:text-foreground ml-2 h-4 w-4 transition-colors" />
        ) : (
          <ChevronDown className="text-muted-foreground group-hover:text-foreground ml-2 h-4 w-4 transition-colors" />
        )}
      </div>

      {/* Animated Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="advancedOptions"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, delay: 0.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-4 space-y-4 px-1">
              {/* 2x2 Grid for Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Image Models */}
                <div className="space-y-2">
                  <Label>{t('imageModel')}</Label>
                  <ModelSelect
                    models={models}
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    placeholder={t('imageModelPlaceholder')}
                    label={t('imageModel')}
                    isLoading={isLoading}
                    isError={isError}
                  />
                </div>

                {/* Image Dimension */}
                <div className="space-y-2">
                  <Label>{t('imageDimension')}</Label>
                  <Select defaultValue="1024x1024">
                    <SelectTrigger>
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">1:1 Square (1024x1024)</SelectItem>
                      <SelectItem value="1792x1024">16:9 Wide (1792x1024)</SelectItem>
                      <SelectItem value="1024x1792">9:16 Portrait (1024x1792)</SelectItem>
                      <SelectItem value="1536x1024">3:2 Landscape (1536x1024)</SelectItem>
                      <SelectItem value="1024x1536">2:3 Portrait (1024x1536)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Art Styles */}
                <div className="space-y-2">
                  <Label>{t('artStyle')}</Label>
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select art style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photorealistic">Photorealistic</SelectItem>
                      <SelectItem value="digital-art">Digital Art</SelectItem>
                      <SelectItem value="oil-painting">Oil Painting</SelectItem>
                      <SelectItem value="watercolor">Watercolor</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="sketch">Sketch</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="surreal">Surreal</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label>{t('theme')}</Label>
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="bright">Bright</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label>{t('negativePrompt')}</Label>
                <AutosizeTextarea
                  placeholder={t('negativePromptPlaceholder')}
                  minHeight={60}
                  maxHeight={120}
                  className="text-sm"
                />
                <p className="text-muted-foreground text-xs">{t('negativePromptDescription')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOptions;
