import { DataTypes, Model } from "sequelize";

export default class TokenModel extends Model {
    static initialize(sequelize) {
        TokenModel.init(
            {
                isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
                refreshToken: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                schema: 'public',
                modelName: 'TokenModel',
                tableName: 'token-model',
                paranoid: true,
            }
        );
    }
}

