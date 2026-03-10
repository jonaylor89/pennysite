"use client";

import { useCallback, useState } from "react";
import { Alert } from "@/app/components/ui/Alert";
import { Card } from "@/app/components/ui/Card";

interface Preferences {
  unsubscribed_all: boolean;
  unsubscribed_drip: boolean;
  unsubscribed_reengagement: boolean;
}

export function EmailPreferences({
  initialPreferences,
}: {
  initialPreferences: Preferences;
}) {
  const [prefs, setPrefs] = useState<Preferences>(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (updated: Preferences) => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/account/email-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        setError("Failed to save preferences");
        return;
      }

      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }, []);

  function toggle(key: keyof Preferences) {
    const updated = { ...prefs, [key]: !prefs[key] };
    // If turning off "all", also turn off subcategories
    if (key === "unsubscribed_all" && !prefs.unsubscribed_all) {
      updated.unsubscribed_drip = true;
      updated.unsubscribed_reengagement = true;
    }
    // If turning on any subcategory, turn off "all"
    if (key !== "unsubscribed_all" && prefs[key] && prefs.unsubscribed_all) {
      updated.unsubscribed_all = false;
    }
    save(updated);
  }

  return (
    <Card className="mt-6">
      <h2 className="font-semibold">Email Preferences</h2>
      <p className="mt-1 text-sm text-ink-600">
        Choose which emails you'd like to receive.
      </p>

      <div className="mt-5 space-y-4">
        <ToggleRow
          label="Tips & onboarding"
          description="Prompt tips, feature guides, and inspiration (days 0–30)"
          checked={!prefs.unsubscribed_drip}
          disabled={saving || prefs.unsubscribed_all}
          onChange={() => toggle("unsubscribed_drip")}
        />
        <ToggleRow
          label="Re-engagement"
          description="Reminders about unpublished sites, unused credits, and refresh nudges"
          checked={!prefs.unsubscribed_reengagement}
          disabled={saving || prefs.unsubscribed_all}
          onChange={() => toggle("unsubscribed_reengagement")}
        />

        <div className="border-t border-border pt-4">
          <ToggleRow
            label="Unsubscribe from all emails"
            description="This turns off everything, including celebration emails"
            checked={prefs.unsubscribed_all}
            disabled={saving}
            onChange={() => toggle("unsubscribed_all")}
          />
        </div>
      </div>

      {saved && (
        <Alert variant="success" className="mt-4">
          Preferences saved
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
      />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-ink-600">{description}</div>
      </div>
    </label>
  );
}
