export class UserDto {
    id;
    name;
    email;
    dateTime;
    orders;
    role;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.dateTime = user.created_at;
        this.orders = user.Orders;
        this.role = user.role;
    }
}