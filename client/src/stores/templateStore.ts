import { create } from 'zustand';
import { premadeTemplates } from '../../../server/data/templates';

interface TemplateStore {
  templates: typeof premadeTemplates;
  isLoading: boolean;
  error: string | null;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: premadeTemplates,
  isLoading: false,
  error: null,
})); 