export class User {
  constructor(public _id: string,
    public name: string,
    public email: string,
    public phone: string | number,
    public isAdmin: boolean,
    public address: {
      street: string,
      apartment: string,
      city: string,
      zip: string,
      country: string
    },
    public id?: string,
    public token?: string
  ) { }
}
