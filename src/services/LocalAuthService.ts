import {NativeModules} from 'react-native';

import {executeSql} from '../database';

type CredentialHash = {salt: string; hash: string};
type LocalCredentialsModule = {
  createHash(value: string): Promise<CredentialHash>;
  verify(value: string, salt: string, hash: string): Promise<boolean>;
};

const credentials = NativeModules.LocalCredentials as LocalCredentialsModule | undefined;

function crypto(): LocalCredentialsModule {
  if (!credentials) throw new Error('Secure local credential module is unavailable.');
  return credentials;
}

export type AccountSetup = {
  userId: string;
  password: string;
  questionOne: string;
  answerOne: string;
  questionTwo: string;
  answerTwo: string;
};

const normaliseAnswer = (value: string) => value.trim().toLocaleLowerCase();

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must include a letter and a number.';
  return null;
}

export async function hasAccount(): Promise<boolean> {
  const result = await executeSql('SELECT 1 FROM APP_ACCOUNT WHERE id = 1');
  return result.rows.length > 0;
}

export async function createAccount(input: AccountSetup): Promise<void> {
  const userId = input.userId.trim();
  const error = validatePassword(input.password);
  if (!userId) throw new Error('User ID is required.');
  if (error) throw new Error(error);
  if (![input.questionOne, input.questionTwo, input.answerOne, input.answerTwo].every(value => value.trim())) {
    throw new Error('Both security questions and answers are required.');
  }
  if (await hasAccount()) throw new Error('An account has already been created.');
  const [password, answerOne, answerTwo] = await Promise.all([
    crypto().createHash(input.password),
    crypto().createHash(normaliseAnswer(input.answerOne)),
    crypto().createHash(normaliseAnswer(input.answerTwo)),
  ]);
  const timestamp = new Date().toISOString();
  await executeSql(
    `INSERT INTO APP_ACCOUNT (id, user_id, password_salt, password_hash, question_one, answer_one_salt, answer_one_hash, question_two, answer_two_salt, answer_two_hash, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, password.salt, password.hash, input.questionOne.trim(), answerOne.salt, answerOne.hash, input.questionTwo.trim(), answerTwo.salt, answerTwo.hash, timestamp, timestamp],
  );
}

export async function verifyLogin(userId: string, password: string): Promise<boolean> {
  const result = await executeSql('SELECT user_id, password_salt, password_hash FROM APP_ACCOUNT WHERE id = 1');
  if (!result.rows.length || String(result.rows.item(0).user_id) !== userId.trim()) return false;
  const account = result.rows.item(0);
  return crypto().verify(password, String(account.password_salt), String(account.password_hash));
}

export async function getRecoveryQuestions(userId: string): Promise<{one: string; two: string} | null> {
  const result = await executeSql('SELECT user_id, question_one, question_two FROM APP_ACCOUNT WHERE id = 1');
  if (!result.rows.length || String(result.rows.item(0).user_id) !== userId.trim()) return null;
  const account = result.rows.item(0);
  return {one: String(account.question_one), two: String(account.question_two)};
}

export async function resetPassword(userId: string, answerOne: string, answerTwo: string, password: string): Promise<void> {
  const error = validatePassword(password);
  if (error) throw new Error(error);
  const result = await executeSql('SELECT * FROM APP_ACCOUNT WHERE id = 1 AND user_id = ?', [userId.trim()]);
  if (!result.rows.length) throw new Error('Account not found.');
  const account = result.rows.item(0);
  const answers = await Promise.all([
    crypto().verify(normaliseAnswer(answerOne), String(account.answer_one_salt), String(account.answer_one_hash)),
    crypto().verify(normaliseAnswer(answerTwo), String(account.answer_two_salt), String(account.answer_two_hash)),
  ]);
  if (!answers.every(Boolean)) throw new Error('Security answers do not match.');
  const next = await crypto().createHash(password);
  await executeSql('UPDATE APP_ACCOUNT SET password_salt = ?, password_hash = ?, updated_at = ? WHERE id = 1', [next.salt, next.hash, new Date().toISOString()]);
}
