import { Category } from "./category.model";

export class Product {
  constructor(
    public _id: string,
    public name: string,
    public author: string,
    public richDescription: string,
    public description: string,
    public image: string,
    public images: any[],
    public brand: string,
    public price: string | number,
    public mrpPrice: string | number,
    public currentPrice: string | number,
    public currency: string,
    public countInStock: number | string,
    public rating: number,
    public numReviews: number,
    public isFeatured: boolean,
    public dateCreated: Date | string,
    public category: Category,
    public categories: string[],
    public reviews: Array<any>,
    public id?: string
  ) { }
}
