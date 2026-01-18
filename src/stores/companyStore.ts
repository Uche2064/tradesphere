import { create } from "zustand";
import { ICompanyState, ICompanyActions, ICompany } from "@/types";
import axios from "axios";
import { useAuthStore } from "./authStore";

type CompanyStore = ICompanyState & ICompanyActions;

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  // État initial
  currentCompany: null,
  companies: [],
  isLoading: false,
  error: null,

  // Actions
  setCurrentCompany: (company: ICompany) => {
    set({ currentCompany: company });
  },

  fetchCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await axios.get("/api/companies", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      set({
        companies: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la récupération des entreprises",
        isLoading: false,
      });
      throw error;
    }
  },

  createCompany: async (data: Partial<ICompany>) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await axios.post("/api/companies", data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const newCompany = response.data.data;

      set((state) => ({
        companies: [...state.companies, newCompany],
        isLoading: false,
      }));

      return newCompany;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la création de l'entreprise",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCompany: async (id: string, data: Partial<ICompany>) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await axios.put(`/api/companies/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const updatedCompany = response.data.data;

      set((state) => ({
        companies: state.companies.map((c) => (c.id === id ? updatedCompany : c)),
        currentCompany: state.currentCompany?.id === id ? updatedCompany : state.currentCompany,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la mise à jour de l'entreprise",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCompany: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = useAuthStore.getState();
      await axios.delete(`/api/companies/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
        currentCompany: state.currentCompany?.id === id ? null : state.currentCompany,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Erreur lors de la suppression de l'entreprise",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
