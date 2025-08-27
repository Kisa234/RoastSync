export interface Nota {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  parentId?: string | null;
  updatedAt?: string | null;
}

export interface CreateNota {
  name: string;
  color: string;
  parentId?: string | null;
}

export interface UpdateNota {
  name?: string;
  color?: string;
  parentId?: string | null;
}

export interface FlatNota {
  id: string;
  name: string;
  color: string;
  parentId?: string | null;
  depth: number;
  hasChildren: boolean;
}
