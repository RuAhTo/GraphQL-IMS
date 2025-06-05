# GraphQL Industry Management System (IMS)

Detta projekt är en GraphQL-baserad Industry Management System (IMS)-server byggd med Node.js, TypeScript, Apollo Server och MongoDB via Mongoose.

## Installation


1. **Installera beroenden**
   ```bash
   npm install
   ```

2. **Skapa en `.env`-fil i projektroten**
   Lägg till följande innehåll i filen:

   ```
   MONGODB_URI=<din-mongodb-anslutningssträng>
   PORT=4000
   ```

   > Tips: Om du använder [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), kan du kopiera URI-strängen från din cluster-översikt. Exempel:
   > ```
   > MONGODB_URI=mongodb+srv://användarnamn:lösenord@cluster0.mongodb.net/databasnamn?retryWrites=true&w=majority
   > ```

3. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

   Servern kommer som standard köra på [http://localhost:4000](http://localhost:4000) – eller den port du angivit i `.env`.

---

## GraphQL Requests

Alla färdiga queries och mutationer finns i:

```
./requests/requests.graphql
```

---

## Exempel

```graphql
# Hämta alla produkter
query {
  products {
    id
    name
    sku
  }
}

# Lägg till en ny produkt
mutation {
  addProduct(input: { name: "...", ... }) {
    id
    name
  }
}
```

Fler exempel hittar du i `./requests/requests.graphql`.
