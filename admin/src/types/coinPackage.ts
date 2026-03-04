export interface CoinPackage {
  id: string;
  name: string;
  coin: number;
  price: number;
  bonus: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoinPackageCreateRequest {
  name: string;
  coin: number;
  price: number;
  bonus: number;
}

export type CoinPackageUpdateRequest = Partial<CoinPackageCreateRequest>;
