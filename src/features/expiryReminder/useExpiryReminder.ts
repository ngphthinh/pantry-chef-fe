import { useCallback, useEffect, useMemo } from "react";
import { Linking } from "react-native";
import { runAction } from "@/core/http/actionResult";
import { expiryReminderService } from "@/core/di/container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadExpiryReminder, refreshExpiryReminder, saveExpiryReminder } from "./expiryReminderSlice";

/** Cài đặt nhắc nguyên liệu sắp hết hạn. Tự tải cài đặt đã lưu khi mở màn hình. */
export function useExpiryReminder() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.expiryReminder.settings);
  const permission = useAppSelector((s) => s.expiryReminder.permission);
  const plan = useAppSelector((s) => s.expiryReminder.plan);
  const loaded = useAppSelector((s) => s.expiryReminder.loaded);
  const status = useAppSelector((s) => s.expiryReminder.status);

  useEffect(() => {
    void runAction(() => dispatch(loadExpiryReminder()), "Không tải được cài đặt nhắc nhở.");
  }, [dispatch]);

  const update = useCallback(
    (patch: Partial<typeof settings>) =>
      runAction(
        () => dispatch(saveExpiryReminder({ ...settings, ...patch })),
        "Không lưu được cài đặt nhắc nhở.",
      ),
    [dispatch, settings],
  );

  const setEnabled = useCallback((enabled: boolean) => update({ enabled }), [update]);
  const setDaysBefore = useCallback((daysBefore: number) => update({ daysBefore }), [update]);
  const setHour = useCallback((hour: number) => update({ hour }), [update]);

  /** Tính lại nội dung theo tủ hiện tại và lên lịch lại ngay. */
  const refreshNow = useCallback(
    () => runAction(() => dispatch(refreshExpiryReminder()), "Không cập nhật được lịch nhắc."),
    [dispatch],
  );

  const openSystemSettings = useCallback(() => Linking.openSettings(), []);

  return useMemo(
    () => ({
      settings,
      permission,
      plan,
      isSupported: expiryReminderService.isSupported(),
      isLoading: !loaded,
      isApplying: status === "applying",
      setEnabled,
      setDaysBefore,
      setHour,
      refreshNow,
      openSystemSettings,
    }),
    [settings, permission, plan, loaded, status, setEnabled, setDaysBefore, setHour, refreshNow, openSystemSettings],
  );
}
