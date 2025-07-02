## Core Principles of AIPPT

1. Define the PPT structure (what types of slides are in a set of PPTs, and what content each type contains).
2. Based on this structure, define a data format. This data will be used by the AI to generate structured PPT data. See:
   - Example data: `public/mocks/AIPPT.json`
   - Structure definition: `src/types/AIPPT.ts`
3. Create a template, marking the structure types within it.
4. Have the AI generate PPT data that conforms to the structure defined in step 1.
5. Use AI or other methods to generate corresponding images (common approaches include AI text-to-image or searching stock libraries).
6. Combine the AI-generated data and images with the template to produce the final PPT.

> Note: Although the current live version does not demonstrate image insertion, the AIPPT method supports it—you just need to supply your own image sources and pass them to AIPPT in the required format.

## AIPPT Template-Creation Workflow

1. Open PPTist.
2. Design your template slides.
3. Open the upper-left menu’s **Slide Type Annotation** feature.
4. For each slide, tag its slide type and node types.
5. Use the export function to save as a JSON file.

> Note: There is no separate “AIPPT template” format—an AIPPT template is simply a regular PPTist slide deck with type annotations. You can use these annotated files both for AI-driven PPT generation and as standard slide templates.

## Template Annotation Types: Slide Tags and Node Tags

#### Cover Slide

- Title
- Body text
- Images (background or illustrations)

#### Table of Contents Slide

- TOC title (tag type: list item)
- Images (background or illustrations)

#### Section-Break Slide (Chapter Transition)

- Title
- Body text
- Section number
- Images (background or illustrations)

#### Content Slide

- Title
- 2–4 content items, each including:
  - Item title (tag type: list-item title)
  - Item body text (tag type: list item)
  - Item number (tag type: list-item number)
- Images (background, slide illustrations, or item illustrations)

#### Closing Slide (Thank-You Slide)

- Images (background or illustrations)

> **Node tags** come in two kinds: text tags and image tags.
>
> - Text tags apply to text nodes or shape nodes containing text.
> - Image tags apply only to image nodes.
> - You can add more tag types as needed (e.g., charts).

## AIPPT Template-Creation Guidelines

An AIPPT template should include at least the following 12 slides total:

- 1 Cover Slide
- 6 TOC Slides (one each for 2–6 TOC items, plus one with 10 TOC items)
- 1 Section-Break Slide
- 3 Content Slides (one each with 2, 3, and 4 items)
- 1 Closing Slide

> **Notes:**
>
> 1. These counts satisfy only the minimum replacement logic. To introduce random variation in the AI-generated PPT, add multiple versions of each slide type (e.g., if you have 3 different cover slides, the generator will pick one at random).
> 2. By default, TOC slides support 1–20 items and content slides support 1–12 items; you don’t need a separate template for every possible count because the system can splice and trim slides to match the required number.
> 3. You can adjust the replacement logic to support additional scenarios.
