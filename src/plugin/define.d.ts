export namespace Plugin {
  export class Struct<TRaw extends object> {
    toJSON(): TRaw
    constructor(value: TRaw): any
  }
}