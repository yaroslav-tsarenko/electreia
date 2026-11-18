/**
 * Central brand identity for electreia / LORDCARE LIMITED.
 * Import from here instead of hardcoding company details in components.
 */

export const brand = {
  name: "electreia",
  displayName: "Electreia",
  domain: "electreia.co.uk",
  url: "https://electreia.co.uk",
  tagline: "Cool precision tech.",
  description:
    "Electreia — a precision-engineered electronics store from LORDCARE LIMITED. Premium gadgets, audio, smart devices and accessories. Shipped from the United Kingdom.",
  applicationName: "Electreia",

  company: {
    legalName: "LORDCARE LIMITED",
    number: "15982435",
    address: {
      line1: "Academy House",
      line2: "11 Dunraven Place",
      city: "Bridgend",
      region: "Mid Glamorgan",
      postcode: "CF31 1JF",
      country: "United Kingdom",
    },
  },

  contact: {
    email: "info@electreia.co.uk",
    emailB2B: "b2b@electreia.co.uk",
    phone: "+44 7463 590620",
    phoneHref: "tel:+447463590620",
  },

  social: {
    twitter: "@electreia",
  },
} as const;

export const brandAddressLine = [
  brand.company.address.line1,
  brand.company.address.line2,
  brand.company.address.city,
  brand.company.address.region,
  brand.company.address.postcode,
  brand.company.address.country,
].join(", ");

export const brandLegalLine = `${brand.company.legalName} · Company No. ${brand.company.number} · ${brand.company.address.line1}, ${brand.company.address.line2}, ${brand.company.address.city}, ${brand.company.address.postcode}, ${brand.company.address.country}`;
