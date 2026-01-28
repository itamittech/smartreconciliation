import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '../../../src/store';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.clearChat();
      result.current.setReconciliations([]);
      result.current.setExceptions([]);
      result.current.setUploadedFiles([]);
    });
  });

  describe('sidebar', () => {
    it('should toggle sidebar open state', () => {
      const { result } = renderHook(() => useAppStore());

      const initialState = result.current.sidebarOpen;
      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(!initialState);
    });
  });

  describe('chat messages', () => {
    it('should add a chat message', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addChatMessage({
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        });
      });

      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].content).toBe('Hello');
    });

    it('should add multiple messages', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addChatMessage({
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        });
        result.current.addChatMessage({
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date().toISOString(),
        });
      });

      expect(result.current.chatMessages).toHaveLength(2);
    });

    it('should clear chat messages', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addChatMessage({
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        });
        result.current.clearChat();
      });

      expect(result.current.chatMessages).toHaveLength(0);
    });
  });

  describe('reconciliations', () => {
    it('should set reconciliations', () => {
      const { result } = renderHook(() => useAppStore());

      const mockRecons = [
        { id: '1', name: 'Recon 1', status: 'COMPLETED' },
        { id: '2', name: 'Recon 2', status: 'PENDING' },
      ];

      act(() => {
        result.current.setReconciliations(mockRecons as never[]);
      });

      expect(result.current.reconciliations).toHaveLength(2);
    });

    it('should set selected reconciliation', () => {
      const { result } = renderHook(() => useAppStore());

      const mockRecon = { id: '1', name: 'Recon 1', status: 'COMPLETED' };

      act(() => {
        result.current.setSelectedReconciliation(mockRecon as never);
      });

      expect(result.current.selectedReconciliation).toEqual(mockRecon);
    });
  });

  describe('exceptions', () => {
    it('should set exceptions', () => {
      const { result } = renderHook(() => useAppStore());

      const mockExceptions = [
        { id: '1', type: 'MISMATCH', status: 'OPEN' },
        { id: '2', type: 'MISSING_SOURCE', status: 'OPEN' },
      ];

      act(() => {
        result.current.setExceptions(mockExceptions as never[]);
      });

      expect(result.current.exceptions).toHaveLength(2);
    });
  });

  describe('uploaded files', () => {
    it('should add uploaded file', () => {
      const { result } = renderHook(() => useAppStore());

      const mockFile = { id: '1', filename: 'test.csv', status: 'PROCESSED' };

      act(() => {
        result.current.addUploadedFile(mockFile as never);
      });

      expect(result.current.uploadedFiles).toHaveLength(1);
    });

    it('should set uploaded files', () => {
      const { result } = renderHook(() => useAppStore());

      const mockFiles = [
        { id: '1', filename: 'file1.csv' },
        { id: '2', filename: 'file2.xlsx' },
      ];

      act(() => {
        result.current.setUploadedFiles(mockFiles as never[]);
      });

      expect(result.current.uploadedFiles).toHaveLength(2);
    });
  });

  describe('active view', () => {
    it('should set active view', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setActiveView('reconciliations');
      });

      expect(result.current.activeView).toBe('reconciliations');
    });

    it('should accept all valid views', () => {
      const { result } = renderHook(() => useAppStore());

      const views = [
        'dashboard',
        'reconciliations',
        'exceptions',
        'files',
        'rules',
        'chat',
        'settings',
      ];

      views.forEach((view) => {
        act(() => {
          result.current.setActiveView(view as never);
        });
        expect(result.current.activeView).toBe(view);
      });
    });
  });
});
