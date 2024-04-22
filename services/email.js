import { createTransport } from 'nodemailer';
import templates from '../config/email-templates.js';

const address = process.env.MAIL_USER;
const smtp = createTransport({
    host: 'outlook.office365.com',
    port: 587,
    secure: false,
    auth: { user: address, pass: process.env.MAIL_PASS },
});

export default function (to, type, ...arg) {
    if (!to) return;
    if (!type) throw new Error('type not specified');

    const replacement = templates[type];
    if (!replacement) throw new Error('not exists');

    const mail = {
        from: { name: 'Messanger Service', address },
        to,
        subject: replacement.subject,
        generateTextFromHTML: true,
        html: replacement.template(...arg),
    };

    if (process.env.NODE_ENV !== 'production') console.log(mail);
    if (address) smtp.sendMail(mail);
}
