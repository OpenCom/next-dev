import { GridRenderCellParams } from "@mui/x-data-grid";

export const valueFormatterCurrency = (params: GridRenderCellParams | number) => {
    //const value = typeof params === 'number' ? params : params.value;
    const value = params as number;
    if (value == null) return '';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(Number(value))
}

export const valueGetterToDate = (params: any) => {
    return params ? new Date(params) : null;
}


export const valueFormatterNumber = (params: GridRenderCellParams) => {
    if (!params) return '';
    return new Intl.NumberFormat('it-IT', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).format(Number(params));
}

export const valueFormatterDate = (params: GridRenderCellParams | string) => {
  //const value = typeof params === 'string' ? params : params.value;
  const value = params as string;
  if (!value) return '';
  return new Date(value).toLocaleDateString('it-IT');
};