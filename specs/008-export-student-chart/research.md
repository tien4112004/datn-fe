# Research: Export React Component to Image

## Decision

We will use the `html-to-image` library to export the student chart component to a PNG image.

## Rationale

- **Performance**: `html-to-image` is a lightweight and fast library, which is important for a good user experience.
- **Accuracy**: It uses a different approach than `html2canvas` that can lead to more accurate rendering of modern CSS.
- **Maintenance**: It's an actively maintained fork of the popular `dom-to-image` library.
- **Ease of use**: The API is straightforward and easy to integrate with React components using refs.

## Alternatives Considered

- **`html2canvas`**: While popular, it can be slower and less accurate with complex CSS.
- **`dom-to-image-more`**: Another fork of `dom-to-image`, but `html-to-image` appears to have more traction and is positioned as a more modern solution.
