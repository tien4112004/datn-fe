import React from "react";
import { AutosizeTextarea } from "@/shared/components/ui/autosize-textarea";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

const CreateOutlinePage = () => {
  const { t } = useTranslation("presentation", { keyPrefix: "createOutline" });
  const [promptInput, setPromptInput] = React.useState("");
  const [slideCount, setSlideCount] = React.useState<string | undefined>("10");
  const [style, setStyle] = React.useState<string | undefined>(undefined);
  const [model, setModel] = React.useState<string>("gpt-4o-mini");
  
  const examplePrompts = [
    t("examplePrompt1"),
    t("examplePrompt2"),
    t("examplePrompt3"),
    t("examplePrompt4"),
    t("examplePrompt5"),
    t("examplePrompt6"),
  ];

  const handleExampleClick = (example: string) => {
    setPromptInput(example);
  };

  const handleSubmit = () => {
    // TODO: Implement the actual API call to generate the outline
    toast("Data:", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify({
            prompt: promptInput,
            slideCount,
            style,
            model,
          }, null, 2)}</code>
        </pre>
      ),
    })
  };

  return (
    <>
      <SidebarTrigger className="absolute top-4 left-4 z-50" />
      <div className="flex flex-col h-[calc(100vh-1rem)] lg:w-4xl sm:w-full items-center self-center justify-center gap-4">
        <h1 className="text-neutral-900 text-3xl font-bold leading-10">{t("title")}</h1>
        <h2 className="text-sky-500/80 text-xl font-bold leading-10">{t("subtitle")}</h2>
        <Card className="w-full">
          <CardContent>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-medium">{t("promptTitle")}</CardTitle>
              <div className="border-2 border-primary rounded px-2 pt-2">
                <AutosizeTextarea
                  className="w-full"
                  placeholder={t("promptPlaceholder")}
                  minHeight={36}
                  maxHeight={200}
                  variant="ghost"
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                />
                <div className="flex flex-row gap-1 my-2">
                  <Select value={slideCount} onValueChange={setSlideCount}>
                    <SelectTrigger className="w-fit">
                      <SelectValue placeholder={t("slideCountPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("slideCountLabel")}</SelectLabel>
                        {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 36].map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num} {t("slideCountUnit")}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="w-fit">
                      <SelectValue placeholder={t("stylePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("styleLabel")}</SelectLabel>
                        <SelectItem value="business">{t("styleBusiness")}</SelectItem>
                        <SelectItem value="education">{t("styleEducation")}</SelectItem>
                        <SelectItem value="creative">{t("styleCreative")}</SelectItem>
                        <SelectItem value="minimal">{t("styleMinimal")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-fit">
                      <SelectValue placeholder={t("modelPlaceholder")}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("modelLabel")}</SelectLabel>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {promptInput.trim() === "" && (
                <motion.div
                  key="examplePrompts"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
                  style={{ overflow: "hidden" }}
                >
                  <CardTitle className="mt-4">{t("examplePromptTitle")}</CardTitle>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {examplePrompts.map((prompt, idx) => (
                      <Button
                        key={"prompt" + idx}
                        variant="prompt"
                        className="w-full h-auto text-left whitespace-normal px-4 py-2"
                        onClick={() => handleExampleClick(prompt)}
                      >
                        <p className="text-sm">{prompt}</p>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <Button onClick={handleSubmit}>
          {t("generateOutline")}
        </Button>
      </div>
    </> 
  );
};

export default CreateOutlinePage;
