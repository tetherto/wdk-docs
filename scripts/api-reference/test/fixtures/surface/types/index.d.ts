/** Literal policy words. */
export type WordCount = 12 | 24
/** Grouped union array. */
export type Values = (string | number)[]
/** A callback with an async result. */
export type Callback = (value: string, attempts?: number) => Promise<12 | 24>
/** A labeled tuple with an optional item. */
export type Position = [name: string, value?: number]
export class Parent {
  inherited(input: number): number
}
export default class Account extends Parent {
  balance: number
  static label: string
  send(value: string | number): Promise<string>
}
export { Account as Renamed } from './named.js'
export function echo(value: string): string
export const WORDS: 12 | 24
