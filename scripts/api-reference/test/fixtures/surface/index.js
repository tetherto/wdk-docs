/** A parent with a public inherited operation. */
export class Parent {
  /** @param {number} input @returns {number} */
  inherited(input) { return input }
}

/** A wallet-like public class. */
export default class Account extends Parent {
  /** @type {number} */
  balance = 0
  /** @type {string} */
  static label = 'account'
  /** @param {string | number} value @returns {Promise<string>} */
  async send(value) { return String(value) }
}

/** A named alias of the default export. */
export { Account as Renamed } from './named.js'

/** @param {string} value @returns {string} */
export function echo(value) { return value }
/** @type {12 | 24} */
export const WORDS = 12
