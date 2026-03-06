import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, AtSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useClassFeedApiService } from '../api';
import type { Post } from '../types';

interface PostMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  classId: string;
  className?: string;
}

/**
 * Serializes the contenteditable div into a plain-text string.
 * Chip elements (data-post-url) become their URL; text nodes become their text.
 */
function serializeContent(el: HTMLElement): string {
  let result = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? '';
    } else if (node instanceof HTMLElement && node.dataset.postUrl) {
      result += node.dataset.postUrl;
    } else if (node instanceof HTMLElement) {
      result += node.textContent ?? '';
    }
  });
  return result;
}

/**
 * Rich comment input that renders selected post references as inline chips.
 * Serializes to plain text (with relative URLs) for submission.
 */
export function PostMentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  classId,
  className = '',
}: PostMentionInputProps) {
  const { t } = useTranslation('classes');
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Track whether the editor is empty for placeholder visibility
  const [isEmpty, setIsEmpty] = useState(!value);

  const classFeedApi = useClassFeedApiService();
  const { data: postsResponse, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts-autocomplete', classId],
    queryFn: () => classFeedApi.getPosts(classId, { type: 'all' }, 1, 100),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });

  const posts = postsResponse?.data || [];

  // Sync external empty-reset (e.g. after submit parent sets value to '')
  useEffect(() => {
    if (value === '' && editorRef.current) {
      editorRef.current.innerHTML = '';
      setIsEmpty(true);
    }
  }, [value]);

  const openDropdown = () => {
    setShowDropdown(true);
    setSelectedIndex(0);
    editorRef.current?.focus();
  };

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const serialized = serializeContent(editorRef.current);
    setIsEmpty(serialized.trim() === '');
    onChange(serialized);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '@' && !showDropdown) {
      e.preventDefault();
      openDropdown();
      return;
    }

    if (showDropdown && posts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % posts.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + posts.length) % posts.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertPostChip(posts[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }

    // Prevent Enter from creating a new block element in contenteditable
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !showDropdown) {
      e.preventDefault();
    }
  };

  const insertPostChip = (post: Post) => {
    if (!editorRef.current) return;

    const isStudentMode = window.location.pathname.includes('/student/');
    const preview = post.content.substring(0, 40) + (post.content.length > 40 ? '…' : '');
    const basePath = isStudentMode
      ? `/student/classes/${post.classId}/posts/${post.id}`
      : `/classes/${post.classId}/posts/${post.id}`;
    const postUrl = `${basePath}?preview=${encodeURIComponent(preview)}`;

    const label = preview;

    // Build chip element
    const chip = document.createElement('span');
    chip.dataset.postUrl = postUrl;
    chip.contentEditable = 'false';
    chip.className =
      'inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-sm font-medium text-blue-700 mx-0.5 select-none';
    chip.title = postUrl;

    const icon = document.createElement('span');
    icon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/></svg>';
    icon.className = 'flex-shrink-0';

    const text = document.createElement('span');
    text.className = 'max-w-[160px] truncate';
    text.textContent = label;

    chip.appendChild(icon);
    chip.appendChild(text);

    // Insert chip at current caret position
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Ensure caret is inside the editor
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(chip);
        // Move caret after chip
        range.setStartAfter(chip);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editorRef.current.appendChild(chip);
      }
    } else {
      editorRef.current.appendChild(chip);
    }

    // Insert trailing space text node so caret lands after chip
    const space = document.createTextNode('\u00A0');
    chip.after(space);
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(newRange);

    setShowDropdown(false);
    editorRef.current.focus();

    const serialized = serializeContent(editorRef.current);
    setIsEmpty(serialized.trim() === '');
    onChange(serialized);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className={`relative min-h-[38px] w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      >
        {/* Placeholder */}
        {isEmpty && (
          <span className="pointer-events-none absolute left-3 top-2 select-none text-sm text-gray-400">
            {placeholder}
          </span>
        )}

        {/* Contenteditable editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-[22px] w-full text-sm text-gray-900 outline-none"
          style={{ wordBreak: 'break-word' }}
        />

        {/* @ Button */}
        <button
          type="button"
          onClick={openDropdown}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          title={t('feed.comments.mentionPost')}
        >
          <AtSign className="h-4 w-4" />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {loadingPosts ? (
            <div className="flex items-center justify-center p-4 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('feed.comments.loadingPosts')}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">{t('feed.comments.noPostsFound')}</div>
          ) : (
            <div className="py-1">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-gray-100' : ''
                  }`}
                  onMouseDown={(e) => {
                    // Prevent blur on editor before inserting
                    e.preventDefault();
                    insertPostChip(post);
                  }}
                >
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-900">
                      {post.content.substring(0, 100)}
                      {post.content.length > 100 && '...'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {post.author
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : t('feed.comments.unknownAuthor')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
