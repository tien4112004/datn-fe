import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    style: {
      className: string;
      align: 'left' | 'center' | 'right';
    };
    isGrow?: boolean;
    widthPercentage?: number;
    fixedWidth?: number; // 0 stands for "fit-content"
  }
}
