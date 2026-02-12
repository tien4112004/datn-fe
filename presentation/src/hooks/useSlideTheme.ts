import tinycolor from 'tinycolor2';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { Slide, SlideTheme } from '@/types/slides';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import { getLineElementLength } from '@/utils/element';

interface ThemeValueWithArea {
  area: number;
  value: string;
}

export default () => {
  const slidesStore = useSlidesStore();
  const { slides, theme } = storeToRefs(slidesStore);

  const { addHistorySnapshot } = useHistorySnapshot();

  // Get the main theme styles within the specified slide and sort them by their proportion
  const getSlidesThemeStyles = (slide: Slide | Slide[]) => {
    const slides = Array.isArray(slide) ? slide : [slide];

    const backgroundColorValues: ThemeValueWithArea[] = [];
    const themeColorValues: ThemeValueWithArea[] = [];
    const fontColorValues: ThemeValueWithArea[] = [];
    const fontNameValues: ThemeValueWithArea[] = [];

    for (const slide of slides) {
      if (slide.background) {
        if (slide.background.type === 'solid' && slide.background.color) {
          backgroundColorValues.push({
            area: 1,
            value: slide.background.color,
          });
        } else if (slide.background.type === 'gradient' && slide.background.gradient) {
          const len = slide.background.gradient.colors.length;
          backgroundColorValues.push(
            ...slide.background.gradient.colors.map((item) => ({
              area: 1 / len,
              value: item.color,
            }))
          );
        } else
          backgroundColorValues.push({
            area: 1,
            value: typeof theme.value.backgroundColor === 'string' ? theme.value.backgroundColor : '#ffffff',
          });
      }
      for (const el of slide.elements) {
        const elWidth = el.width;
        let elHeight = 0;
        if (el.type === 'line') {
          const [startX, startY] = el.start;
          const [endX, endY] = el.end;
          elHeight = Math.sqrt(Math.pow(Math.abs(startX - endX), 2) + Math.pow(Math.abs(startY - endY), 2));
        } else elHeight = el.height;

        const area = elWidth * elHeight;

        if (el.type === 'shape' || el.type === 'text') {
          if (el.fill) {
            themeColorValues.push({ area, value: el.fill });
          }
          if (el.type === 'shape' && el.gradient) {
            const len = el.gradient.colors.length;
            themeColorValues.push(
              ...el.gradient.colors.map((item) => ({
                area: (1 / len) * area,
                value: item.color,
              }))
            );
          }

          const text = (el.type === 'shape' ? el.text?.content : el.content) || '';
          if (!text) continue;

          const plainText = text.replace(/<[^>]+>/g, '').replace(/\s*/g, '');
          const matchForColor = text.match(/<[^>]+color: .+?<\/.+?>/g);
          const matchForFont = text.match(/<[^>]+font-family: .+?<\/.+?>/g);

          let defaultColorPercent = 1;
          let defaultFontPercent = 1;

          if (matchForColor) {
            for (const item of matchForColor) {
              const ret = item.match(/color: (.+?);/);
              if (!ret) continue;
              const text = item.replace(/<[^>]+>/g, '').replace(/\s*/g, '');
              const color = ret[1];
              const percentage = text.length / plainText.length;
              defaultColorPercent = defaultColorPercent - percentage;

              fontColorValues.push({
                area: area * percentage,
                value: color,
              });
            }
          }
          if (matchForFont) {
            for (const item of matchForFont) {
              const ret = item.match(/font-family: (.+?);/);
              if (!ret) continue;
              const text = item.replace(/<[^>]+>/g, '').replace(/\s*/g, '');
              const font = ret[1];
              const percentage = text.length / plainText.length;
              defaultFontPercent = defaultFontPercent - percentage;

              fontNameValues.push({
                area: area * percentage,
                value: font,
              });
            }
          }

          if (defaultColorPercent) {
            const _defaultColor = el.type === 'shape' ? el.text?.defaultColor : el.defaultColor;
            const defaultColor = _defaultColor || theme.value.fontColor;
            fontColorValues.push({
              area: area * defaultColorPercent,
              value: defaultColor,
            });
          }
          if (defaultFontPercent) {
            const _defaultFont = el.type === 'shape' ? el.text?.defaultFontName : el.defaultFontName;
            const defaultFont = _defaultFont || theme.value.fontName;
            fontNameValues.push({
              area: area * defaultFontPercent,
              value: defaultFont,
            });
          }
        } else if (el.type === 'table') {
          const cellCount = el.data.length * el.data[0].length;
          let cellWithFillCount = 0;
          for (const row of el.data) {
            for (const cell of row) {
              if (cell.style?.backcolor) {
                cellWithFillCount += 1;
                themeColorValues.push({
                  area: area / cellCount,
                  value: cell.style?.backcolor,
                });
              }
              if (cell.text) {
                const percent = cell.text.length >= 10 ? 1 : cell.text.length / 10;
                if (cell.style?.color) {
                  fontColorValues.push({
                    area: (area / cellCount) * percent,
                    value: cell.style?.color,
                  });
                }
                if (cell.style?.fontname) {
                  fontColorValues.push({
                    area: (area / cellCount) * percent,
                    value: cell.style?.fontname,
                  });
                }
              }
            }
          }
          if (el.theme) {
            const percent = 1 - cellWithFillCount / cellCount;
            themeColorValues.push({
              area: area * percent,
              value: el.theme.color,
            });
          }
        } else if (el.type === 'chart') {
          if (el.fill) {
            themeColorValues.push({ area: area * 0.6, value: el.fill });
          }
          if (el.themeColors[0]) {
            themeColorValues.push({ area: area * 0.3, value: el.themeColors[0] });
          }
          for (const color of el.themeColors) {
            if (tinycolor(color).getAlpha() !== 0) {
              themeColorValues.push({ area: (area / el.themeColors.length) * 0.1, value: color });
            }
          }
        } else if (el.type === 'line') {
          themeColorValues.push({ area, value: el.color });
        } else if (el.type === 'audio') {
          themeColorValues.push({ area, value: el.color });
        } else if (el.type === 'latex') {
          fontColorValues.push({ area, value: el.color });
        }
      }
    }

    const backgroundColors: { [key: string]: number } = {};
    for (const item of backgroundColorValues) {
      const color = tinycolor(item.value).toRgbString();
      if (color === 'rgba(0, 0, 0, 0)') continue;
      if (!backgroundColors[color]) backgroundColors[color] = item.area;
      else backgroundColors[color] += item.area;
    }

    const themeColors: { [key: string]: number } = {};
    for (const item of themeColorValues) {
      const color = tinycolor(item.value).toRgbString();
      if (color === 'rgba(0, 0, 0, 0)') continue;
      if (!themeColors[color]) themeColors[color] = item.area;
      else themeColors[color] += item.area;
    }

    const fontColors: { [key: string]: number } = {};
    for (const item of fontColorValues) {
      const color = tinycolor(item.value).toRgbString();
      if (color === 'rgba(0, 0, 0, 0)') continue;
      if (!fontColors[color]) fontColors[color] = item.area;
      else fontColors[color] += item.area;
    }

    const fontNames: { [key: string]: number } = {};
    for (const item of fontNameValues) {
      if (!fontNames[item.value]) fontNames[item.value] = item.area;
      else fontNames[item.value] += item.area;
    }

    return {
      backgroundColors: Object.keys(backgroundColors).sort(
        (a, b) => backgroundColors[b] - backgroundColors[a]
      ),
      themeColors: Object.keys(themeColors).sort((a, b) => themeColors[b] - themeColors[a]),
      fontColors: Object.keys(fontColors).sort((a, b) => fontColors[b] - fontColors[a]),
      fontNames: Object.keys(fontNames).sort((a, b) => fontNames[b] - fontNames[a]),
    };
  };

  // Get the main colors within the specified slide (ignoring transparency) and sort by color area
  const getSlideAllColors = (slide: Slide) => {
    const colorMap: { [key: string]: number } = {};

    const record = (color: string, area: number) => {
      const _color = tinycolor(color).setAlpha(1).toRgbString();
      if (!colorMap[_color]) colorMap[_color] = area;
      else colorMap[_color] = colorMap[_color] + area;
    };

    for (const el of slide.elements) {
      const width = el.width;
      const height = el.type === 'line' ? getLineElementLength(el) : el.height;
      const area = width * height;

      if (el.type === 'shape' && tinycolor(el.fill).getAlpha() !== 0) {
        record(el.fill, area);
      }
      if (el.type === 'text' && el.fill && tinycolor(el.fill).getAlpha() !== 0) {
        record(el.fill, area);
      }
      if (el.type === 'image' && el.colorMask && tinycolor(el.colorMask).getAlpha() !== 0) {
        record(el.colorMask, area);
      }
      if (el.type === 'table' && el.theme && tinycolor(el.theme.color).getAlpha() !== 0) {
        record(el.theme.color, area);
      }
      if (el.type === 'chart') {
        for (const color of el.themeColors) {
          if (tinycolor(color).getAlpha() !== 0) {
            record(color, (area / el.themeColors.length) * 0.1);
          }
        }
        if (el.themeColors[0] && tinycolor(el.themeColors[0]).getAlpha() !== 0)
          record(el.themeColors[0], area * 0.3);
        if (el.fill && tinycolor(el.fill).getAlpha() !== 0) record(el.fill, area * 0.6);
      }
      if (el.type === 'line' && tinycolor(el.color).getAlpha() !== 0) {
        record(el.color, area);
      }
      if (el.type === 'audio' && tinycolor(el.color).getAlpha() !== 0) {
        record(el.color, area);
      }
    }
    const colors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);
    return colors;
  };

  // Create a mapping table between original colors and new colors
  const createSlideThemeColorMap = (slide: Slide, _newColors: string[]): { [key: string]: string } => {
    const newColors = [..._newColors];
    const oldColors = getSlideAllColors(slide);
    const themeColorMap: { [key: string]: string } = {};

    if (oldColors.length > newColors.length) {
      const analogous = tinycolor(newColors[0]).analogous(oldColors.length - newColors.length + 10);
      const otherColors = analogous.map((item) => item.toHexString()).slice(1);
      newColors.push(...otherColors);
    }
    for (let i = 0; i < oldColors.length; i++) {
      themeColorMap[oldColors[i]] = newColors[i];
    }

    return themeColorMap;
  };

  // Set slide theme
  const setSlideTheme = (slide: Slide, theme: SlideTheme) => {
    const colorMap = createSlideThemeColorMap(slide, theme.themeColors);

    const getColor = (color: string) => {
      const alpha = tinycolor(color).getAlpha();
      const _color = colorMap[tinycolor(color).setAlpha(1).toRgbString()];
      return _color ? tinycolor(_color).setAlpha(alpha).toRgbString() : color;
    };

    if (!slide.background || slide.background.type !== 'image') {
      if (typeof theme.backgroundColor === 'string') {
        slide.background = {
          type: 'solid',
          color: theme.backgroundColor,
        };
      } else {
        slide.background = {
          type: 'gradient',
          gradient: theme.backgroundColor,
        };
      }
    }
    for (const el of slide.elements) {
      if (el.type === 'shape') {
        if (el.fill) el.fill = getColor(el.fill);
        if (el.gradient) delete el.gradient;
        if (el.text) {
          el.text.defaultColor = theme.fontColor;
          el.text.defaultFontName = theme.fontName;
          if (el.text.content) {
            el.text.content = el.text.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
          }
        }
      }
      if (el.type === 'text') {
        if (el.fill) el.fill = getColor(el.fill);
        el.defaultColor = theme.fontColor;
        el.defaultFontName = theme.fontName;

        // Handle label text types
        if (el.textType === 'itemTitle' || el.textType === 'itemNumber' || el.textType === 'partNumber') {
          el.defaultColor = theme.fontColor;
          el.defaultFontName = theme.fontName;
        }

        if (el.content) {
          el.content = el.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
        }
      }
      if (el.type === 'image' && el.colorMask) {
        el.colorMask = getColor(el.colorMask);
      }
      if (el.type === 'table') {
        if (el.theme) el.theme.color = getColor(el.theme.color);
        for (const rowCells of el.data) {
          for (const cell of rowCells) {
            if (cell.style) {
              cell.style.color = theme.fontColor;
              cell.style.fontname = theme.fontName;
            }
          }
        }
      }
      if (el.type === 'chart') {
        el.themeColors = [...theme.themeColors];
        el.textColor = theme.fontColor;
      }
      if (el.type === 'line') el.color = getColor(el.color);
      if (el.type === 'audio') el.color = getColor(el.color);
      if (el.type === 'latex') el.color = theme.fontColor;

      if ('outline' in el && el.outline) {
        el.outline.color = theme.outline.color;
      }
    }
  };

  // Apply preset theme
  const applyPresetTheme = (theme: SlideTheme, resetSlides = false) => {
    slidesStore.setTheme({
      ...theme,
    });

    if (resetSlides) {
      const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value));
      for (const slide of newSlides) {
        setSlideTheme(slide, theme);
      }
      slidesStore.setSlides(newSlides);
      addHistorySnapshot();
    }
  };

  // Apply current theme configuration to all pages
  const applyThemeToAllSlides = (applyAll = false) => {
    const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value));
    const {
      themeColors,
      backgroundColor,
      fontColor,
      fontName,
      outline,
      shadow,
      titleFontColor,
      titleFontName,
      labelFontColor,
      labelFontName,
    } = theme.value;

    for (const slide of newSlides) {
      if (!slide.background || slide.background.type !== 'image') {
        slide.background = {
          type: 'solid',
          color: typeof backgroundColor === 'string' ? backgroundColor : '#ffffff',
        };
      }

      for (const el of slide.elements) {
        if (applyAll) {
          if ('outline' in el && el.outline) el.outline = outline;
          if ('shadow' in el && el.shadow) el.shadow = shadow;
        }

        if (el.type === 'shape') {
          const alpha = tinycolor(el.fill).getAlpha();
          if (alpha > 0) el.fill = themeColors[0];
          if (el.text) {
            el.text.defaultColor = fontColor;
            el.text.defaultFontName = fontName;
            if (el.text.content) {
              el.text.content = el.text.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
            }
          }
          if (el.gradient) delete el.gradient;
        } else if (el.type === 'line') el.color = themeColors[0];
        else if (el.type === 'text') {
          if (el.fill) {
            const alpha = tinycolor(el.fill).getAlpha();
            if (alpha > 0) el.fill = themeColors[0];
          }
          if (el.textType !== 'title') {
            el.defaultColor = fontColor;
            el.defaultFontName = fontName;
          } else {
            el.defaultColor = titleFontColor;
            el.defaultFontName = titleFontName;
          }

          // Handle label text types
          if (el.textType === 'itemTitle' || el.textType === 'itemNumber' || el.textType === 'partNumber') {
            el.defaultColor = labelFontColor || fontColor;
            el.defaultFontName = labelFontName || fontName;
          }

          if (el.content) {
            el.content = el.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
          }
        } else if (el.type === 'table') {
          if (el.theme) el.theme.color = themeColors[0];
          for (const rowCells of el.data) {
            for (const cell of rowCells) {
              if (cell.style) {
                cell.style.color = fontColor;
                cell.style.fontname = fontName;
              }
            }
          }
        } else if (el.type === 'chart') {
          el.themeColors = themeColors;
          el.textColor = fontColor;
        } else if (el.type === 'latex') el.color = fontColor;
        else if (el.type === 'audio') el.color = themeColors[0];
      }
    }
    slidesStore.setSlides(newSlides);
    addHistorySnapshot();
  };

  // Unify font
  const applyFontToAllSlides = (fontname: string) => {
    const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value));

    for (const slide of newSlides) {
      for (const el of slide.elements) {
        if (el.type === 'shape') {
          if (el.text) {
            el.text.defaultFontName = fontname;
            if (el.text.content)
              el.text.content = el.text.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
          }
        }
        if (el.type === 'text') {
          el.defaultFontName = fontname;
          if (el.content)
            el.content = el.content.replace(/color: .+?;/g, '').replace(/font-family: .+?;/g, '');
        }
        if (el.type === 'table') {
          for (const rowCells of el.data) {
            for (const cell of rowCells) {
              if (cell.style) {
                cell.style.fontname = fontname;
              }
            }
          }
        }
      }
    }
    slidesStore.setSlides(newSlides);
    addHistorySnapshot();
  };

  return {
    getSlidesThemeStyles,
    applyPresetTheme,
    applyThemeToAllSlides,
    applyFontToAllSlides,
  };
};
