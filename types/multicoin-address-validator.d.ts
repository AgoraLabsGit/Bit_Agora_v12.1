declare module 'multicoin-address-validator' {
  interface ValidatorOptions {
    networkType?: 'prod' | 'testnet' | 'both'
  }

  const WAValidator: {
    validate: (address: string, symbol: string, options?: ValidatorOptions) => boolean
    getAddressType: (address: string) => string | null
  }

  export default WAValidator
} 