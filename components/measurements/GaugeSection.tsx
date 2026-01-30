"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GaugeChecker } from "@/components/GaugeChecker";
import { useTranslation } from "@/lib/i18n";
import type { Gauge } from "@/lib/types";

const NEEDLE_SIZES = [
  "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5",
  "6", "6.5", "7", "7.5", "8", "9", "10", "12",
];

interface GaugeSectionProps {
  gauge: Gauge;
  onChange: (gauge: Gauge) => void;
  errors: {
    stitchesPer10cm?: string;
    rowsPer10cm?: string;
  };
  touched: Set<string>;
  onBlur: (field: string) => void;
}

export function GaugeSection({
  gauge,
  onChange,
  errors,
  touched,
  onBlur,
}: GaugeSectionProps) {
  const { t } = useTranslation();
  const [gaugeCheckerOpen, setGaugeCheckerOpen] = useState(false);
  const [whyEssentialOpen, setWhyEssentialOpen] = useState(false);

  return (
    <>
      <Card className="border-accent">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base md:text-lg">{t("gauge")}</CardTitle>
            <button
              type="button"
              onClick={() => setWhyEssentialOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="text-xs md:text-sm underline decoration-dotted">
                {t("whyEssential")}
              </span>
            </button>
          </div>
          <CardDescription className="text-xs md:text-sm">
            {t("gaugeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stitchesPer10cm" className="text-sm font-medium">
                {t("stitchesPer10cm")} *
              </Label>
              <Input
                id="stitchesPer10cm"
                type="number"
                inputMode="numeric"
                min={10}
                max={40}
                value={gauge.stitchesPer10cm}
                onChange={(e) =>
                  onChange({ ...gauge, stitchesPer10cm: Number(e.target.value) })
                }
                onBlur={() => onBlur("stitchesPer10cm")}
                className={`min-h-[44px] ${
                  touched.has("stitchesPer10cm") && errors.stitchesPer10cm
                    ? "border-destructive"
                    : ""
                }`}
                aria-invalid={touched.has("stitchesPer10cm") && !!errors.stitchesPer10cm}
                aria-describedby={errors.stitchesPer10cm ? "stitchesPer10cm-error" : undefined}
              />
              {touched.has("stitchesPer10cm") && errors.stitchesPer10cm && (
                <p id="stitchesPer10cm-error" className="text-xs text-destructive" role="alert">
                  {errors.stitchesPer10cm}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rowsPer10cm" className="text-sm font-medium">
                {t("rowsPer10cm")} *
              </Label>
              <Input
                id="rowsPer10cm"
                type="number"
                inputMode="numeric"
                min={15}
                max={60}
                value={gauge.rowsPer10cm}
                onChange={(e) =>
                  onChange({ ...gauge, rowsPer10cm: Number(e.target.value) })
                }
                onBlur={() => onBlur("rowsPer10cm")}
                className={`min-h-[44px] ${
                  touched.has("rowsPer10cm") && errors.rowsPer10cm
                    ? "border-destructive"
                    : ""
                }`}
                aria-invalid={touched.has("rowsPer10cm") && !!errors.rowsPer10cm}
                aria-describedby={errors.rowsPer10cm ? "rowsPer10cm-error" : undefined}
              />
              {touched.has("rowsPer10cm") && errors.rowsPer10cm && (
                <p id="rowsPer10cm-error" className="text-xs text-destructive" role="alert">
                  {errors.rowsPer10cm}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="needleSize" className="text-sm font-medium">
              {t("needleSize")}
            </Label>
            <Select
              value={String(gauge.needleSize)}
              onValueChange={(v) => onChange({ ...gauge, needleSize: Number(v) })}
            >
              <SelectTrigger id="needleSize" className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEEDLE_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGaugeCheckerOpen(true)}
              className="w-full text-sm"
            >
              {t("checkSwatchVisually")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why Essential Dialog */}
      <Dialog open={whyEssentialOpen} onOpenChange={setWhyEssentialOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t("whyEssentialTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t("whyEssentialText1")}</p>
            <p>{t("whyEssentialText2")}</p>
            <p className="font-medium text-foreground">{t("whyEssentialText3")}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gauge Checker Modal */}
      <GaugeChecker open={gaugeCheckerOpen} onOpenChange={setGaugeCheckerOpen} />
    </>
  );
}
