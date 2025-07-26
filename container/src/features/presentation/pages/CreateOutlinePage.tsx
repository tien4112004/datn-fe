import React from "react";
import { AutosizeTextarea } from "@/shared/components/ui/autosize-textarea";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { toast } from "sonner";

const CreateOutlinePage = () => {
  const EXAMPLE_PROMPTS = [
    "Create a presentation about the life cycle of a butterfly.",
    "Design a presentation explaining basic addition and subtraction.",
    "Outline a presentation on healthy eating habits.",
    "Create a presentation about the importance of kindness and sharing in the classroom.",
    "Design a presentation introducing the water cycle.",
    "Outline a presentation on community helpers and their roles."
  ];

  const [promptInput, setPromptInput] = React.useState("");
  const [slideCount, setSlideCount] = React.useState<string | undefined>(undefined);
  const [style, setStyle] = React.useState<string | undefined>(undefined);
  const [model, setModel] = React.useState<string>("gpt-4o-mini");

  const handleExampleClick = (example: string) => {
    setPromptInput(example);
  };

  const handleSubmit = () => {
    toast("You submitted the following values", {
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
        <h1 className="text-neutral-900 text-3xl font-bold leading-10">Generate Presentations With AI</h1>
        <h2 className="text-sky-500/80 text-xl font-bold leading-10">Create professional lessons within 5 minutes</h2>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-medium">What's your presentation about (Be specific)?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="border-2 border-primary rounded p-2">
              <AutosizeTextarea
                className="w-full"
                placeholder="Describe your presentation..."
                minHeight={36}
                maxHeight={200}
                variant="ghost"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
              />
              <div className="flex flex-row gap-1 my-2">
                <Select value={slideCount} onValueChange={setSlideCount}>
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder="How many slides?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Numbers of slides</SelectLabel>
                      {[5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} slides</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder="Which styles?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Styles</SelectLabel>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder="Which model?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Models</SelectLabel>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {promptInput.trim() === "" && (
              <>
                <CardTitle>Example prompt for you</CardTitle>
                <div className="grid grid-cols-3 gap-2">
                  {EXAMPLE_PROMPTS.map((prompt, idx) => (
                    <Button
                      key={"prompt" + idx}
                      variant="prompt"
                      className="w-full h-auto text-left whitespace-normal px-4 py-2 items-start justify-start"
                      onClick={() => handleExampleClick(prompt)}
                    >
                      <p className="text-sm">{prompt}</p>
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Button onClick={handleSubmit}>
          Generate Outline
        </Button>
      </div>
    </> 
  );
};

export default CreateOutlinePage;
