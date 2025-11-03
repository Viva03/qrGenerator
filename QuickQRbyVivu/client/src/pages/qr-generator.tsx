import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, QrCode, RotateCcw, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const qrFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#000000"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffffff"),
  size: z.enum(["200", "300", "400"]).default("300"),
});

type QrFormValues = z.infer<typeof qrFormSchema>;

export default function QrGenerator() {
  const [qrCodePngUrl, setQrCodePngUrl] = useState<string>("");
  const [qrCodeSvgUrl, setQrCodeSvgUrl] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<QrFormValues>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      url: "",
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
      size: "300",
    },
  });

  const generateQrCode = async (values: QrFormValues, format: "png" | "svg") => {
    const formData = new FormData();
    formData.append("url", values.url);
    formData.append("foregroundColor", values.foregroundColor);
    formData.append("backgroundColor", values.backgroundColor);
    formData.append("size", values.size);
    formData.append("format", format);
    
    if (logoFile && format === "png") {
      formData.append("logo", logoFile);
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate QR code");
    }

    return response.json();
  };

  const generateMutation = useMutation({
    mutationFn: async (values: QrFormValues) => {
      const pngResult = await generateQrCode(values, "png");
      
      let svgResult;
      if (!logoFile) {
        svgResult = await generateQrCode(values, "svg");
      }

      return {
        png: pngResult,
        svg: svgResult,
      };
    },
    onSuccess: (data) => {
      setQrCodePngUrl(data.png.qrCodeDataUrl);
      if (data.svg) {
        setQrCodeSvgUrl(data.svg.qrCodeDataUrl);
      } else {
        setQrCodeSvgUrl("");
      }
      toast({
        title: "QR Code Generated",
        description: "Your QR code is ready to download!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: QrFormValues) => {
    generateMutation.mutate(values);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    form.reset();
    setQrCodePngUrl("");
    setQrCodeSvgUrl("");
    setLogoPreview("");
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadQrCode = (format: "png" | "svg") => {
    const dataUrl = format === "png" ? qrCodePngUrl : qrCodeSvgUrl;
    
    if (!dataUrl) {
      toast({
        title: "Not Available",
        description: logoFile 
          ? "SVG download is not available when using a logo. Please download as PNG." 
          : "Please generate a QR code first",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `QR code downloaded as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">QR Code Generator</h1>
          <p className="text-muted-foreground">Create custom QR codes with personalized colors, sizes, and logos</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-lg font-semibold">Customize Your QR Code</CardTitle>
            <CardDescription>Enter a URL and customize the appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com"
                          className="h-12"
                          data-testid="input-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="foregroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-muted-foreground">Foreground</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <input
                                {...field}
                                type="color"
                                className="h-12 w-12 rounded-md cursor-pointer border border-input"
                                data-testid="input-foreground-color"
                              />
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="#000000"
                                className="h-12 flex-1"
                                maxLength={7}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-muted-foreground">Background</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <input
                                {...field}
                                type="color"
                                className="h-12 w-12 rounded-md cursor-pointer border border-input"
                                data-testid="input-background-color"
                              />
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="#ffffff"
                                className="h-12 flex-1"
                                maxLength={7}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium">Size</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-3 gap-3"
                          data-testid="radio-group-size"
                        >
                          <div>
                            <RadioGroupItem value="200" id="size-200" className="peer sr-only" />
                            <Label
                              htmlFor="size-200"
                              className="flex items-center justify-center h-12 rounded-md border border-input bg-background hover-elevate active-elevate-2 cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary-border font-medium text-sm"
                              data-testid="label-size-200"
                            >
                              200×200
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="300" id="size-300" className="peer sr-only" />
                            <Label
                              htmlFor="size-300"
                              className="flex items-center justify-center h-12 rounded-md border border-input bg-background hover-elevate active-elevate-2 cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary-border font-medium text-sm"
                              data-testid="label-size-300"
                            >
                              300×300
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="400" id="size-400" className="peer sr-only" />
                            <Label
                              htmlFor="size-400"
                              className="flex items-center justify-center h-12 rounded-md border border-input bg-background hover-elevate active-elevate-2 cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary-border font-medium text-sm"
                              data-testid="label-size-400"
                            >
                              400×400
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Logo (Optional)</Label>
                  {logoFile && (
                    <p className="text-xs text-muted-foreground">
                      Note: SVG export is not available when using a logo
                    </p>
                  )}
                  <div className="space-y-3">
                    {!logoPreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-input bg-muted/30 hover-elevate cursor-pointer transition-all"
                        data-testid="upload-zone-logo"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">Click or drag to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-4 p-4 rounded-lg border border-input bg-muted/30">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-background border border-border flex-shrink-0">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{logoFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {logoFile && `${(logoFile.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeLogo}
                          className="flex-shrink-0"
                          data-testid="button-remove-logo"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      data-testid="input-file-logo"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-medium"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {qrCodePngUrl && (
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-sm font-medium">Preview & Download</Label>
                <div className="flex items-center justify-center p-8 rounded-lg bg-muted/50">
                  <img
                    src={qrCodePngUrl}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                    data-testid="img-qr-preview"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => downloadQrCode("png")}
                    className="h-12 font-medium"
                    data-testid="button-download-png"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => downloadQrCode("svg")}
                    className="h-12 font-medium"
                    disabled={!qrCodeSvgUrl}
                    data-testid="button-download-svg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download SVG
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="w-full h-12 font-medium"
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}

            {!qrCodePngUrl && !generateMutation.isPending && (
              <div className="flex flex-col items-center justify-center p-12 rounded-lg bg-muted/30 border-2 border-dashed border-border">
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm font-medium text-muted-foreground">Your QR code will appear here</p>
                <p className="text-xs text-muted-foreground mt-1">Enter a URL and click Generate to start</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            QR codes encode your URL directly - they never expire
          </p>
        </div>
      </div>
    </div>
  );
}
