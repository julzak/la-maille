"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { loadProject, clearProject, type StoredProject } from "@/lib/storage";

interface ResumeProjectDialogProps {
  onResume?: (project: StoredProject) => void;
  onNewProject?: () => void;
}

export function ResumeProjectDialog({
  onResume,
  onNewProject,
}: ResumeProjectDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<StoredProject | null>(null);

  // Check for existing project on mount
  useEffect(() => {
    const savedProject = loadProject();
    if (savedProject) {
      setProject(savedProject);
      setOpen(true);
    }
  }, []);

  const handleResume = () => {
    if (!project) return;

    setOpen(false);

    if (onResume) {
      onResume(project);
    } else {
      // Navigate to appropriate page based on project step
      switch (project.step) {
        case "analysis":
          router.push("/analyse");
          break;
        case "measurements":
          router.push("/analyse");
          break;
        case "pattern":
          router.push("/patron");
          break;
        default:
          router.push("/analyse");
      }
    }
  };

  const handleNewProject = () => {
    clearProject();
    setOpen(false);
    setProject(null);

    if (onNewProject) {
      onNewProject();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span aria-hidden="true">📂</span>
            {t("projectInProgress")}
          </DialogTitle>
          <DialogDescription>
            {t("resumeProjectQuestion")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project preview */}
          <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            {project.imagePreview && (
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imagePreview}
                  alt="Apercu du projet"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {project.analysis?.garment?.type
                  ? t(`garment.${project.analysis.garment.type}` as const)
                  : "Projet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(project.updatedAt || project.createdAt)}
              </p>
              {project.step && (
                <p className="text-xs text-muted-foreground mt-1">
                  {project.step === "analysis" && "Analyse en cours"}
                  {project.step === "measurements" && "Mesures en cours"}
                  {project.step === "pattern" && "Patron genere"}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleNewProject}
              className="flex-1"
            >
              {t("newProject")}
            </Button>
            <Button
              onClick={handleResume}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {t("resumeProject")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeProjectDialog;
