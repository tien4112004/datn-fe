<p align="center">
    <img src='/public/icons/android-chrome-192x192.png' />
</p>

<p align="center">
    <a href="https://www.github.com/pipipi-pikachu/PPTist/stargazers" target="_black"><img src="https://img.shields.io/github/stars/pipipi-pikachu/PPTist?logo=github" alt="stars" /></a>
    <a href="https://www.github.com/pipipi-pikachu/PPTist/network/members" target="_black"><img src="https://img.shields.io/github/forks/pipipi-pikachu/PPTist?logo=github" alt="forks" /></a>
    <a href="https://www.github.com/pipipi-pikachu/PPTist/blob/master/LICENSE" target="_black"><img src="https://img.shields.io/github/license/pipipi-pikachu/PPTist?color=%232DCE89&logo=github" alt="license" /></a>
    <a href="https://www.typescriptlang.org" target="_black"><img src="https://img.shields.io/badge/language-TypeScript-blue.svg" alt="language"></a>
    <a href="https://github.com/pipipi-pikachu/PPTist/issues" target="_black"><img src="https://img.shields.io/github/issues-closed/pipipi-pikachu/PPTist.svg" alt="issue"></a>
</p>

[Simplified Chinese](README_zh.md) | English

# 🎨 PPTist

> PowerPoint-ist（/'pauəpɔintist/）, A web-based presentation (slideshow) application. This application replicates most of the commonly used features of Microsoft Office PowerPoint. It supports various essential element types such as text, images, shapes, lines, charts, tables, videos, audio, and formulas. You can edit and present slides directly in a web browser.

