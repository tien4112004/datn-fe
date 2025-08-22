import { ColorPicker, Row, Col, Divider } from 'antd';
import type { ColorPickerProps } from 'antd';
import type { AggregationColor } from 'antd/es/color-picker/color';
import type { PresetsItem } from 'antd/es/color-picker/interface';

const ColorPickerControl = ({
  hex,
  setHex,
  hasPicker = false,
}: {
  hex: string;
  setHex: (color: string) => void;
  hasPicker?: boolean;
}) => {
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

  const customPanelRender: ColorPickerProps['panelRender'] = (_, { components: { Presets, Picker } }) => {
    if (hasPicker) {
      return (
        <Row justify="space-between" wrap={false}>
          <Col span={12}>
            <Presets />
          </Col>
          <Divider type="vertical" style={{ height: 'auto' }} />
          <Col flex="auto">
            <Picker />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row justify="space-between" wrap={false}>
          <Presets />
        </Row>
      );
    }
  };

  return (
    <ColorPicker
      defaultValue={hex}
      styles={{ popupOverlayInner: { width: 'auto' } }}
      presets={presets}
      panelRender={customPanelRender}
      onChange={(color: AggregationColor) => {
        setHex(color.toHexString());
      }}
    />
  );
};

export default ColorPickerControl;
