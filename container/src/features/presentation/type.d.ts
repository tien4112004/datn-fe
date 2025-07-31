import '@tanstack/react-table';

declare module 'vueRemote/Editor';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    style: {
      className: string;
      align: 'left' | 'center' | 'right';
    };
  }
}
