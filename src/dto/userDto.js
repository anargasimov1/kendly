export class UserDto {
    id;
    name;
    email;
    phone;
    dateTime;
    orders;
    role;
    addresses;
    following;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.phone = user.phone;
        this.dateTime = user.created_at;
        this.orders = user.Orders;
        this.role = user.role;
        this.addresses = user.addresses;
        this.following = user.Following;
    }
}