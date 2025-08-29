import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    style: {
      className: string;
      align: 'left' | 'center' | 'right';
    };
    meta: {
      isGrow?: boolean;
      widthPercentage?: number;
    };
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    isGrow?: boolean;
    widthPercentage?: number;
  }
}
