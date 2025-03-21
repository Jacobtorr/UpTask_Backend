import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirm Account',
            text: 'UpTask - Confirm Account',
            html: `<p>Hello ${user.name}, you have just created your account on UpTask, it's almost done, you just need to confirm your account </p>
                <p>Click the following link: </p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account</a>
                <p>Your code is: <b>${user.token}</b></p>
                <p>This token will expire in 10 minutes</p>
            `
        })
        console.log('Message sent', info.messageId)
    }

    static senPasswordResetToken = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Reset your password',
            text: 'UpTask - Reset your password',
            html: `<p>Hello ${user.name}, You have requested a new password</p>
                <p>Click the following link: </p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
                <p>Your code is: <b>${user.token}</b></p>
                <p>This token will expire in 10 minutes</p>
            `
        })
        console.log('Message sent', info.messageId)
    }

}