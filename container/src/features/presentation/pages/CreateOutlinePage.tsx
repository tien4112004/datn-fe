import { AutosizeTextarea } from "@/shared/components/ui/autosize-textarea";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

const CreateOutlinePage = () => {
  return (
    <div className="flex flex-col h-screen items-center self-center justify-center gap-4 p-4">
      <h1 className="text-neutral-900 text-3xl font-bold leading-10">Generate Presentations With AI</h1>
      <h2 className="text-sky-500/80 text-xl font-bold leading-10">Create professional lessons within 5 minutes</h2>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-medium">What's your presentation about (Be specific)?</CardTitle>
        </CardHeader>
        <CardContent>
          <AutosizeTextarea
            className="w-full"
            placeholder="Describe your presentation..."
            minHeight={20}
            maxHeight={200}
            variant="ghost"
          />
          <div className="flex flex-row gap-1 mt-2">
            <Select>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="How many slides?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Numbers of slides</SelectLabel>
                  <SelectItem value="5">5 slides</SelectItem>
                  <SelectItem value="6">6 slides</SelectItem>
                  <SelectItem value="7">7 slides</SelectItem>
                  <SelectItem value="8">8 slides</SelectItem>
                  <SelectItem value="9">9 slides</SelectItem>
                  <SelectItem value="10">10 slides</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select>
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
            <Select>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Which model?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Models</SelectLabel>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>         
        </CardContent>
      </Card>
      <Button>
        Generate Outline
      </Button>
    </div>
  );
};

export default CreateOutlinePage;
