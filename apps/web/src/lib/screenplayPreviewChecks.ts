import {
  screenplayDocumentSchema,
  type ScreenplayDocument
} from "@scriptforge/shared";

export type PreviewCheckStatus = "pass" | "warning" | "fail";

export interface PreviewCheckItem {
  id: string;
  label: string;
  status: PreviewCheckStatus;
  summary: string;
  details: string[];
}

export interface PreviewChecksResult {
  summary: {
    total: number;
    passed: number;
    warning: number;
    failed: number;
  };
  items: PreviewCheckItem[];
}

function getTopLevelStructureCheck(
  screenplay: ScreenplayDocument
): PreviewCheckItem {
  const requiredSections = screenplayDocumentSchema.required ?? [];
  const missingSections = requiredSections.filter((key) => {
    const value = screenplay[key as keyof ScreenplayDocument];
    return value === undefined || value === null;
  });

  if (missingSections.length > 0) {
    return {
      id: "top-level-structure",
      label: "Top-level structure",
      status: "fail",
      summary: "One or more required top-level sections are missing.",
      details: missingSections.map((section) => `Missing section: ${section}`)
    };
  }

  return {
    id: "top-level-structure",
    label: "Top-level structure",
    status: "pass",
    summary: "All required top-level sections are present.",
    details: requiredSections.map((section) => `Found section: ${section}`)
  };
}

function getSceneAvailabilityCheck(
  screenplay: ScreenplayDocument
): PreviewCheckItem {
  if (screenplay.scenes.length === 0) {
    return {
      id: "scene-availability",
      label: "Scene availability",
      status: "fail",
      summary: "The screenplay has no scenes to preview.",
      details: ["Add at least one scene before using the screenplay preview panels."]
    };
  }

  return {
    id: "scene-availability",
    label: "Scene availability",
    status: "pass",
    summary: `${screenplay.scenes.length} scene(s) available for preview.`,
    details: screenplay.scenes.map((scene) => `Scene ready: ${scene.id}`)
  };
}

function getReferenceConsistencyCheck(
  screenplay: ScreenplayDocument
): PreviewCheckItem {
  const characterIds = new Set(screenplay.characters.map((character) => character.id));
  const locationIds = new Set(screenplay.locations.map((location) => location.id));
  const missingReferences: string[] = [];

  screenplay.scenes.forEach((scene) => {
    if (!locationIds.has(scene.location_id)) {
      missingReferences.push(
        `Scene ${scene.id} references missing location ${scene.location_id}.`
      );
    }

    scene.characters.forEach((characterId) => {
      if (!characterIds.has(characterId)) {
        missingReferences.push(
          `Scene ${scene.id} references missing character ${characterId}.`
        );
      }
    });
  });

  if (missingReferences.length > 0) {
    return {
      id: "reference-consistency",
      label: "Reference consistency",
      status: "fail",
      summary: "Some scene references do not resolve to shared character or location entries.",
      details: missingReferences
    };
  }

  return {
    id: "reference-consistency",
    label: "Reference consistency",
    status: "pass",
    summary: "Scene character and location references resolve successfully.",
    details: [
      `${screenplay.characters.length} character reference target(s) available.`,
      `${screenplay.locations.length} location reference target(s) available.`
    ]
  };
}

export function getScreenplayPreviewChecks(
  screenplay: ScreenplayDocument
): PreviewChecksResult {
  const items = [
    getTopLevelStructureCheck(screenplay),
    getSceneAvailabilityCheck(screenplay),
    getReferenceConsistencyCheck(screenplay)
  ];

  return {
    summary: {
      total: items.length,
      passed: items.filter((item) => item.status === "pass").length,
      warning: items.filter((item) => item.status === "warning").length,
      failed: items.filter((item) => item.status === "fail").length
    },
    items
  };
}
