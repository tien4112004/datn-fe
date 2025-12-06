import { useCallback } from 'react';
import { toPng } from 'html-to-image';

type UseExportStudentChartOptions = {
  filename?: string;
};

export const useExportStudentChart = (options: UseExportStudentChartOptions = {}) => {
  const { filename = 'student-chart.png' } = options;

  const exportChart = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID "${elementId}" not found`);
        return;
      }

      // Generate PNG image from the element
      element.style.border = 'none';
      toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: 'white',
        skipFonts: true,
      })
        .then((dataUrl) => {
          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error('Failed to export student chart:', error);
          throw error;
        });
    },
    [filename]
  );

  return { exportChart };
};
