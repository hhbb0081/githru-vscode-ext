export type ListDataType = {
  name: string;
  category: string;
  value: number;
};

export type DataType = {
  listData: ListDataType[];
  columns: string[];
  negative: string;
  positive: string;
  negatives: string[];
  positives: string[];
};
