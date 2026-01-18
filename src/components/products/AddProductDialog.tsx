"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { Button } from "@/lib/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import AppInput from "@/lib/shared/components/AppInput";
import { Package } from "lucide-react";

interface Store {
  id: string;
  name: string;
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form fields
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [storeId, setStoreId] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("0");
  const [minQuantity, setMinQuantity] = useState("0");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Fetch stores when dialog opens
  useEffect(() => {
    if (open) {
      fetchStores();
    }
  }, [open]);

  const fetchStores = async () => {
    try {
      const response = await apiClient.get("/api/stores?limit=100");
      if (response.data.success) {
        setStores(response.data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des magasins:", error);
    }
  };

  const resetForm = () => {
    setSku("");
    setName("");
    setDescription("");
    setImage("");
    setPurchasePrice("");
    setSellingPrice("");
    setTaxRate("0");
    setStoreId("");
    setInitialQuantity("0");
    setMinQuantity("0");
    setMaxQuantity("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sku.trim()) {
      newErrors.sku = "Le SKU est requis";
    }
    if (!name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      newErrors.purchasePrice = "Le prix d'achat doit être supérieur à 0";
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      newErrors.sellingPrice = "Le prix de vente doit être supérieur à 0";
    }
    if (taxRate && (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100)) {
      newErrors.taxRate = "Le taux de taxe doit être entre 0 et 100";
    }
    if (!storeId) {
      newErrors.storeId = "Le magasin est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        sku: sku.trim(),
        name: name.trim(),
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        taxRate: taxRate ? parseFloat(taxRate) : 0,
        storeId,
        initialQuantity: parseInt(initialQuantity) || 0,
        minQuantity: parseInt(minQuantity) || 0,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (image.trim()) {
        payload.image = image.trim();
      }
      if (maxQuantity && parseInt(maxQuantity) > 0) {
        payload.maxQuantity = parseInt(maxQuantity);
      }

      const response = await apiClient.post("/api/products", payload);

      if (response.data.success) {
        resetForm();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      const errorMessage =
        error.response?.data?.error || "Erreur lors de la création du produit";
      
      // Set general error or specific field errors
      if (errorMessage.includes("SKU")) {
        setErrors({ sku: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nouveau produit
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau produit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              id="sku"
              label="SKU"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="PROD-001"
              error={errors.sku}
            />

            <AppInput
              id="name"
              label="Nom du produit"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du produit"
              error={errors.name}
            />
          </div>

          <AppInput
            id="description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du produit (optionnel)"
          />

          <AppInput
            id="image"
            label="URL de l'image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg (optionnel)"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppInput
              id="purchasePrice"
              label="Prix d'achat (FCFA)"
              required
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              error={errors.purchasePrice}
            />

            <AppInput
              id="sellingPrice"
              label="Prix de vente (FCFA)"
              required
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              error={errors.sellingPrice}
            />

            <AppInput
              id="taxRate"
              label="Taux de taxe (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
              error={errors.taxRate}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Magasin <span className="text-red-500">*</span>
            </label>
            <Select value={storeId} onValueChange={setStoreId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un magasin" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.storeId && (
              <p className="text-sm text-red-500">{errors.storeId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppInput
              id="initialQuantity"
              label="Quantité initiale"
              type="number"
              value={initialQuantity}
              onChange={(e) => setInitialQuantity(e.target.value)}
              placeholder="0"
            />

            <AppInput
              id="minQuantity"
              label="Quantité minimale"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="0"
            />

            <AppInput
              id="maxQuantity"
              label="Quantité maximale"
              type="number"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              placeholder="Optionnel"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
