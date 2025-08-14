import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { PromiseContent } from "@/utils/data"
export namespace _jmApiAuth {
  export const login = PromiseContent.fromAsyncFunction((data: JmType.auth.LoginData, signal?: AbortSignal) => importJm(jm => jm.api.rest.postForm<JmType.user.RawUserMe>('/login', data, { signal }).then(v => new jm.user.UserMe(v))))
  export const signUp = PromiseContent.fromAsyncFunction((data: JmType.auth.SignupData, signal?: AbortSignal) => importJm(jm => jm.api.rest.post('/register', data, { signal, params: data })))
}