<b>Try it online👉：[https://pipipi-pikachu.github.io/PPTist/](https://pipipi-pikachu.github.io/PPTist/)</b>

# ✨ Highlights

1. <b>Easy Development</b>: Built with Vue 3.x and TypeScript, it does not rely on UI component libraries and avoids third-party components as much as possible. This makes styling customization easier and functionality extension more convenient.
2. <b>User Friendly</b>: It offers a context menu available everywhere, dozens of keyboard shortcuts, and countless editing detail optimizations, striving to replicate a desktop application-level experience.
3. <b>Feature Rich</b>: Supports most of the commonly used elements and functionalities found in PowerPoint, supports generate PPT by AI, supports exporting in various formats, and offers basic editing and previewing on mobile devices.

# 👀 Front-Row Reminder

1. This project is a "Web Slideshow Application", not a "low-code platform", "H5 editor", "image editor", "whiteboard application", or similar tools.
2. The target audience for this project is <b>developers with needs for [Web slideshow] development, basic web development experience is required</b>. The provided link is merely a demo address and does not offer any online services. You should not use this project directly as a tool, nor does it support out-of-the-box functionality. If you simply need a service or tool, you can opt for more excellent and mature products such as: [Slidev](https://sli.dev/)、[revealjs](https://revealjs.com/), etc.
3. Here are some summarized [Frequently Asked Questions](/doc/Q&A.md). When raising Issues or submitting PRs for the first time, be sure to read this document in advance.

# 🚀 Installation

```
npm install

npm run dev
```

Browser access: http://127.0.0.1:5173/

# 📚 Features

### Basic Features

- History (undo, redo)
- Shortcuts
- Right-click menu
- Export local files (PPTX, JSON, images, PDF)
- Import and export pptist files
- Print
- AI PPT

### Slide Page Editing

- Add/delete pages
- Copy/paste pages
- Adjust page order
- Create sections
- Background settings (solid color, gradient, image)
- Set canvas size
- Gridlines
- Rulers
- Canvas zoom and move
- Theme settings
- Extract slides style
- Speaker notes (rich text)
- Slide templates
- Transition animations
- Element animations (entrance, exit, emphasis)
- Selection panel (hide elements, layer sorting, element naming)
- Labels for Page and Node Types (usable for template-related features)
- Find/replace
- Annotations

### Slide Element Editing

- Add/delete elements
- Copy/paste elements
- Drag and move elements
- Rotate elements
- Scale elements
- Multiple element selection (marquee, point selection)
- Group multiple elements
- Batch edit multiple elements
- Lock elements
- Magnetic alignment of elements (move and scale)
- Adjust element layer
- Align elements to canvas
- Align elements to other elements
- Evenly distribute multiple elements
- Drag to add text and images
- Paste external images
- Set element coordinates, size, and rotation
- Element hyperlinks (link to webpage, link to other slide pages)

#### Text

- Rich text editing (color, highlight, font, font size, bold, italic, underline, strikethrough, subscript, inline code, quote, hyperlink, alignment, numbering, bullet points, paragraph indent, clear formatting)
- Line height
- Character spacing
- Paragraph spacing
- First line indent
- Fill color
- Border
- Shadow
- Transparency
- Vertical text

#### Images

- Crop (custom, shape, aspect ratio)
- Rounding
- Filters
- Tint (mask)
- Flip
- Border
- Shadow
- Replace image
- Reset image
- Set as background

#### Shapes

- Draw any polygon
- Draw any line (unclosed shape simulation)
- Replace shape
- Fill (solid color, gradient, image)
- Border
- Shadow
- Transparency
- Flip
- Shape format painter
- Edit text (supports rich text, similar to text element’s rich text editing)

#### Lines

- Straight lines, polylines, curves
- Color
- Width
- Style (solid, dashed, dotted)
- Endpoint style

#### Charts (bar, column, line, area, scatter, pie, donut, radar)

- Chart type conversion
- Data editing
- Background fill
- Theme color
- Coordinate system and axis text color
- Other chart settings
- Border

#### Tables

- Add/delete rows and columns
- Theme settings (theme color, header, total row, first column, last column)
- Merge cells
- Cell styles (fill color, text color, bold, italic, underline, strikethrough, alignment)
- Border

#### Video

- Preview cover settings
- Auto play

#### Audio

- Icon color
- Auto play
- Loop play

#### Formulas

- LaTeX editing
- Color settings
- Formula line thickness settings

### Slide Show

- Brush tools (pen/shape/arrow/highlighter annotation, eraser, blackboard mode)
- Preview all slides
- Bottom thumbnails navigation
- Timer tool
- Laser pointer
- Auto play
- Speaker view

### Mobile

- Basic editing
  - Add/delete/copy/note/undo redo pages
  - Insert text, images, rectangles, circles
  - General element operations: move, scale, rotate, copy, delete, layer adjust, align
  - Element styles: text (bold, italic, underline, strikethrough, font size, color, alignment), fill color
- Basic preview
- Play preview

# 👀 FAQ

Some common problems: [FAQ](/doc/Q&A.md)

# 🎯 Supplement

There is currently no complete development documentation, but the following documents may be of some help to you:

- [Project Directory and Data Structure](/doc/DirectoryAndData.md)
- [Fundamentals of Canvas and Elements](/doc/Canvas.md)
- [How to Customize an Element](/doc/CustomElement.md)
- [About AIPPT](/doc/AIPPT.md)

Here are some auxiliary development tools/repositories:

- Import PPTX file reference: [pptxtojson](https://github.com/pipipi-pikachu/pptxtojson)
- Draw shape: [svgPathCreator](https://github.com/pipipi-pikachu/svgPathCreator)

# 📄 License

[AGPL-3.0 License](https://github.com/pipipi-pikachu/PPTist/blob/master/LICENSE) | Copyright © 2020-PRESENT [pipipi-pikachu](https://github.com/pipipi-pikachu)

# 🧮 Commercial

If you wish to use this project for commercial gain, I hope you will respect open source and strictly adhere to the AGPL-3.0 license, giving back to the open source community. Or contact the author for an independent commercial license.

# 🧮 Commercial Use

- This project prohibits closed-source commercial use. If you wish to use PPTist for commercial projects and profit, please respect open source and **strictly follow the [AGPL-3.0 Agreement](https://www.gnu.org/licenses/agpl-3.0.html)**, giving back to the open source community；
- If you, for any reason, must close the source for commercial use and cannot execute the AGPL-3.0 agreement, you can choose:
  1. Use the early Apache 2.0 agreement version [（The last update of this version was in May 2022, and it has been stopped maintaining. Click here to download the code）](https://github.com/pipipi-pikachu/PPTist/archive/f1a35bb8e045124e37dcafd6acbf40b4531b69aa.zip)；
  2. Become an important contributor to the project (violating the agreement first and then becoming a contributor is not included in this scope), including:
     - Your code is referenced as a dependency by this project, including: npm installation, script/style and other file references, code snippet references (the reference will be noted)；
     - You have submitted important PRs to this project that have been merged (subject to the author's subjective judgment)；
     - You have long participated in the maintenance/promotion of this project, such as providing effective peripheral tools for this project, making a large number of templates, etc. (subject to the author's subjective judgment)；
  3. [Email the author](mailto:pipipi_pikachu@163.com) to pay for an independent commercial license. Independent authorization prices:
     - 1999 yuan for one year
     - 2999 yuan for three years
     - 5499 yuan permanently
- It is recommended to prioritize the implementation of the AGPL-3.0 agreement. If you want to pay for an independent commercial license, please note:
  - Independent commercial authorization means: authorizing you to use the code for commercial purposes separately without having to perform the AGPL-3.0 agreement；
  - Only authorization (not sale of software or services), there is no other "advanced version/paid version", no online services are provided, no technical support or technical consulting is provided, no custom development is provided, no more templates are provided, let alone deliverable products；
  - The software cannot be used out of the box. At the very least, it is necessary to access the back-end data reading/storage capabilities. Therefore, using this project requires the most basic web development experience (understanding what front-end & back-end are, where data comes from & how to store it, what interfaces are, what cross-domain issues are, etc.)；
  - After authorization, it is still prohibited to resell, authorize, open source, or maliciously spread the source code；
  - After authorization, AIPPT-related background logic and current template data can be provided for reference if needed (but they are very simple, without any core logic, and it is more recommended to implement them by yourself)；
  - Be sure to do your research in advance to determine whether PPTist meets your needs, both in terms of functionality (whether it meets business requirements) and development (whether you accept the current tech stack/implementation plan)；
  - The author is an asynchronous communication practitioner, **does not add WeChat/QQ/mobile phone number, etc.**, any authorization-related questions please contact by email, and for 需求/报 bug/询问技术方案等请在 [Issues](https://github.com/pipipi-pikachu/PPTist/issues) 中进行，谢谢理解。

---

# 🔔 Other Instructions

## What is the AGPL-3.0 Agreement

The core requirements of the agreement are explained in simple language as follows:

- **Open Source Obligation**: If you use AGPL code, regardless of how you or your downstream users use/modify it, you must publicly disclose all of your final code (not just the modified parts, and not just rewriting it in a different framework to disconnect it from the original code), and continue to open source it under the AGPL agreement, maintaining the infectious nature of open source.
- **Network services must also be open source**: Even if you only use AGPL code to create a website or web service, when others use your service over the network, you must also comply with the above-mentioned **Open Source Obligation**.
- **Retain copyright notice**: You cannot remove the original author information and license notice from the code, you must inform others where the code came from.
- **No additional restrictions**: You cannot add restrictions on AGPL code, such as prohibiting others from redistributing it, or requiring others to pay to use the code.
- **Disclaimer**: The author does not guarantee that the code is bug-free, nor is he responsible for the consequences of its use.

For detailed agreement content, see the official document: [AGPL-3.0 Agreement](https://www.gnu.org/licenses/agpl-3.0.html)
