import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "name", "sku", "price", "comparePrice", "quantity", "description",
    "shortDescription", "category", "subCategory", "subSubCategory",
    "brand", "weight", "status", "imageUrl", "gtin", "ean", "mpn",
    "googleCategory", "condition", "characteristics",
  ];

  const sampleRow = [
    "Unisex Organic Cotton Tee", "SKU-001", "24.50", "29.99", "100",
    "Soft midweight jersey, side-seamed for a modern fit. GOTS-certified organic cotton, printed and finished in the EU.",
    "Midweight organic tee. Regular fit. Unisex sizing.",
    "Men", "T-shirts", "",
    "Stanley/Stella", "0.18", "ACTIVE", "", "", "", "", "Apparel & Accessories > Clothing > Shirts & Tops", "new",
    "Material>>Fabric:100% organic cotton|Material>>Weight:180 g/m²|Fit>>Cut:Regular unisex fit|Care>>Wash:Machine wash cold, tumble dry low|Origin>>Country:EU",
  ];

  const csv = [headers.join(","), sampleRow.join(",")].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=import-template.csv",
    },
  });
}
