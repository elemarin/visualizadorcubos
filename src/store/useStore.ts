import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type Tool =
  | "ADD"
  | "REMOVE"
  | "PAINT_SINGLE"
  | "PAINT_FACE"
  | "CAMERA_ORBIT";

export type FaceKey = "px" | "nx" | "py" | "ny" | "pz" | "nz";

export interface Voxel {
  id: string;
  position: [number, number, number];
  color: string;
  faceColors: Record<FaceKey, string>;
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  voxels: Voxel[];
  tileSize: [number, number, number];
  groutGap: number;
  groutColor: string;
  floorColor: string;
  favoriteColors: string[];
}

export interface AppState {
  voxels: Voxel[];
  addVoxel: (position: [number, number, number]) => void;
  removeVoxel: (id: string) => void;
  paintVoxelFace: (id: string, face: FaceKey, color: string) => void;
  paintFaceRegion: (
    face: FaceKey,
    boundaryPositions: [number, number, number][],
    color: string
  ) => void;
  setVoxels: (voxels: Voxel[]) => void;

  previewPosition: [number, number, number] | null;
  setPreviewPosition: (position: [number, number, number] | null) => void;

  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;

  activeColor: string;
  setActiveColor: (color: string) => void;
  groutColor: string;
  setGroutColor: (color: string) => void;
  groutGap: number;
  setGroutGap: (gap: number) => void;
  floorColor: string;
  setFloorColor: (color: string) => void;

  favoriteColors: string[];
  addFavoriteColor: (color: string) => void;
  removeFavoriteColor: (color: string) => void;

  tileSize: [number, number, number];
  setTileSize: (size: [number, number, number]) => void;

  savedProjects: SavedProject[];
  saveProject: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjectsFromStorage: () => void;
}

const STORAGE_KEY = "voxel-builder-projects";

function createFaceColors(color: string): Record<FaceKey, string> {
  return {
    px: color,
    nx: color,
    py: color,
    ny: color,
    pz: color,
    nz: color,
  };
}

function normalizeVoxel(input: Partial<Voxel> & { id: string; position: [number, number, number] }): Voxel {
  const fallbackColor = input.color ?? "#e2c4a0";
  return {
    id: input.id,
    position: input.position,
    color: fallbackColor,
    faceColors: {
      ...createFaceColors(fallbackColor),
      ...(input.faceColors ?? {}),
    },
  };
}

function normalizeProject(raw: SavedProject): SavedProject {
  return {
    ...raw,
    voxels: (raw.voxels ?? []).map((voxel) => normalizeVoxel(voxel)),
    groutGap: typeof raw.groutGap === "number" ? raw.groutGap : 0.05,
    groutColor: raw.groutColor ?? "#d6d3d1",
    floorColor: "#ffffff",
    favoriteColors: raw.favoriteColors ?? [],
  };
}

function readProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedProject[]) : [];
    return parsed.map(normalizeProject);
  } catch {
    return [];
  }
}

function writeProjects(projects: SavedProject[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export const useStore = create<AppState>((set, get) => ({
  voxels: [],

  addVoxel: (position) => {
    const { voxels, activeColor } = get();
    const exists = voxels.some(
      (voxel) =>
        voxel.position[0] === position[0] &&
        voxel.position[1] === position[1] &&
        voxel.position[2] === position[2]
    );
    if (exists) return;

    const newVoxel: Voxel = {
      id: uuidv4(),
      position,
      color: activeColor,
      faceColors: createFaceColors(activeColor),
    };

    set({ voxels: [...voxels, newVoxel] });
  },

  removeVoxel: (id) => {
    set({ voxels: get().voxels.filter((voxel) => voxel.id !== id) });
  },

  paintVoxelFace: (id, face, color) => {
    set({
      voxels: get().voxels.map((voxel) =>
        voxel.id === id
          ? {
              ...voxel,
              faceColors: {
                ...voxel.faceColors,
                [face]: color,
              },
            }
          : voxel
      ),
    });
  },

  paintFaceRegion: (face, boundaryPositions, color) => {
    const regionSet = new Set(boundaryPositions.map((position) => position.join(",")));
    set({
      voxels: get().voxels.map((voxel) =>
        regionSet.has(voxel.position.join(","))
          ? {
              ...voxel,
              faceColors: {
                ...voxel.faceColors,
                [face]: color,
              },
            }
          : voxel
      ),
    });
  },

  setVoxels: (voxels) => set({ voxels: voxels.map((voxel) => normalizeVoxel(voxel)) }),

  previewPosition: null,
  setPreviewPosition: (position) => set({ previewPosition: position }),

  activeTool: "ADD",
  setActiveTool: (tool) => set({ activeTool: tool }),

  activeColor: "#e2c4a0",
  setActiveColor: (color) => set({ activeColor: color }),
  groutColor: "#d6d3d1",
  setGroutColor: (color) => set({ groutColor: color }),
  groutGap: 0.05,
  setGroutGap: (gap) => set({ groutGap: Math.max(0, Math.min(0.2, gap)) }),
  floorColor: "#ffffff",
  setFloorColor: () => set({ floorColor: "#ffffff" }),

  favoriteColors: [],
  addFavoriteColor: (color) => {
    const { favoriteColors } = get();
    if (!favoriteColors.includes(color)) {
      set({ favoriteColors: [...favoriteColors, color] });
    }
  },
  removeFavoriteColor: (color) => {
    set({ favoriteColors: get().favoriteColors.filter((entry) => entry !== color) });
  },

  tileSize: [1, 1, 1],
  setTileSize: (size) => set({ tileSize: size }),

  savedProjects: [],

  saveProject: (name) => {
    const { voxels, tileSize, groutGap, groutColor, favoriteColors, savedProjects } = get();
    const project: SavedProject = {
      id: uuidv4(),
      name,
      date: new Date().toISOString(),
      voxels,
      tileSize,
      groutGap,
      groutColor,
      floorColor: "#ffffff",
      favoriteColors,
    };
    const updated = [project, ...savedProjects];
    writeProjects(updated);
    set({ savedProjects: updated });
  },

  loadProject: (id) => {
    const project = get().savedProjects.find((entry) => entry.id === id);
    if (!project) return;

    const normalized = normalizeProject(project);
    set({
      voxels: normalized.voxels,
      tileSize: normalized.tileSize,
      groutGap: normalized.groutGap,
      groutColor: normalized.groutColor,
      floorColor: "#ffffff",
      favoriteColors: normalized.favoriteColors,
    });
  },

  deleteProject: (id) => {
    const updated = get().savedProjects.filter((project) => project.id !== id);
    writeProjects(updated);
    set({ savedProjects: updated });
  },

  loadProjectsFromStorage: () => {
    set({ savedProjects: readProjects() });
  },
}));
