import type { _bikaUser } from "./user"

export namespace _bikaAuth {
  export interface LoginData {
    email: string
    password: string
  }
  export interface SignupData {
    email: string,
    password: string,
    name: string,
    birthday: string,
    gender: _bikaUser.Gender,
    answer1: string,
    answer2: string,
    answer3: string,
    question1: string,
    question2: string,
    question3: string
  }
  export const _ = null
}