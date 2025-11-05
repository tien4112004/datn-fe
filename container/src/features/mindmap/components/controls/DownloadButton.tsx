import { Button } from '@/components/ui/button';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 2048;
const imageHeight = 2048;

function DownloadButton({ className }: { className?: string }) {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0.5);

    toPng(document.querySelector('.react-flow__viewport' as any), {
      backgroundColor: 'white',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
      skipFonts: true,
    }).then(downloadImage);
  };

  return (
    <Button variant={'outline'} onClick={onClick} className={className}>
      Download Image
    </Button>
  );
}

export default DownloadButton;
