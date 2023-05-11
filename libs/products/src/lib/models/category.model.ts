export class Category {
  constructor(
    public _id: string,
    public name: string,
    public icon: string,
    public color: string,
    public checked: boolean,
    public id?: string
    ) {}
}
