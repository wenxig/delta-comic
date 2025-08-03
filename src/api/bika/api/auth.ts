import { PromiseContent } from "@/utils/data"
import type { Gender } from "../user"
import { picapiRest } from ".."


export interface LoginData {
  email: string
  password: string
}
export const login = PromiseContent.fromAsyncFunction((loginData: LoginData, signal?: AbortSignal) => picapiRest.post<{ token: string }>('/auth/sign-in', loginData, { signal }))

export interface SignupData {
  email: string,
  password: string,
  name: string,
  birthday: string,
  gender: Gender,
  answer1: string,
  answer2: string,
  answer3: string,
  question1: string,
  question2: string,
  question3: string
}
export const signUp = PromiseContent.fromAsyncFunction((data: SignupData, signal?: AbortSignal) => picapiRest.post<void>('/auth/register', data, { allowEmpty: true, signal }))
