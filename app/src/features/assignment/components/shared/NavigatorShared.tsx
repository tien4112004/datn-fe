import React from 'react';
import { FileText, Grid3x3, BookOpen, List } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const NAVIGATOR_BTN_BASE = 'flex h-8 items-center justify-center rounded text-xs transition-colors';
const NAVIGATOR_BTN_INACTIVE =
  'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700';
const NAVIGATOR_BTN_ACTIVE = 'bg-primary text-primary-foreground';

/* ============================================================================
   UTILITIES
   ============================================================================ */

export function getQuestionButtonClassName(opts: {
  isActive: boolean;
  hasError?: boolean;
  isInContext: boolean;
  hasTitle: boolean;
  isDragging?: boolean;
  disabled?: boolean;
}): string {
  const { isActive, hasError, isInContext, hasTitle, isDragging, disabled } = opts;

  return cn(
    NAVIGATOR_BTN_BASE,
    'w-full font-medium',
    isActive
      ? NAVIGATOR_BTN_ACTIVE
      : hasError
        ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
        : isInContext
          ? hasTitle
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
            : 'bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900'
          : hasTitle
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            : NAVIGATOR_BTN_INACTIVE,
    isDragging ? 'cursor-grabbing' : disabled ? 'cursor-not-allowed opacity-50' : undefined
  );
}

/* ============================================================================
   COMPONENTS
   ============================================================================ */

interface NavigatorToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  extraClassName?: string;
  dataTutorial?: string;
}

export const NavigatorToolbarButton = ({
  icon,
  tooltip,
  isActive,
  onClick,
  disabled,
  extraClassName,
  dataTutorial,
}: NavigatorToolbarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          {...(dataTutorial ? { 'data-tutorial': dataTutorial } : {})}
          className={cn(
            NAVIGATOR_BTN_BASE,
            'flex-1',
            isActive ? NAVIGATOR_BTN_ACTIVE : cn(NAVIGATOR_BTN_INACTIVE, extraClassName),
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface NavigatorToolbarProps {
  activeView: string;
  onInfoClick: () => void;
  onMatrixClick: () => void;
  onContextsClick: () => void;
  onQuestionsListClick: () => void;
  disabled?: boolean;
  infoErrorClassName?: string;
  matrixWarningClassName?: string;
  tooltipInfo: string;
  tooltipMatrix: string;
  tooltipContexts: string;
  tooltipQuestionsList: string;
  tutorialAttrToolbar?: string;
  tutorialAttrInfo?: string;
  tutorialAttrMatrix?: string;
  tutorialAttrContexts?: string;
  tutorialAttrQuestionsList?: string;
}

export const NavigatorToolbar = ({
  activeView,
  onInfoClick,
  onMatrixClick,
  onContextsClick,
  onQuestionsListClick,
  disabled,
  infoErrorClassName,
  matrixWarningClassName,
  tooltipInfo,
  tooltipMatrix,
  tooltipContexts,
  tooltipQuestionsList,
  tutorialAttrToolbar,
  tutorialAttrInfo,
  tutorialAttrMatrix,
  tutorialAttrContexts,
  tutorialAttrQuestionsList,
}: NavigatorToolbarProps) => {
  return (
    <div className="flex gap-1.5" {...(tutorialAttrToolbar ? { 'data-tutorial': tutorialAttrToolbar } : {})}>
      <NavigatorToolbarButton
        icon={<FileText className="h-3 w-3" />}
        tooltip={tooltipInfo}
        isActive={activeView === 'info'}
        onClick={onInfoClick}
        disabled={disabled}
        extraClassName={infoErrorClassName}
        dataTutorial={tutorialAttrInfo}
      />

      <NavigatorToolbarButton
        icon={<Grid3x3 className="h-3 w-3" />}
        tooltip={tooltipMatrix}
        isActive={activeView === 'matrix'}
        onClick={onMatrixClick}
        disabled={disabled}
        extraClassName={matrixWarningClassName}
        dataTutorial={tutorialAttrMatrix}
      />

      <NavigatorToolbarButton
        icon={<BookOpen className="h-3 w-3" />}
        tooltip={tooltipContexts}
        isActive={activeView === 'contexts'}
        onClick={onContextsClick}
        disabled={disabled}
        dataTutorial={tutorialAttrContexts}
      />

      <NavigatorToolbarButton
        icon={<List className="h-3 w-3" />}
        tooltip={tooltipQuestionsList}
        isActive={activeView === 'questionsList'}
        onClick={onQuestionsListClick}
        disabled={disabled}
        dataTutorial={tutorialAttrQuestionsList}
      />
    </div>
  );
};

interface NavigatorContextGroupButtonProps {
  tooltipText: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  dataTutorial?: string;
}

export const NavigatorContextGroupButton = ({
  tooltipText,
  isActive,
  onClick,
  disabled,
  dataTutorial,
}: NavigatorContextGroupButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          {...(dataTutorial ? { 'data-tutorial': dataTutorial } : {})}
          className={cn(
            NAVIGATOR_BTN_BASE,
            'w-full font-medium',
            isActive
              ? NAVIGATOR_BTN_ACTIVE
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <BookOpen className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface NavigatorBaseQuestionButtonProps {
  questionNumber: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  hasTitle: boolean;
  isInContext: boolean;
  hasError?: boolean;
  tooltipTitle: string;
  dataTutorial?: string;
}

export const NavigatorBaseQuestionButton = ({
  questionNumber,
  isActive,
  onClick,
  disabled,
  hasTitle,
  isInContext,
  hasError,
  tooltipTitle,
  dataTutorial,
}: NavigatorBaseQuestionButtonProps) => {
  const className = getQuestionButtonClassName({
    isActive,
    hasError,
    isInContext,
    hasTitle,
    disabled,
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          {...(dataTutorial ? { 'data-tutorial': dataTutorial } : {})}
          className={className}
        >
          {questionNumber}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[150px]">
        <p className="truncate">{tooltipTitle}</p>
      </TooltipContent>
    </Tooltip>
  );
};
