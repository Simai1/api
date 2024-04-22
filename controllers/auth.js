import User from "../models/user.js";
import {AppErrorAlreadyExists, AppErrorInvalid, AppErrorMissing} from "../utils/errors.js";
import jwt from '../utils/jwt.js';
import { v4 } from 'uuid';
import sendMail from '../services/email.js';
import UserDto from '../dtos/user-dto.js';

export default {
    async register({body: {login, password, name}}, res){
        if (!login) throw new AppErrorMissing("login");
        if (!password) throw new AppErrorMissing("password");
        if (!name) throw new AppErrorMissing('name');

        if (name.length <= 3 || name.length >= 15) throw new AppErrorInvalid('name');
        if (login.length <= 3) throw new AppErrorInvalid("login");
        if (password.length <= 3) throw new AppErrorInvalid("password");

        const CheckUser = await User.findOne({ where: { login } });
        if (CheckUser) throw new AppErrorAlreadyExists("user");

        const activationLink = v4();

        const user = await User.create({
            login,
            password,
            name,
            activationLink
        });

        sendMail(login, 'registration', process.env.API_URL + '/auth/activate/' + activationLink);
        const userDto = new UserDto(user);
        const {accessToken, refreshToken} = jwt.generate({ ...userDto });
        await jwt.saveToken(userDto.id, refreshToken);

        res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.json({
            'accessToken': accessToken,
            'refreshToken': refreshToken,
            'user': userDto,
        });
    },

    async login({ body: { login, password } }, res){
        if (!login) throw new AppErrorMissing("login");
        if (!password) throw new AppErrorMissing("password");

        const user = await User.findOne({ where: { login: login } });
        if (!user || !user.validatePassword(password)) throw new AppErrorInvalid("login or password");
        if (!user) throw new AppErrorInvalid("login or password");

        const userDto = new UserDto(user);
        const {accessToken, refreshToken} = jwt.generate({ ...userDto });
        await jwt.saveToken(userDto.id, refreshToken);

        res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.json({
            'accessToken': accessToken,
            'refreshToken': refreshToken,
            'user': userDto,
        });
    },

    async logout(req, res){
        const { refreshToken } = req.cookies;
        await jwt.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        res.json({ status: 'OK' });
    },

    async activate({ params: { link } }, res){
        const user = await User.findOne({ where: { activationLink: link } });
        if (!user) throw new AppErrorInvalid('link');
        await user.update({ isActivated: true });
        res.redirect(process.env.WEB_URL);
    },

    async refresh(req, res){
        const { refreshToken } = req.cookies;
        if (!refreshToken) throw new Error('Unauthorized');

        const userData = jwt.verifyRefreshToken(refreshToken);
        const tokenFromDb = await jwt.findToken(refreshToken);
        if (!userData || !tokenFromDb)  throw new Error('Unauthorized');

        const user = await User.findByPk(userData.id);
        const userDto = new UserDto(user);
        const tokens = jwt.generate({ ...userDto });
        await jwt.saveToken(userDto.id, tokens.refreshToken);

        res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.json({
            'accessToken': tokens.accessToken,
            'refreshToken': tokens.refreshToken,
            'user': userDto,
        });
    },

    async getUsers(req, res){},
}