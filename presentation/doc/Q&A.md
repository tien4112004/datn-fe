## Frequently Asked Questions

#### Q. Why doesn’t the xxx shortcut work?

A. Some shortcuts only take effect when the focus is in a specific area. For example, you must have focus on the left thumbnail list to use page-operation shortcuts, and focus on the canvas to use element-operation shortcuts.

#### Q. Why can’t I paste?

A. Make sure your browser is allowed to access the system clipboard.

#### Q. Why are my slides gone after refreshing or reopening the browser?

A. The demo links provided by this repository are for demonstration only. This is a pure front-end deployment with no back end, so it doesn’t persist any data.

#### Q. How do I reorder slides?

A. Drag and drop the thumbnails on the left to change their order.

#### Q. Why does the app freeze or lag after inserting an image?

A. In this demo there’s no back end, so locally inserted images are embedded as Base64, which can make the data extremely large. In a real production environment you’d upload images to a server and reference their URLs to avoid this issue.

#### Q. Why doesn’t applying a preset theme affect existing slides or elements?

A. Applying a preset theme only affects new elements and pages you add. It doesn’t retroactively change what’s already there. To apply the current theme to all existing slides, use the “Apply Theme to All” feature.

#### Q. Why doesn’t setting an online font take effect immediately?

A. When you choose an online font, the font file must be downloaded first. If the file is large, it can take some time before the new font is applied.

#### Q. What about importing and exporting PPTX files?

A. Importing and exporting PPTX is crucial but far more complex than anticipated. With limited time and resources, we rely on third-party libraries:

- **Export:** Uses [PptxGenJS](https://github.com/gitbrent/PptxGenJS/) to handle most basic elements, but it has limitations. Animations and other features PptxGenJS can’t support won’t work here either. The goal is to export elements with as close a style match as possible, not to perfectly recreate the web page in PPT—some discrepancies are inevitable.
- **Import:** There’s currently no robust solution for importing PPTX. It’s under investigation. If you’ve tackled this before, feel free to discuss it in our issues.

> _Note:_ I’ve experimented with a [pptx-to-JSON converter](https://github.com/pipipi-pikachu/pptx2json). You can use that as a starting point if you urgently need import functionality.

This project isn’t an Office-style PPT editor. Importing/exporting PPT files is just one feature—not the primary purpose.

#### Q. Which video formats are supported?

A. We provide basic video playback via the HTML5 `<video>` tag, so any format it supports will play. To handle HLS (.m3u8) or FLV (.flv), you can include [hls.js](https://github.com/video-dev/hls.js) or [flv.js](https://github.com/Bilibili/flv.js) via CDN—no extra configuration needed.

#### Q. What about importing JSON files?

A. For security reasons, exposing raw JSON import to end users is not recommended. If you must, implement the feature on the server with proper validation. Front-end only if you really know what you’re doing.

#### Q. Why do print/exported PDF styles differ from what I see on screen?

A. Check your browser’s print dialog settings: set margins to “Default,” uncheck “Headers and footers,” and check “Background graphics.” For production, generating PDFs on the back end (e.g., with Puppeteer) yields much more consistent results.

#### Q. Why doesn’t the mobile version support xxx feature?

A. Mobile will always be a pared-down experience compared to PC. The mobile view is intended for quick, on-the-go edits only. Full slide creation and design should be done on a desktop. If you need extra mobile features, try opening in desktop mode—or fork the code and add what you need.

#### Q. What about browser compatibility?

A. We prioritize Chrome and Firefox. Safari may have some issues. Internet Explorer is not supported.

#### Q. Why isn’t this released as an NPM package?

A. Unlike a standalone library, PPTist is a complete application that you’re expected to fork and customize (back-end integration, templates, new element types, themes, shortcuts, etc.). Packaging it as an NPM module wouldn’t make sense, since you’d still need to pull the full source and tailor it. If you want a plugin-style tool, consider projects like [draw.io](https://github.com/jgraph/drawio).

#### Q. What about AI-powered PPT features?

A. AI PPT is a small, experimental feature—template configuration + AI-generated content + image replacement. It’s not central to PPTist, and the implementation is basic. To make it production-ready, you’d need more templates and a more robust AI workflow. Image replacement is just a method; you must supply your own image source (AI-generated images, stock libraries, etc.).

#### Q. Anything else?

A. Remember, PPTist is an open-source project, not a polished end-user product. It provides technical building blocks; you’re responsible for any product-level enhancements or optimizations.
