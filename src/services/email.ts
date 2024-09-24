import nodemailer from "nodemailer";
import {
  EMAIL_SERVICE_SMTP,
  HOST_SERVICE_SMTP,
  PASS_SERVICE_SMTP,
  PORT_SERVICE_SMTP,
} from "../env";

const portSMTP = Number(PORT_SERVICE_SMTP);

const transporter = nodemailer.createTransport({
  host: HOST_SERVICE_SMTP,
  port: portSMTP,
  secure: portSMTP == 465,
  auth: {
    user: EMAIL_SERVICE_SMTP,
    pass: PASS_SERVICE_SMTP,
  },
});

export const sendCodeEmail = async (email: string, code: number) => {
  await transporter.sendMail({
    from: 'GitGame "Code for Recovery Password" <maddison53@ethereal.email>',
    to: email,
    subject: "Code verify for GitGame",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Redefinição de Senha</h2>
        <p>Você solicitou a redefinição da sua senha. Utilize o código abaixo para completar o processo:</p>
        <p style="font-size: 24px; font-weight: bold;">Código: <span style="color: blue;">${code}</span></p>
        <p>Este código é válido por 24 horas. Se você não solicitou esta alteração, ignore este e-mail.</p>
        <p>Obrigado,</p>
        <p>Equipe GitGame</p>
      </div>
    `,
  });
};

export const sendValidateUser = async (email: string, link: string) => {
  await transporter.sendMail({
    from: 'GitGame "Link for vincule account" <maddison53@ethereal.email>',
    to: email,
    subject: "Link for vincule account",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Vinculo de conta</h2>
        <p>Para salvar o progresso é necessário criar um novo usuário</p>
        <p>Confirme se deseja a criação desse usuário com esse email apertando no link abaixo, ao qual criará sua conta e te enviará de volta ao jogo</p>
        <p style="font-size: 24px; font-weight: bold;">Link: <span style="color: blue;">${link}</span></p>
        <p>Este link é válido por 24 horas. Se você não solicitou esse link, ignore este e-mail.</p>
        <p>Obrigado,</p>
        <p>Equipe GitGame</p>
      </div>
    `,
  });
};
