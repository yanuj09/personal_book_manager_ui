"use client";

import { useEffect, useMemo, useState } from "react";
import { useBooks } from "@/controllers/books-controller";
import { validatePasswordChange, validateProfile } from "@/models/validation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, PasswordInput } from "@/components/ui/input";
import { ThemePreferenceControl } from "@/components/ui/theme-toggle";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsView() {
  const { user, setUser, logout } = useAuth();
  const { books, deleteBook } = useBooks();
  const { notify } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<typeof profile>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const profileDirty = useMemo(() => {
    return (
      profile.name !== (user?.name ?? "") || profile.email !== (user?.email ?? "")
    );
  }, [profile, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const fresh = await authService.me();
        if (cancelled) return;
        setUser(fresh);
        setProfile({ name: fresh.name, email: fresh.email });
      } catch {
        if (cancelled) return;
        notify("Could not refresh profile.", "error");
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [notify, setUser]);

  async function submitProfile() {
    const errors = validateProfile(profile);
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingProfile(true);
    try {
      const nextUser = await authService.updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setUser(nextUser);
      notify("Profile updated.", "success");
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Could not update profile.",
        "error",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword() {
    const errors = validatePasswordChange(password);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      notify("Password changed.", "success");
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Could not change password.",
        "error",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function exportCollection() {
    const payload = {
      exportedAt: new Date().toISOString(),
      books,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `books-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Collection exported.", "success");
  }

  async function clearCollection() {
    setClearing(true);
    try {
      await Promise.all(books.map((book) => deleteBook(book.id)));
      notify("Collection cleared.", "success");
      setClearConfirmOpen(false);
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Could not clear collection.",
        "error",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, account preferences, and data management."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Profile" description="Update your display name and email." />
          <div className="mt-4 space-y-3">
            <Input
              label="Name"
              value={profile.name}
              error={profileErrors.name}
              onChange={(event) =>
                setProfile((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              error={profileErrors.email}
              onChange={(event) =>
                setProfile((current) => ({ ...current, email: event.target.value }))
              }
            />
            <div className="pt-1">
              <Button onClick={() => void submitProfile()} loading={savingProfile} disabled={!profileDirty}>
                Save profile
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Theme" description="Choose light, dark, or follow the system." />
          <div className="mt-4">
            <ThemePreferenceControl />
          </div>
        </Card>

        <Card>
          <CardHeader title="Change password" description="Use a secure password with at least 8 characters." />
          <div className="mt-4 space-y-3">
            <PasswordInput
              label="Current password"
              value={password.currentPassword}
              error={passwordErrors.currentPassword}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
            />
            <PasswordInput
              label="New password"
              value={password.newPassword}
              error={passwordErrors.newPassword}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
            />
            <PasswordInput
              label="Confirm new password"
              value={password.confirmPassword}
              error={passwordErrors.confirmPassword}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
            />
            <div className="pt-1">
              <Button onClick={() => void submitPassword()} loading={savingPassword}>
                Update password
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Data management" description="Export your shelf or clear it entirely." />
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => void exportCollection()}>
              Export collection
            </Button>
            <Button variant="danger-soft" onClick={() => setClearConfirmOpen(true)}>
              Clear collection
            </Button>
            <Button variant="ghost" onClick={() => void logout()} className="sm:col-span-2 sm:justify-start">
              Log out
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear all books?"
        description="Every book in your shelf will be removed. This cannot be undone."
        confirmLabel="Clear collection"
        destructive
        loading={clearing}
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={() => void clearCollection()}
      />
    </>
  );
}
