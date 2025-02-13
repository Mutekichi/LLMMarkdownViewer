import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type Data = {
  message: string;
};

type ErrorData = {
  error: string;
};

const checkEnv = () => {
  const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
    'TO_EMAIL',
  ];
  const missingEnv = requiredEnv.filter((env) => !(env in process.env));

  if (missingEnv.length) {
    throw new Error(`環境変数が不足しています: ${missingEnv.join(', ')}`);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorData>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    checkEnv();

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'empty message' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: 'Feedback on LLM markdown viewer',
      text: `
        New message from LLM markdown viewer:
        ${message}
      `,
    });

    res.status(200).json({ message: 'メールが送信されました' });
  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'メール送信に失敗しました',
    });
  }
}
