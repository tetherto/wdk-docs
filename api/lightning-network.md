# API: Lightning Network Support

Work with the Lightning Network (Spark) for fast, low-fee Bitcoin payments.

---

## Create Lightning Invoice
```javascript
const invoice = await sparkAccount.createLightningInvoice({
  value: 1000,
  memo: "Test invoice"
});
console.log("Lightning invoice:", invoice.id);
```

## Pay Lightning Invoice
```javascript
const payment = await sparkAccount.payLightningInvoice({
  invoice: "lnbc...",
  maxFeeSats: 5
});
console.log("Payment successful:", payment);
```

---

See also: [Transaction Management](transaction-management.md) | [API Reference](../api-reference.md) 