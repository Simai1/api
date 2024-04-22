import { DataTypes, Model } from "sequelize";
import bcrypt from 'bcrypt';

export default class User extends Model {
    static initialize(sequelize) {
        User.init(
            {
                login: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: 'login',
                    validate: { isEmail: { msg: 'Must be a valid email address' } },
                },
                password: { type: DataTypes.STRING, allowNull: false },
                name: { type: DataTypes.STRING, allowNull: false },
                isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
                activationLink: { type: DataTypes.STRING },
            },
            {
                sequelize,
                schema: 'public',
                modelName: 'User',
                tableName: 'users',
                paranoid: true,
            }
        );

        function beforeCU(user){
            user.set('password', bcrypt.hashSync(user.password, bcrypt.genSaltSync()));
        }

        User.beforeCreate(beforeCU);
    }

    validatePassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

