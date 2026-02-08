"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Globe, Search } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency-context";
import { COUNTRIES, formatCurrency, getCountryByCode } from "@/lib/currency";

interface TierConfig {
  id: string;
  tier: string;
  minReferrals: number;
  minRevenue: number;
  bonusRate: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tierConfigs, setTierConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const { refresh } = useCurrency();

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(data => {
      setSettings(data.settings || {});
      setTierConfigs(data.tierConfigs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings, tierConfigs }) });
      if (!res.ok) throw new Error();
      await refresh();
      toast.success("Settings saved successfully");
    } catch { toast.error("Failed to save settings"); } finally { setSaving(false); }
  };

  const updateTier = (index: number, field: string, value: number) => {
    setTierConfigs(prev => { const updated = [...prev]; updated[index] = { ...updated[index], [field]: value }; return updated; });
  };

  const selectedCountry = getCountryByCode(settings.country || "US");
  const currencySymbol = selectedCountry.symbol;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  if (loading) return <div className="space-y-6"><h1 className="text-3xl font-bold">Settings</h1><div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Country & Currency</CardTitle>
          <CardDescription>Select your country to set the currency used across the portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <div className="relative">
              <div
                className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                  <span className="text-muted-foreground">({selectedCountry.currency} {selectedCountry.symbol})</span>
                </span>
                <svg className={`h-4 w-4 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>

              {countryDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                  <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredCountries.map(country => (
                      <div
                        key={country.code}
                        className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm cursor-pointer hover:bg-accent ${settings.country === country.code ? "bg-accent" : ""}`}
                        onClick={() => {
                          setSettings(p => ({ ...p, country: country.code }));
                          setCountryDropdownOpen(false);
                          setCountrySearch("");
                        }}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="flex-1">{country.name}</span>
                        <span className="text-muted-foreground text-xs">{country.currency} {country.symbol}</span>
                      </div>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Currency Preview</p>
            <p className="text-lg font-semibold">{formatCurrency(100000, settings.country || "US")}</p>
            <p className="text-xs text-muted-foreground mt-1">All monetary values across the portal will display in <strong>{selectedCountry.currency}</strong></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Configure your Digitory portal settings</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Company Name</Label><Input value={settings.companyName || ""} onChange={e => setSettings(p => ({ ...p, companyName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Company Email</Label><Input type="email" value={settings.companyEmail || ""} onChange={e => setSettings(p => ({ ...p, companyEmail: e.target.value }))} /></div>
          </div>
          <div className="space-y-2">
            <Label>Default Commission Rate (%)</Label>
            <Input type="number" min={0} max={100} value={settings.defaultCommissionRate || "10"} onChange={e => setSettings(p => ({ ...p, defaultCommissionRate: e.target.value }))} />
            <p className="text-xs text-muted-foreground">Applied to new resellers by default</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tier Configuration</CardTitle><CardDescription>Configure reseller tier thresholds and bonus rates</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tierConfigs.map((config, index) => (
              <div key={config.tier} className="grid grid-cols-4 gap-4 items-end rounded-lg border p-4">
                <div><Label className="text-xs text-muted-foreground">Tier</Label><p className="font-semibold">{config.tier}</p></div>
                <div className="space-y-1"><Label className="text-xs">Min Referrals</Label><Input type="number" min={0} value={config.minReferrals} onChange={e => updateTier(index, "minReferrals", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label className="text-xs">Min Revenue ({currencySymbol})</Label><Input type="number" min={0} value={config.minRevenue} onChange={e => updateTier(index, "minRevenue", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label className="text-xs">Bonus Rate (%)</Label><Input type="number" min={0} max={100} value={config.bonusRate} onChange={e => updateTier(index, "bonusRate", Number(e.target.value))} /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
