import React, { useState, useRef, useEffect } from 'react';
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
 * Textarea input with @ button to reference posts
 * Click @ button or press @ key to show dropdown of posts
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch posts for the current class (fetch all posts without pagination for autocomplete)
  const classFeedApi = useClassFeedApiService();
  const { data: postsResponse, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts-autocomplete', classId],
    queryFn: () => classFeedApi.getPosts(classId, { type: 'all' }, 1, 100),
    enabled: !!classId, // Only fetch if classId is defined
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const posts = postsResponse?.data || [];

  // Open dropdown when @ button is clicked
  const handleOpenDropdown = () => {
    setShowDropdown(true);
    setSelectedIndex(0);
    textareaRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // @ key opens dropdown (acts as hotkey)
    if (e.key === '@' && !showDropdown) {
      e.preventDefault();
      handleOpenDropdown();
      return;
    }

    // Dropdown navigation
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
        insertPostUrl(posts[selectedIndex]);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    // Submit on Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  const insertPostUrl = (post: Post) => {
    if (!textareaRef.current) return;

    // Build the post URL
    const isStudentMode = window.location.pathname.includes('/student/');
    const postUrl = isStudentMode
      ? `${window.location.origin}/student/classes/${post.classId}/posts/${post.id}`
      : `${window.location.origin}/classes/${post.classId}/posts/${post.id}`;

    // Insert URL at current cursor position
    const cursorPos = textareaRef.current.selectionStart || 0;
    const newValue = value.substring(0, cursorPos) + postUrl + ' ' + value.substring(cursorPos);

    onChange(newValue);
    setShowDropdown(false);

    // Focus back on textarea and set cursor after inserted URL
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = cursorPos + postUrl.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full resize-none rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          rows={1}
        />

        {/* @ Button */}
        <button
          type="button"
          onClick={handleOpenDropdown}
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
                  onClick={() => insertPostUrl(post)}
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
