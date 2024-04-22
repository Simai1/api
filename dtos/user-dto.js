export default class UserDto {
    login;
    id;
    name;
    isActivated;

    constructor(model) {
        this.login = model.login;
        this.id = model.id;
        this.name = model.name;
        this.isActivated = model.isActivated;
    }
}