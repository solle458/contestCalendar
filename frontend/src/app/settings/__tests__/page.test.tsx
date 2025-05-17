import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import SettingsPage from '../page';
import { createApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// モックの設定
jest.mock('next-auth/react');
jest.mock('@/lib/api-client');
jest.mock('sonner');

// テスト用のデータ
const mockSettings = [
  {
    platform: 'atcoder',
    active: true,
    notifyBeforeMinutes: 30,
  },
  {
    platform: 'codeforces',
    active: true,
    notifyBeforeMinutes: 60,
  },
];

// モックの実装
const mockUseSession = useSession as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockToast = toast as jest.Mock;

describe('SettingsPage', () => {
  beforeEach(() => {
    // セッションのモック
    mockUseSession.mockReturnValue({
      data: {
        accessToken: 'test-token',
      },
      status: 'authenticated',
    });

    // APIクライアントのモック
    const mockApi = {
      settings: {
        list: jest.fn().mockResolvedValue(mockSettings),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    mockCreateApiClient.mockReturnValue(mockApi);

    // トーストのモック
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
    mockToast.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<SettingsPage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should render settings after loading', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
      expect(screen.getByText('CODEFORCES')).toBeInTheDocument();
    });
  });

  it('should handle setting changes', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
    });

    // 通知時間の変更
    const notifyTimeInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(notifyTimeInput, { target: { value: '45' } });

    // 有効/無効の切り替え
    const activeSwitch = screen.getAllByRole('switch')[0];
    fireEvent.click(activeSwitch);

    await waitFor(() => {
      expect(notifyTimeInput).toHaveValue(45);
      expect(activeSwitch).toBeChecked();
    });
  });

  it('should save settings successfully', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
    });

    // 設定の変更
    const notifyTimeInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(notifyTimeInput, { target: { value: '45' } });

    // 保存ボタンのクリック
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('設定を保存しました');
    });
  });

  it('should show error toast when save fails', async () => {
    // APIのエラーをモック
    const mockApi = {
      settings: {
        list: jest.fn().mockResolvedValue(mockSettings),
        update: jest.fn().mockRejectedValue(new Error('Save failed')),
      },
    };
    mockCreateApiClient.mockReturnValue(mockApi);

    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
    });

    // 保存ボタンのクリック
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('設定の保存に失敗しました');
    });
  });

  it('should show validation errors', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
    });

    // 無効な通知時間の設定
    const notifyTimeInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(notifyTimeInput, { target: { value: '3' } });

    // 保存ボタンのクリック
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('設定にエラーがあります');
      expect(screen.getByText('ATCODERの通知時間は5分以上で設定してください')).toBeInTheDocument();
    });
  });

  it('should show info toast when no changes', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('ATCODER')).toBeInTheDocument();
    });

    // 保存ボタンのクリック（変更なし）
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.info).toHaveBeenCalledWith('変更はありません');
    });
  });

  it('should handle session error', async () => {
    // セッションエラーをモック
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SettingsPage />);
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('設定の取得に失敗しました');
    });
  });
}); 
