"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useEmailGateStore } from "@/lib/email-gate-store";
import { isValidEmail } from "@/lib/validate-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appele une fois le contact deverrouille (envoi Brevo tente, jamais bloquant). */
  onUnlocked: () => void;
  garmentType?: string;
}

/**
 * BRIEF-01 - modal de capture email avant export PDF / impression du patron.
 * Deverrouillage immediat : on n'attend jamais Brevo pour donner l'acces
 * (fail-open cote /api/subscribe et cote fetch ci-dessous).
 */
export function EmailGateModal({
  open,
  onOpenChange,
  onUnlocked,
  garmentType,
}: EmailGateModalProps) {
  const { t, language } = useTranslation();
  const unlock = useEmailGateStore((state) => state.unlock);

  const [email, setEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError(t("emailGateInvalidEmail"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          language,
          garmentType,
          newsletterConsent,
        }),
      });

      if (res.status === 400) {
        const data = await res.json().catch(() => null);
        if (data?.error === "invalid_email") {
          setError(t("emailGateInvalidEmail"));
          setIsSubmitting(false);
          return;
        }
      }
      // Toute autre reponse (succes, ou erreur serveur imprevue) deverrouille
      // quand meme : la capture email ne doit jamais bloquer le produit.
    } catch (err) {
      console.error("[EmailGateModal] /api/subscribe injoignable, deverrouillage quand meme:", err);
    }

    unlock();
    setIsSubmitting(false);
    setEmail("");
    setNewsletterConsent(false);
    onUnlocked();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("emailGateTitle")}</DialogTitle>
          <DialogDescription>{t("emailGateDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email-gate-email">{t("emailGateEmailLabel")}</Label>
            <Input
              id="email-gate-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailGateEmailPlaceholder")}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="email-gate-newsletter"
              checked={newsletterConsent}
              onCheckedChange={setNewsletterConsent}
              disabled={isSubmitting}
              className="mt-0.5"
            />
            <Label
              htmlFor="email-gate-newsletter"
              className="text-sm font-normal text-muted-foreground cursor-pointer"
            >
              {t("emailGateNewsletterLabel")}
            </Label>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("emailGateSubmitting") : t("emailGateSubmit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
