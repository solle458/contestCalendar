"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { createApiClient, type UserSettings } from "@/lib/api-client";
import {
  validateSettings,
  validateNotifyTime,
  debouncedValidate,
  clearValidationCache,
  cancelValidation,
  filterValidationErrors,
  type ValidationError,
} from "@/lib/validation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { logger } from "@/lib/logger";

// 設定カードコンポーネントをメモ化
const SettingCard = React.memo(function SettingCard({
  setting,
  onSettingChange,
  errors,
  warnings,
  notifyTimeErrors,
  isSaving,
}: {
  setting: UserSettings;
  onSettingChange: (platform: string, field: keyof UserSettings, value: UserSettings[keyof UserSettings]) => void;
  errors: ValidationError[];
  warnings: ValidationError[];
  notifyTimeErrors: Record<string, string>;
  isSaving: boolean;
}) {
  // エラーと警告の取得をメモ化
  const getFieldError = useCallback(
    (field: keyof UserSettings) => errors.find((error) => error.field === field)?.message,
    [errors]
  );

  const getFieldWarning = useCallback(
    (field: keyof UserSettings) => warnings.find((warning) => warning.field === field)?.message,
    [warnings]
  );

  // 入力値の変更を最適化
  const handleNotifyTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0;
      onSettingChange(setting.platform, "notify_before_min", value);
    },
    [setting.platform, onSettingChange]
  );

  const handleActiveChange = useCallback(
    (checked: boolean) => {
      onSettingChange(setting.platform, "enabled", checked);
    },
    [setting.platform, onSettingChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{setting.platform.toUpperCase()}</span>
          <FormField
            label="有効/無効"
            error={getFieldError("enabled")}
            className="flex items-center space-x-2"
          >
            <Switch
              checked={setting.enabled}
              onCheckedChange={handleActiveChange}
              disabled={isSaving}
            />
          </FormField>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            label="通知時間"
            error={
              notifyTimeErrors[setting.platform] ||
              getFieldError("notify_before_min")
            }
            description="コンテスト開始前の通知時間を設定"
            required
          >
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max="1440"
                value={setting.notify_before_min}
                onChange={handleNotifyTimeChange}
                className={cn(
                  "w-24",
                  notifyTimeErrors[setting.platform] && "border-red-500"
                )}
                disabled={isSaving}
              />
              <span className="text-sm text-gray-500">分前</span>
            </div>
          </FormField>

          {getFieldWarning("notify_before_min") && (
            <Alert variant="default" className="bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                {getFieldWarning("notify_before_min")}
              </AlertDescription>
            </Alert>
          )}

          {getFieldWarning("enabled") && (
            <Alert variant="default" className="bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                {getFieldWarning("enabled")}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [notifyTimeErrors, setNotifyTimeErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // 前回の設定値を保持
  const previousSettingsRef = useRef<UserSettings[]>([]);
  const api = useMemo(() => createApiClient(), []);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    logger.info('Settings page mounted');
    return () => {
      logger.info('Settings page unmounted');
      clearValidationCache();
      cancelValidation();
    };
  }, []);

  // 設定の取得を最適化
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchSettings = async () => {
      try {
        const data = await api.settings.list();
        if (isMounted) {
          setSettings(data);
          previousSettingsRef.current = data;
          // 初期データのバリデーション
          const validation = validateSettings(data);
          setErrors(validation.errors);
          setWarnings(validation.warnings || []);
          logger.info('Settings fetched successfully', { count: data.length });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        logger.error('Failed to fetch settings', { error });
        if (isMounted) {
          toast.error("設定の取得に失敗しました");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [api]);

  // 設定変更ハンドラを最適化
  const handleSettingChange = useCallback(
    (platform: string, field: keyof UserSettings, value: UserSettings[keyof UserSettings]) => {
      setSettings((prev) => {
        const newSettings = prev.map((setting) =>
          setting.platform === platform ? { ...setting, [field]: value } : setting
        );

        // 通知時間の変更時は即時バリデーション
        if (field === "notify_before_min") {
          const error = validateNotifyTime(value as number, platform);
          if (error?.type === "custom") {
            logger.warn('Non-recommended notify time', { platform, value, error });
            setWarnings((prev) => [...prev, error]);
          } else if (error) {
            logger.warn('Invalid notify time', { platform, value, error });
            setNotifyTimeErrors((prev) => ({
              ...prev,
              [platform]: error.message,
            }));
          } else {
            setNotifyTimeErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[platform];
              return newErrors;
            });
          }
        }

        // 変更があった場合のみバリデーションを実行
        const hasChanges = newSettings.some(
          (setting, index) =>
            JSON.stringify(setting) !== JSON.stringify(prev[index])
        );

        if (hasChanges) {
          setIsValidating(true);
          debouncedValidate(newSettings, (result) => {
            setErrors(result.errors);
            setWarnings(result.warnings || []);
            setIsValidating(false);
          });
        }

        return newSettings;
      });
    },
    []
  );

  // 保存ハンドラを最適化
  const handleSave = useCallback(async () => {
    logger.info('Saving settings');
    // 保存前に最終バリデーション
    const validation = validateSettings(settings);
    if (!validation.isValid) {
      logger.warn('Validation failed before save', { 
        errors: validation.errors,
        warnings: validation.warnings
      });
      setErrors(validation.errors);
      setWarnings(validation.warnings || []);
      toast.error("設定にエラーがあります");
      return;
    }

    // 変更がない場合は保存をスキップ
    const hasChanges = settings.some(
      (setting, index) =>
        JSON.stringify(setting) !== JSON.stringify(previousSettingsRef.current[index])
    );

    if (!hasChanges) {
      logger.info('No changes to save');
      toast.info("変更はありません");
      return;
    }

    try {
      setIsSaving(true);
      await Promise.all(settings.map((setting) => api.settings.update(setting)));
      logger.info('Settings saved successfully');
      toast.success("設定を保存しました");
      setErrors([]);
      setWarnings([]);
      setNotifyTimeErrors({});
      previousSettingsRef.current = settings;
      // 保存成功時にキャッシュをクリア
      clearValidationCache();
    } catch (error) {
      logger.error('Failed to save settings', { error });
      toast.error("設定の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }, [api, settings]);

  // フォームの送信ハンドラを最適化
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSave();
    },
    [handleSave]
  );

  // バリデーション状態をメモ化
  const isFormValid = useMemo(
    () =>
      !isValidating &&
      errors.length === 0 &&
      !Object.values(notifyTimeErrors).some(Boolean),
    [errors, notifyTimeErrors, isValidating]
  );

  // エラーと警告のフィルタリングを最適化
  const filteredErrors = useMemo(
    () =>
      filterValidationErrors(
        {
          isValid: errors.length === 0,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        { includeWarnings: false }
      ),
    [errors, warnings]
  );

  const filteredWarnings = useMemo(
    () =>
      filterValidationErrors(
        {
          isValid: errors.length === 0,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        { includeWarnings: true, errorTypes: ["custom", "inconsistent"] }
      ),
    [errors, warnings]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center" role="status" aria-live="polite">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">設定</h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {settings.map((setting) => (
            <SettingCard
              key={setting.platform}
              setting={setting}
              onSettingChange={handleSettingChange}
              errors={filteredErrors}
              warnings={filteredWarnings}
              notifyTimeErrors={notifyTimeErrors}
              isSaving={isSaving}
            />
          ))}

          <div className="mt-8 flex justify-end space-x-4">
            {isValidating && (
              <div className="text-sm text-gray-500" role="status" aria-live="polite">
                検証中...
              </div>
            )}
            <Button
              type="submit"
              disabled={isSaving || !isFormValid}
              aria-busy={isSaving}
            >
              {isSaving ? "保存中..." : "設定を保存"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
