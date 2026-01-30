"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import type { YarnInfo } from "@/lib/types";

const YARN_WEIGHTS: YarnInfo["weight"][] = [
  "lace",
  "fingering",
  "sport",
  "dk",
  "worsted",
  "aran",
  "bulky",
];

interface YarnSectionProps {
  yarn: YarnInfo;
  onChange: (yarn: YarnInfo) => void;
}

export function YarnSection({ yarn, onChange }: YarnSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">{t("yarn")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="yarnWeight" className="text-sm font-medium">
            {t("yarnWeight")}
          </Label>
          <Select
            value={yarn.weight}
            onValueChange={(v) => onChange({ ...yarn, weight: v as YarnInfo["weight"] })}
          >
            <SelectTrigger id="yarnWeight" className="min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YARN_WEIGHTS.map((weight) => (
                <SelectItem key={weight} value={weight}>
                  {t(`yarn.${weight}` as const)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yarnComposition" className="text-sm font-medium">
            {t("composition")}
          </Label>
          <Input
            id="yarnComposition"
            type="text"
            placeholder={t("compositionPlaceholder")}
            value={yarn.composition || ""}
            onChange={(e) => onChange({ ...yarn, composition: e.target.value })}
            className="min-h-[44px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
