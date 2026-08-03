import React from 'react';

/** 筛选区「查询」回调，供关键词框回车 / 搜索图标触发 */
export type FilterSearchContextValue = {
  onSearch?: () => void;
};

export const FilterSearchContext =
  React.createContext<FilterSearchContextValue>({});

export function useFilterSearch() {
  return React.useContext(FilterSearchContext);
}
