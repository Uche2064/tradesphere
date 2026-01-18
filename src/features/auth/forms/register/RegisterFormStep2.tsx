import { Building2, Activity, ChevronLeft } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import AppInput from "@/lib/shared/components/AppInput";

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

interface RegisterFormStep2Props {
  companyName: string;
  setCompanyName: (value: string) => void;
  businessType: string;
  setBusinessType: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  countries: Country[];
  errors: {
    companyName: string;
    businessType: string;
    country: string;
  };
  isLoading: boolean;
  isLoadingCountries: boolean;
  handleStep2Submit: () => void;
  onBack: () => void;
}

export default function RegisterFormStep2({
  companyName,
  setCompanyName,
  businessType,
  setBusinessType,
  country,
  setCountry,
  countries,
  errors,
  isLoading,
  isLoadingCountries,
  handleStep2Submit,
  onBack,
}: RegisterFormStep2Props) {
  return (
    <div className="space-y-4">
      {/* Nom de l'entreprise */}
      <AppInput
        id="companyName"
        label="Nom de l'entreprise"
        placeholder="Mon Entreprise SARL"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        error={errors.companyName}
        leadingIcon={Building2}
        disabled={isLoading}
        required={true}
      />

      {/* Type d'activité */}
      <AppInput
        id="businessType"
        label="Type d'activité"
        placeholder="Ex: Commerce de détail, Services, E-commerce..."
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && country) {
            handleStep2Submit();
          }
        }}
        error={errors.businessType}
        leadingIcon={Activity}
        disabled={isLoading}
        required={true}
      />

      {/* Pays */}
      <div className="space-y-2">
        <label
          htmlFor="country"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Pays <span className="text-red-500">*</span>
        </label>
        <Select
          value={country}
          onValueChange={setCountry}
          disabled={isLoadingCountries || isLoading}
        >
          <SelectTrigger
            className={`w-full py-5 dark:bg-slate-900 dark:text-white dark:border-slate-600 ${
              errors.country ? "border-red-500 dark:border-red-500" : ""
            }`}
          >
            <SelectValue
              placeholder={
                isLoadingCountries
                  ? "Chargement des pays..."
                  : "Sélectionnez votre pays"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {countries.map((c) => (
              <SelectItem key={c.cca2} value={c.name.common}>
                {c.name.common}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 py-5"
          disabled={isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button
          onClick={handleStep2Submit}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-5"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Création...
            </div>
          ) : (
            "Créer mon espace TradeSphere"
          )}
        </Button>
      </div>
    </div>
  );
}
