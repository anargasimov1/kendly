export class UserDto {
    id;
    name;
    email;
    dateTime;
    orders;
    role;
    addresses;
    following;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.dateTime = user.created_at;
        this.orders = user.Orders;
        this.role = user.role;
        this.addresses = user.addresses;
        this.following = user.Following;
    }
}