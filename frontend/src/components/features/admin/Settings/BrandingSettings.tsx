"use client";

import { useState } from "react";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PhotoIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import type {
  BrandingSettings,
  LocalizationSettings,
} from "@/types/admin";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 p-1"
        />
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default function BrandingSettings() {
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [cssEditor, setCssEditor] = useState(false);

  const { data: branding, loading: brandingLoading, refresh: refreshBranding } =
    useCache<BrandingSettings>({
      key: "branding_settings",
      fetchData: async () => {
        const response = await fetch("/api/admin/settings/branding");
        return response.json();
      },
    });

  const {
    data: localization,
    loading: localizationLoading,
    refresh: refreshLocalization,
  } = useCache<LocalizationSettings>({
    key: "localization_settings",
    fetchData: async () => {
      const response = await fetch("/api/admin/settings/localization");
      return response.json();
    },
  });

  const handleBrandingSubmit = async (data: Partial<BrandingSettings>) => {
    try {
      const response = await fetch("/api/admin/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        refreshBranding();
      }
    } catch (error) {
      console.error("Failed to update branding:", error);
    }
  };

  const handleLocalizationSubmit = async (
    data: Partial<LocalizationSettings>
  ) => {
    try {
      const response = await fetch("/api/admin/settings/localization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        refreshLocalization();
      }
    } catch (error) {
      console.error("Failed to update localization:", error);
    }
  };

  const handleLogoUpload = async (
    file: File,
    type: "light" | "dark"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch("/api/admin/settings/branding/logo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        refreshBranding();
      }
    } catch (error) {
      console.error("Failed to upload logo:", error);
    }
  };

  if (brandingLoading || localizationLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Personnalisation</h2>
          <p className="text-sm text-gray-500">
            Personnalisez l'apparence et la localisation de votre application
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="branding" className="space-y-4">
            <TabsList>
              <TabsTrigger value="branding">
                <PaintBrushIcon className="h-5 w-5 mr-2" />
                Apparence
              </TabsTrigger>
              <TabsTrigger value="assets">
                <PhotoIcon className="h-5 w-5 mr-2" />
                Ressources
              </TabsTrigger>
              <TabsTrigger value="css">
                <CodeBracketIcon className="h-5 w-5 mr-2" />
                CSS Personnalisé
              </TabsTrigger>
              <TabsTrigger value="localization">
                <LanguageIcon className="h-5 w-5 mr-2" />
                Localisation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="branding" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Couleur Primaire"
                  color={branding?.colors.primary || "#000000"}
                  onChange={(color) =>
                    handleBrandingSubmit({
                      colors: { ...branding?.colors, primary: color },
                    })
                  }
                />

                <ColorPicker
                  label="Couleur Secondaire"
                  color={branding?.colors.secondary || "#000000"}
                  onChange={(color) =>
                    handleBrandingSubmit({
                      colors: { ...branding?.colors, secondary: color },
                    })
                  }
                />

                <ColorPicker
                  label="Couleur d'Accent"
                  color={branding?.colors.accent || "#000000"}
                  onChange={(color) =>
                    handleBrandingSubmit({
                      colors: { ...branding?.colors, accent: color },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Police des Titres</Label>
                <select
                  className="w-full border rounded-md"
                  value={branding?.fonts.heading}
                  onChange={(e) =>
                    handleBrandingSubmit({
                      fonts: { ...branding?.fonts, heading: e.target.value },
                    })
                  }
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>

                <Label>Police du Corps</Label>
                <select
                  className="w-full border rounded-md"
                  value={branding?.fonts.body}
                  onChange={(e) =>
                    handleBrandingSubmit({
                      fonts: { ...branding?.fonts, body: e.target.value },
                    })
                  }
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mode d'Affichage</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={previewMode === "light" ? "default" : "outline"}
                      onClick={() => setPreviewMode("light")}
                      size="sm"
                    >
                      Clair
                    </Button>
                    <Button
                      variant={previewMode === "dark" ? "default" : "outline"}
                      onClick={() => setPreviewMode("dark")}
                      size="sm"
                    >
                      Sombre
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Logo (Mode Clair)</Label>
                    <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                      {branding?.logo.light ? (
                        <div className="relative">
                          <img
                            src={branding.logo.light}
                            alt="Logo (clair)"
                            className="max-w-full h-auto"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              handleBrandingSubmit({
                                logo: { ...branding.logo, light: "" },
                              })
                            }
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file, "light");
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Logo (Mode Sombre)</Label>
                    <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                      {branding?.logo.dark ? (
                        <div className="relative">
                          <img
                            src={branding.logo.dark}
                            alt="Logo (sombre)"
                            className="max-w-full h-auto"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              handleBrandingSubmit({
                                logo: { ...branding.logo, dark: "" },
                              })
                            }
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file, "dark");
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                    {branding?.favicon ? (
                      <div className="relative">
                        <img
                          src={branding.favicon}
                          alt="Favicon"
                          className="max-w-full h-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            handleBrandingSubmit({ favicon: "" })
                          }
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept="image/x-icon,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append("file", file);
                                fetch("/api/admin/settings/branding/favicon", {
                                  method: "POST",
                                  body: formData,
                                }).then(() => refreshBranding());
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>CSS Personnalisé</Label>
                  <p className="text-sm text-gray-500">
                    Ajoutez du CSS personnalisé pour modifier l'apparence de
                    l'application
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCssEditor(!cssEditor)}
                >
                  {cssEditor ? "Aperçu" : "Éditer"}
                </Button>
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-64 font-mono text-sm p-4 border rounded-md"
                  value={branding?.customCss || ""}
                  onChange={(e) =>
                    handleBrandingSubmit({ customCss: e.target.value })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="localization" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Langue par Défaut</Label>
                  <select
                    className="w-full mt-1 border rounded-md"
                    value={localization?.defaultLanguage}
                    onChange={(e) =>
                      handleLocalizationSubmit({
                        defaultLanguage: e.target.value,
                      })
                    }
                  >
                    {localization?.availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Format de Date</Label>
                  <Input
                    value={localization?.dateFormat}
                    onChange={(e) =>
                      handleLocalizationSubmit({ dateFormat: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <Label>Format d'Heure</Label>
                  <Input
                    value={localization?.timeFormat}
                    onChange={(e) =>
                      handleLocalizationSubmit({ timeFormat: e.target.value })
                    }
                    placeholder="HH:mm"
                  />
                </div>

                <div>
                  <Label>Fuseau Horaire</Label>
                  <select
                    className="w-full mt-1 border rounded-md"
                    value={localization?.timezone}
                    onChange={(e) =>
                      handleLocalizationSubmit({ timezone: e.target.value })
                    }
                  >
                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Traductions</Label>
                  <div className="mt-2 space-y-4">
                    {Object.entries(localization?.translations || {}).map(
                      ([lang, translations]) => (
                        <Card key={lang}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium">{lang}</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newTranslations = { ...localization?.translations };
                                  delete newTranslations[lang];
                                  handleLocalizationSubmit({
                                    translations: newTranslations,
                                  });
                                }}
                              >
                                Supprimer
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(translations).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <Input
                                    value={key}
                                    disabled
                                    className="flex-1"
                                  />
                                  <Input
                                    value={value}
                                    onChange={(e) => {
                                      const newTranslations = {
                                        ...localization?.translations,
                                        [lang]: {
                                          ...translations,
                                          [key]: e.target.value,
                                        },
                                      };
                                      handleLocalizationSubmit({
                                        translations: newTranslations,
                                      });
                                    }}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
