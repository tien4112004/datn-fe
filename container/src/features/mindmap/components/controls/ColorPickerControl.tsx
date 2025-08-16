import { ColorPicker, Row } from 'antd';
import type { ColorPickerProps } from 'antd';
import type { AggregationColor } from 'antd/es/color-picker/color';
import type { PresetsItem } from 'antd/es/color-picker/interface';

const ColorPickerControl = ({ hex, setHex }: { hex: string; setHex: (color: string) => void }) => {
  const presets: PresetsItem[] = [
    {
      label: 'Primary Colors',
      colors: ['#1677ff', '#ff4d4f', '#52c41a', '#faad14', '#722ed1'],
      defaultOpen: true,
    },
    {
      label: 'Secondary Colors',
      colors: ['#f5222d', '#fa8c16', '#fa541c', '#13c2c2', '#1890ff'],
      defaultOpen: true,
    },
  ];

  const customPanelRender: ColorPickerProps['panelRender'] = (_, { components: { Presets } }) => (
    <Row justify="space-between" wrap={false}>
      <Presets />
    </Row>
  );

  return (
    <ColorPicker
      defaultValue={hex}
      styles={{ popupOverlayInner: { width: 240 } }}
      presets={presets}
      panelRender={customPanelRender}
      onChange={(color: AggregationColor) => {
        setHex(color.toHexString());
      }}
    />
  );
};

export default ColorPickerControl;
